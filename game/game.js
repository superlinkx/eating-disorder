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
		Game.physics.setEndContactListener(function(contact, manifold) {
			var a = contact.GetFixtureA().GetBody().GetUserData();
			var b = contact.GetFixtureB().GetBody().GetUserData();
			if(a.type == "player" || a.type == "enemy" && b.type == "player" || b.type == "enemy") {
				contact.SetEnabled(false);
			}
		});
		Game.physics.setPreSolveListener(function(contact, manifold) {
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
//			if(currentRadius != currentRadius) continue;
			circle_list.push(Game.addEntity(enemyFactory(rx, ry, currentRadius)));
			
		}
		
		
		
		
		
		//Game.addEntity(enemyFactory(Game.game_canvas.width/4, Game.game_canvas.height/4, 5));
	//	Game.addEntity(enemyFactory(Game.game_canvas.width/8, Game.game_canvas.height/8, 8));
		
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
	
}

var physicsModule = {
	init: function(scale){
		this.Vec2 = Box2D.Common.Math.b2Vec2;
		this.BodyDef = Box2D.Dynamics.b2BodyDef;
		this.Body = Box2D.Dynamics.b2Body;
		this.FixtureDef = Box2D.Dynamics.b2FixtureDef;
		this.Fixture = Box2D.Dynamics.b2Fixture;
		this.World = Box2D.Dynamics.b2World;
		this.MassData = Box2D.Collision.Shapes.b2MassData;
		this.PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
		this.CircleShape = Box2D.Collision.Shapes.b2CircleShape;
		this.DebugDraw = Box2D.Dynamics.b2DebugDraw;
		this.scale = scale;
		this.world = new this.World(new this.Vec2(0,0.0), true);
		this.contactListener = new Box2D.Dynamics.b2ContactListener;
		this.world.SetContactListener(this.contactListener);
		
	},
	setBeginContactListener:function(listener){
		this.contactListener.BeginContact = listener;	
	},
	setPreSolveListener: function(listener){
		this.contactListener.PreSolve = listener;
	},
	setPostSolveListener: function(listener){
		this.contactListener.PostSolve = listener;
	},
	setEndContactListener: function(listener){
		this.contactListener.EndContact = listener;
	},
	update: function(){
		this.world.Step(1 / 60,  3,  3);
		this.world.ClearForces();
	},
	removeBody: function(body){
		this.world.DestroyBody(body);
	}
	
}

var playerFactory = function(posx, posy, radius) {
	var player = Object.create(Entity);
	player.id = Game.nextID++;
	player.type = "player";
	player.velx = 0;
	player.vely = 0;
	player.posx = posx;
	player.posy = posy;
	player.radius = radius;
	player.input = Object.create(PlayerInput);
	player.physics = Object.create(CirclePhysics);
	player.render = Object.create(EntityRender);
	return player;
};

var enemyFactory = function(posx, posy, radius) {
	var enemy = Object.create(Entity);
	enemy.id = Game.nextID++;
	enemy.type = "enemy";
	enemy.velx = 0;
	enemy.vely = 0;
	enemy.posx = posx;
	enemy.posy = posy;
	enemy.radius = radius;
	enemy.input = Object.create(Empty);
	enemy.physics = Object.create(CirclePhysics);
	enemy.render = Object.create(EntityRender);
	return enemy;
}

var wallFactory = function(posx, posy, width, height) {
	var wall = Object.create(Entity);
	wall.type = "wall";
	wall.posx = posx;
	wall.posy = posy;
	wall.width = width;
	wall.height = height;
	wall.input = Object.create(Empty);
	wall.physics = Object.create(WallPhysics);
	wall.render = Object.create(WallRender);
	return wall;
}

var Entity = {
	init: function(){
		this.input.init(this);
		this.physics.init(this);
		this.render.init(this);
	},
	update: function() {
		this.input.run();
		this.physics.run();
		this.render.run();
	},
	destroy: function(){
		this.input.destroy();
		this.physics.destroy();
		this.render.destroy();
	}
};

