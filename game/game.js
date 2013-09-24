var Game = {
	entities: [],
	walls: [],
	entity_i: 0,
	entity_length: null,
	game_canvas: null,
	game_context: null,
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
		
		Game.game_canvas = canvas;
		Game.game_canvas.width = width;
		Game.game_canvas.height = height;
		Game.game_context = Game.game_canvas.getContext("2d");
		Game.walls.push(wallFactory(0,0,Game.game_canvas.width,1)); //Top border
		Game.walls.push(wallFactory(Game.game_canvas.width-1,0,1,Game.game_canvas.height)); //Right border
		Game.walls.push(wallFactory(0,Game.game_canvas.height-1,Game.game_canvas.width,1)); //Bottom border
		Game.walls.push(wallFactory(0,0,1,Game.game_canvas.height)); //Left border
		Game.entities.push(playerFactory());
		window.requestAnimationFrame(Game.loop);
	},
	loop: function(){
		window.requestAnimationFrame(Game.loop);
		Game.box.world.Step(1 / 60,  3,  3);
		Game.box.world.ClearForces();
		
		Game.game_context.clearRect(0, 0, Game.game_canvas.width, Game.game_canvas.height);
		Game.entity_length = Game.entities.length;
		Game.game_context.beginPath();
		for(Game.entity_i = 0; Game.entity_i < Game.entity_length; Game.entity_i++) {
			Game.entities[Game.entity_i].update();
		}
		var walls_length = Game.walls.length;
		for(var i = 0; i < walls_length; i++) {
			Game.walls[i].update();
		}
		
		Game.game_context.stroke();
	},
}

var playerFactory = function() {
	var player = Object.create(Entity);
	player.id = Game.nextID++;
	player.velx = 0;
	player.vely = 0;
	player.posx = Game.game_canvas.width/4;
	player.posy = Game.game_canvas.height/4;
	player.radius = 10;
	player.input = Object.create(PlayerInput);
	player.input.init(player);
	player.physics = Object.create(CirclePhysics);
	player.physics.init(player);
	player.render = Object.create(EntityRender);
	player.render.init(player);
	return player;
};

var wallFactory = function(posx, posy, width, height) {
	var wall = Object.create(Entity);
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
		var speed = 0.001;
		var dirx=0;
		var diry=0;
		var force = 800;
		if(this.keyState.up){
			diry = -force;
		}
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
		this.physFixture = new Game.box.FixtureDef();
		this.physFixture.shape = new Game.box.CircleShape();
		this.physFixture.density=1;
		
		this.physBody = new Game.box.BodyDef();
		this.physBody.type = Game.box.Body.b2_dynamicBody;
		this.physBody.position.x=this.parent.posx;
		this.physBody.position.y=this.parent.posy;
		this.physFixture.shape.SetRadius(this.parent.radius);
		this.physBody = Game.box.world.CreateBody(this.physBody);
		this.physFixture = this.physBody.CreateFixture(this.physFixture);
		
	},
	run: function() {
		this.collision();
		this.move();
	},
	collision: function() {
		
		/*
		for(var i = Game.entity_i + 1; i < Game.entity_length; i++) {
			//Check for collision.
		}*/
	},
	move: function() {
		this.parent.posx=this.physBody.GetPosition().x;
		this.parent.posy=this.physBody.GetPosition().y
		//this.parent.lastposx = this.parent.posx;
		//this.parent.lastposy = this.parent.posy;
		//this.parent.posx += this.parent.velx;
		//this.parent.posy += this.parent.vely;
	}
};

var WallPhysics = {
	init: function(parent) {
		this.parent = parent;
		this.physFixture = new Game.box.FixtureDef();
		this.physFixture.shape = new Game.box.PolygonShape();
		this.physFixture.shape.SetAsBox(this.parent.width,this.parent.height);
		
		this.physBody = new Game.box.BodyDef();
		this.physBody.type = Game.box.Body.b2_staticBody;
		this.physBody.position.x = this.parent.posx;
		this.physBody.position.y = this.parent.posy;
		this.physBody = Game.box.world.CreateBody(this.physBody);
		this.physFixture = this.physBody.CreateFixture(this.physFixture);
	},
	run: function() {
		this.collision();
	},
	collision: function() {
		
	}
}

var EntityRender = {
	init: function(parent) {
		this.parent = parent;
		this.color = "#0000ff";
	},
	run: function() {
		//Game.game_context.beginPath();
		Game.game_context.arc(this.parent.posx, this.parent.posy, this.parent.radius, 0, 2*Math.PI);
	}
};

var WallRender = {
	init: function(parent) {
		this.parent = parent;
	},
	run: function() {
		//Game.game_context.beginPath();
		Game.game_context.rect(this.parent.posx, this.parent.posy, this.parent.width, this.parent.height);
	}
}

var Empty = {
	init: function() {},
	run: function() {}
}

$(function(){
	Game.init($("#game")[0],800,480);
});