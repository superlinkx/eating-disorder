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
		Game.box = {};
		Game.box.Vec2 = Box2D.Common.Math.b2Vec2;
		Game.box.BodyDef = Box2D.Dynamics.b2BodyDef;
		Game.box.Body = Box2D.Dynamics.b2Body;
		Game.box.FixtureDef = Box2D.Dynamics.b2FixtureDef;
		Game.box.Fixture = Box2D.Dynamics.b2Fixture;
		Game.box.World = Box2D.Dynamics.b2World;
		Game.box.MassData = Box2D.Collision.Shapes.b2MassData;
		Game.box.PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
		Game.box.CircleShape = Box2D.Collision.Shapes.b2CircleShape;
		Game.box.DebugDraw = Box2D.Dynamics.b2DebugDraw;
		Game.box.world = new Game.box.World(new Game.box.Vec2(0,0.0), true);
		Game.box.scale = 5;
		var contactListener = new Box2D.Dynamics.b2ContactListener;
		contactListener.PreSolve = function(contact, manifold) {
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

					var distance = Math.sqrt(Math.pow(a.posx - b.posx, 2) + Math.pow(a.posy - b.posy, 2));

					var part1 = smaller.radius*smaller.radius*Math.acos((distance*distance + smaller.radius*smaller.radius - bigger.radius*bigger.radius)/(2*distance*smaller.radius));
					var part2 = bigger.radius*bigger.radius*Math.acos((distance*distance + bigger.radius*bigger.radius - smaller.radius*smaller.radius)/(2*distance*bigger.radius));
					var part3 = 0.5*Math.sqrt((-distance+smaller.radius+bigger.radius)*(distance+smaller.radius-bigger.radius)*(distance-smaller.radius+bigger.radius)*(distance+smaller.radius+bigger.radius));
					var intersectionArea = part1 + part2 - part3;

					var transfer_radius = Game.transfer_const*intersectionArea;

					bigger.radius += transfer_radius;
					smaller.radius -= transfer_radius;

					bigger.physics.physFixture.GetShape().SetRadius(bigger.radius/Game.box.scale);
					if(smaller > 0)
						smaller.physics.physFixture.GetShape().SetRadius(smaller.radius/Game.box.scale);
					else
						Game.removeEntity(smaller);
					contact.SetEnabled(false);
				}
			}
		};
		contactListener.EndContact = function(contact, manifold) {
			var a = contact.GetFixtureA().GetBody().GetUserData();
			var b = contact.GetFixtureB().GetBody().GetUserData();
			if(a.type == "player" || a.type == "enemy" && b.type == "player" || b.type == "enemy") {
				contact.SetEnabled(false);
			}
		}
		Game.box.world.SetContactListener(contactListener);
		
		Game.game_canvas = canvas;
		Game.game_canvas.width = width;
		Game.game_canvas.height = height;
		Game.game_context = Game.game_canvas.getContext("2d");
		Game.walls.push(wallFactory(0,0,Game.game_canvas.width,1)); //Top border
		Game.walls.push(wallFactory(Game.game_canvas.width-1,0,1,Game.game_canvas.height)); //Right border
		Game.walls.push(wallFactory(0,Game.game_canvas.height-1,Game.game_canvas.width,1)); //Bottom border
		Game.walls.push(wallFactory(0,0,1,Game.game_canvas.height)); //Left border
		Game.entities.push(playerFactory(Game.game_canvas.width/2, Game.game_canvas.height/2, 10));
		Game.entities.push(enemyFactory(Game.game_canvas.width/4, Game.game_canvas.height/4, 5));
		Game.entities.push(enemyFactory(Game.game_canvas.width/8, Game.game_canvas.height/8, 8));
		window.requestAnimationFrame(Game.loop);
	},
	loop: function(){
		window.requestAnimationFrame(Game.loop);
		Game.box.world.Step(1 / 60,  3,  3);
		Game.box.world.ClearForces();
		
		Game.game_context.clearRect(0, 0, Game.game_canvas.width, Game.game_canvas.height);
		Game.entity_length = Game.entities.length;
		for(Game.entity_i = 0; Game.entity_i < Game.entity_length; Game.entity_i++) {
			Game.entities[Game.entity_i].update();
		}
		var walls_length = Game.walls.length;
		for(var i = 0; i < walls_length; i++) {
			Game.walls[i].update();
		}
	},
	removeEntity: function(entity) {
		entity.deleted = true;
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
	player.input.init(player);
	player.physics = Object.create(CirclePhysics);
	player.physics.init(player);
	player.render = Object.create(EntityRender);
	player.render.init(player);
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
	enemy.input.init(enemy);
	enemy.physics = Object.create(CirclePhysics);
	enemy.physics.init(enemy);
	enemy.render = Object.create(EntityRender);
	enemy.render.init(enemy);
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
	wall.input.init(wall);
	wall.physics = Object.create(WallPhysics);
	wall.physics.init(wall);
	wall.render = Object.create(WallRender);
	wall.render.init(wall);
	return wall;
}