var PlayerInput = {
	init: function(parent){
		this.parent = parent;
		this.keyState = {
			"up": false,
			"down": false,
			"left": false,
			"right": false
		};
		$(document).keydown(this, function(e){
			if (e.keyCode == 38)  //up
				e.data.keyState.up = true;
			if (e.keyCode == 40)  //down
				e.data.keyState.down = true;
			if (e.keyCode == 37)  //left
				e.data.keyState.left = true;
			if (e.keyCode == 39)  //right
				e.data.keyState.right = true;
		});
		$(document).keyup(this, function(e){
			if (e.keyCode == 38)  //up
				e.data.keyState.up = false;
			if (e.keyCode == 40)  //down
				e.data.keyState.down = false;
			if (e.keyCode == 37)  //left
				e.data.keyState.left = false;
			if (e.keyCode == 39)  //right
				e.data.keyState.right = false;
		});
	},
	run: function(){
		var dirx = 0;
		var diry = 0;
		var force = this.parent.radius*10;
		if(this.keyState.up)
			diry = -force;
		if(this.keyState.down)
			diry = force;
		if(this.keyState.left)
			dirx = -force;
		if(this.keyState.right)
			dirx = force;
		
		var body = this.parent.physics.physBody;
		if(!(dirx==0 && diry==0))
		body.ApplyForce(new  Game.physics.Vec2(dirx,diry),body.GetWorldCenter());
		
	},
	destroy: function(){}
};

var CirclePhysics = {
	init: function(parent) {
		this.parent = parent;
		var fixtureDef = new Game.physics.FixtureDef();
			fixtureDef.shape = new Game.physics.CircleShape();
			fixtureDef.shape.SetRadius(this.parent.radius/Game.physics.scale);
			fixtureDef.density=1;
			fixtureDef.restitution=1;
			fixtureDef.friction=0;
		
		var bodyDef = new Game.physics.BodyDef();
			bodyDef.type = Game.physics.Body.b2_dynamicBody;
			bodyDef.position.x = this.parent.posx/Game.physics.scale;
			bodyDef.position.y = this.parent.posy/Game.physics.scale;
			bodyDef.userData = this.parent;
			
		this.physBody = Game.physics.world.CreateBody(bodyDef);
		this.physFixture = this.physBody.CreateFixture(fixtureDef);
	},
	run: function() {	
		this.move();
	},
	move: function() {
		this.parent.posx=this.physBody.GetPosition().x*Game.physics.scale;
		this.parent.posy=this.physBody.GetPosition().y*Game.physics.scale;
	},
	destroy: function(){
		Game.physics.removeBody(this.physBody);
	}
};

var WallPhysics = {
	init: function(parent) {
		this.parent = parent;
		var fixtureDef = new Game.physics.FixtureDef();
		fixtureDef.shape = new Game.physics.PolygonShape();
		fixtureDef.shape.SetAsBox(this.parent.width/Game.physics.scale,this.parent.height/Game.physics.scale);
		
		var physDef = new Game.physics.BodyDef();
		physDef.type = Game.physics.Body.b2_staticBody;
		physDef.position.x = this.parent.posx/Game.physics.scale;
		physDef.position.y = this.parent.posy/Game.physics.scale;
		physDef.userData = this.parent;		
		this.physBody = Game.physics.world.CreateBody(physDef);
		this.physFixture = this.physBody.CreateFixture(fixtureDef);
	},
	run: function() {
	},
	destroy: function(){
		Game.physics.removeBody(this.physBody);
	}
	
}

var EntityRender = {
	init: function(parent) {
		this.parent = parent;
		this.color = "#0000ff";
	},
	run: function() {
		if(this.parent.radius > 0) {
			Game.game_context.beginPath();
			if(this.parent.id === Game.player.id){ 
				Game.game_context.strokeStyle ="#00FF00";
			}else{
				if(this.parent.radius >= Game.player.radius){
					Game.game_context.strokeStyle = "#ff0000";
				}else{
					Game.game_context.strokeStyle = "#0000ff";				
				}
			}
			
			Game.game_context.arc(this.parent.posx, this.parent.posy, this.parent.radius, 0, 2*Math.PI);
			Game.game_context.stroke();
			
		} else {
			console.error("RADIUS OF: " + this.parent.id + " IS INVALID "+this.parent.radius);
		}
	},
	destroy: function(){
	
	}
	
};

var WallRender = {
	init: function(parent) {
		this.parent = parent;
	},
	run: function() {
		Game.game_context.beginPath();
		Game.game_context.strokeStyle = "#000";
		Game.game_context.rect(this.parent.posx, this.parent.posy, this.parent.width, this.parent.height);
		Game.game_context.stroke();
	},
	destroy: function(){}
}

var Empty = {
	init: function() {},
	run: function() {},
	destroy:function(){}
}

$(function(){
	Game.init($("#game")[0],800,480);
});