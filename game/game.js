"use strict";
var Game = {
	entities: [],
	walls: [],
	entity_i: 0,
	entity_length: null,
	game_canvas: null,
	game_context: null,
	transfer_const: 0.5,
	init: function(canvas, width,height){
		Game.nextID = 0;
		Game.physics = Object.create(physicsModule);
		Game.physics.init(5);
		Game.physics.setEndContactListener(function(thisPtr, contactPtr) {
			var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
			var a = contact.GetFixtureA().GetBody().GetUserData();
			var b = contact.GetFixtureB().GetBody().GetUserData();
			if(a.type == "player" || a.type == "enemy" && b.type == "player" || b.type == "enemy") {
				contact.SetEnabled(false);
			}
		});
		Game.physics.setPreSolveListener(function(thisPtr, contactPtr) {
			var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
			if(contact.IsTouching()) {
				var a = contact.GetFixtureA().GetBody().GetUserData();
				var b = contact.GetFixtureB().GetBody().GetUserData();
				if(a.type == "player" || a.type == "enemy" && b.type == "player" || b.type == "enemy") {
					if(a.radius > b.radius) {
						var bigger = a;
						var smaller = b;
					} else {
						var bigger = b;
						var smaller = a;
					}
					var inside = false;
					var rr0 = bigger.radius*bigger.radius;
					var rr1 = smaller.radius*smaller.radius;
					
					var d = Math.sqrt(Math.pow(a.posx - b.posx, 2) + Math.pow(a.posy - b.posy, 2));
					// Circles do not overlap
					if (d > smaller.radius + bigger.radius){
						var area = 0;
					}
						// Circle1 is completely inside circle0
					else if (d <= Math.abs(bigger.radius - smaller.radius) && bigger.radius >= smaller.radius){
						// Return area of circle1
						inside = true;
						var area = Math.PI * rr1;
					}// Circles partially overlap
					else {
						var phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * bigger.radius * d))) * 2;
						var theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * smaller.radius * d))) * 2;
						var area1 = 0.5 * theta * rr1 - 0.5 * rr1 * Math.sin(theta);
						var area2 = 0.5 * phi * rr0 - 0.5 * rr0 * Math.sin(phi);
						// Return area of intersection
						var area = area1 + area2;
					}

					var bigArea = rr0*Math.PI;
					var smallArea = rr1*Math.PI;				
					bigArea += area * Game.transfer_const;
					smallArea -= area * Game.transfer_const;
					bigger.radius = Math.sqrt(bigArea/Math.PI);
					smaller.radius = Math.sqrt(smallArea/Math.PI);
					bigger.physics.physFixture.GetShape().SetRadius(bigger.radius/Game.physics.scale);
					if(inside !== true){		
						smaller.physics.physFixture.GetShape().SetRadius(smaller.radius/Game.physics.scale);
					}else{
						Game.removeEntity(smaller);
					}
					contact.SetEnabled(false);
				}
			}
		});
		
		Game.game_canvas = canvas;
		Game.game_canvas.width = width;
		Game.game_canvas.height = height;
		Game.game_context = Game.game_canvas.getContext("2d");
		Game.new_entities = [];
		Game.entities_deleted = false;
		Game.buildScene();
		window.requestAnimationFrame(Game.loop);
	},
	buildScene: function(){
		Game.addEntity(wallFactory(0,0,Game.game_canvas.width,1)); //Top border
		Game.addEntity(wallFactory(Game.game_canvas.width-1,0,1,Game.game_canvas.height)); //Right border
		Game.addEntity(wallFactory(0,Game.game_canvas.height-1,Game.game_canvas.width,1)); //Bottom border
		Game.addEntity(wallFactory(0,0,1,Game.game_canvas.height)); //Left border
		var circle_list = [];
		var maxSize=20;
		var minSize=1;
		var x;
		var y;
		function dist(x,y,entity){
			return Math.sqrt(Math.pow(entity.posx-x,2)+Math.pow(entity.posy-y,2) );
		}
		function testCircle(x,y,r,padding,list){
			var listlen = list.length;
			var valid = true;
			//test walls
			//left wall
			if(x-r-padding < 0) return false
			//top wall
			if(y-r-padding < 0) return false
			//right wall
			if(x+r+padding > Game.game_canvas.width) return false;
			//bottom wall
			if(y+r+padding > Game.game_canvas.height) return false
			//test other circles
			for(var i=0;i<listlen;i++){
				if(dist(x,y,list[i])-(r+padding) - list[i].radius  < 0){
					return false;
				}
			}
			return true;
		}
		
		Game.player = Game.addEntity(playerFactory(Game.game_canvas.width/2, Game.game_canvas.height/2, 10));
		circle_list.push(Game.player);
		for(var i=0;i<300;i++){
			var attempts = 50;
			var point_found=false;
			var rx;
			var ry;
			var maxR=150;
			var minR=2;
			var currentRadius = 1;
			var targetRadius = Math.random()*(maxR-minR)+minR;
			while(attempts > 0 && point_found == false){
				rx = Math.random()*Game.game_canvas.width;
				ry = Math.random()*Game.game_canvas.height;
				point_found = testCircle(rx,ry,currentRadius,6,circle_list);
			}
			if(attempts == 0) continue;
			while(currentRadius < targetRadius && point_found){
				point_found = testCircle(rx,ry,currentRadius,6,circle_list);
				if(point_found!=false){
					currentRadius += .02;
				}
			}
			console.log(currentRadius);
			circle_list.push(Game.addEntity(enemyFactory(rx, ry, currentRadius)));	
		}
	},
	loop: function(){
		window.requestAnimationFrame(Game.loop);
		if(Game.new_entities.length > 0){
			Game.entities = Game.entities.concat(Game.new_entities); // add new entities
			Game.new_entities = []; // empty the array
		}
		//clear screen
		Game.game_context.clearRect(0, 0, Game.game_canvas.width, Game.game_canvas.height);
		Game.physics.update();
		Game.entity_length = Game.entities.length;
		for(Game.entity_i = 0; Game.entity_i < Game.entity_length; Game.entity_i++) {
			Game.entities[Game.entity_i].update();
		}
		
		//clean up deleted items
		if(Game.entities_deleted == true){
			Game.entities = Game.entities.filter(function(el){ 
				if(el.deleted == true){
					el.destroy();
					return false;
				}else
					return true;
			});
			Game.entities_deleted = false;
		}
		
	},
	addEntity: function(entity){
		Game.new_entities.push(entity);
		entity.init();
		return entity;
	},
	removeEntity:function(entity){
		Game.entities_deleted = true;
		entity.deleted = true;
		return entity;
	},
};

var Empty = {
	init: function() {},
	run: function() {},
	destroy:function(){}
}

$(function(){
	Game.init($("#game")[0],800,480);
});