var Entity = {
	update: function() {
		this.input.run();
		this.physics.run();
		this.render.run();
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
		var dirx=0;
		var diry=0;
		var force = 800;
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
		body.ApplyForce(new  Game.box.Vec2(dirx,diry),body.GetWorldCenter());
		
	}
};

var CirclePhysics = {
	init: function(parent) {
		this.parent = parent;
		var fixtureDef = new Game.box.FixtureDef();
		fixtureDef.shape = new Game.box.CircleShape();
		fixtureDef.density=1;
		fixtureDef.restitution=1;
		fixtureDef.friction=0;
		
		var physBody = new Game.box.BodyDef();
		physBody.type = Game.box.Body.b2_dynamicBody;
		physBody.position.x=this.parent.posx/Game.box.scale;
		physBody.position.y=this.parent.posy/Game.box.scale;
		fixtureDef.shape.SetRadius(this.parent.radius/Game.box.scale);
		this.physBody = Game.box.world.CreateBody(physBody);
		this.physBody.SetUserData(this.parent);
		this.physFixture = this.physBody.CreateFixture(fixtureDef);
	},
	run: function() {
		this.collision();
		this.move();
	},
	collision: function() {},
	move: function() {
		this.parent.posx=this.physBody.GetPosition().x*Game.box.scale;
		this.parent.posy=this.physBody.GetPosition().y*Game.box.scale;
		//this.parent.lastposx = this.parent.posx;
		//this.parent.lastposy = this.parent.posy;
		//this.parent.posx += this.parent.velx;
		//this.parent.posy += this.parent.vely;
	}
};

var WallPhysics = {
	init: function(parent) {
		this.parent = parent;
		var fixtureDef = new Game.box.FixtureDef();
		fixtureDef.shape = new Game.box.PolygonShape();
		fixtureDef.shape.SetAsBox(this.parent.width/Game.box.scale,this.parent.height/Game.box.scale);
		
		var physBody = new Game.box.BodyDef();
		physBody.type = Game.box.Body.b2_staticBody;
		physBody.position.x = this.parent.posx/Game.box.scale;
		physBody.position.y = this.parent.posy/Game.box.scale;
		this.physBody = Game.box.world.CreateBody(physBody);
		this.physBody.SetUserData(this.parent);
		this.physFixture = this.physBody.CreateFixture(fixtureDef);
	},
	run: function() {
		this.collision();
	},
	collision: function() {}
}

var EntityRender = {
	init: function(parent) {
		this.parent = parent;
		this.color = "#0000ff";
	},
	run: function() {
		if(this.parent.radius > 0) {
			Game.game_context.beginPath();
			Game.game_context.arc(this.parent.posx, this.parent.posy, this.parent.radius, 0, 2*Math.PI);
			Game.game_context.stroke();
		} else {
			console.error("RADIUS OF: " + this.parent.id + " IS INVALID");
		}
	}
};

var WallRender = {
	init: function(parent) {
		this.parent = parent;
	},
	run: function() {
		Game.game_context.beginPath();
		Game.game_context.rect(this.parent.posx, this.parent.posy, this.parent.width, this.parent.height);
		Game.game_context.stroke();
	}
}

var Empty = {
	init: function() {},
	run: function() {}
}

$(function(){
	Game.init($("#game")[0],800,480);
});