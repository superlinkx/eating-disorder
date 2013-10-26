"use strict";
var Game = {
	game_canvas: null,
	game_context: null,
	transfer_const: 0.5,
	color: "#0000ff",
	init: function(canvas, width,height){
		Game.nextID = 0;
		Game.physics = Object.create(physicsModule);
		Game.physics.init(5);

		Game.game_canvas = canvas;
		Game.game_canvas.width = width;
		Game.game_canvas.height = height;
		Game.game_context = Game.game_canvas.getContext("2d");

		var fixtureDef = new Game.physics.FixtureDef();
		var shape = new Game.physics.CircleShape();
		shape.set_m_radius(10/Game.physics.scale);
		fixtureDef.set_shape(shape)
		fixtureDef.set_density(1);
		fixtureDef.set_restitution(1);
		fixtureDef.set_friction(0);
		
		var bodyDef = new Game.physics.BodyDef();
		bodyDef.set_type(Game.physics.dynamicBody);
		bodyDef.set_position(new Game.physics.Vec2(Game.game_canvas.width/2/Game.physics.scale, Game.game_canvas.height/2/Game.physics.scale));
		this.physBody = Game.physics.world.CreateBody(bodyDef);

		this.physFixture = this.physBody.CreateFixture(fixtureDef);

		window.requestAnimationFrame(Game.loop);
	},
	loop: function(){
		window.requestAnimationFrame(Game.loop);
	
		//clear screen
		Game.game_context.clearRect(0, 0, Game.game_canvas.width, Game.game_canvas.height);
		Game.physics.update();
		var pos = Game.physBody.GetPosition();
		Game.posx=pos.get_x()*Game.physics.scale;
		Game.posy=pos.get_y()*Game.physics.scale;
		
		Game.game_context.beginPath();
		Game.game_context.strokeStyle = "#00FF00";	
		Game.game_context.arc(Game.posx, Game.posy, 10, 0, 2*Math.PI);
		Game.game_context.stroke();
	}	
}

var physicsModule = {
	init: function(scale){
		this.Vec2 = Box2D.b2Vec2;
		this.BodyDef = Box2D.b2BodyDef;
		this.Body = Box2D.b2Body;
		this.FixtureDef = Box2D.b2FixtureDef;
		this.Fixture = Box2D.b2Fixture;
		this.World = Box2D.b2World;
		this.staticBody = Box2D.b2_staticBody;
		this.dynamicBody = Box2D.b2_dynamicBody;
		//this.MassData = Box2D.Collision.Shapes.b2MassData;
		this.PolygonShape = Box2D.b2PolygonShape;
		this.CircleShape = Box2D.b2CircleShape;
		this.DebugDraw = Box2D.b2DebugDraw;
		this.scale = scale;
		this.world = new this.World(new this.Vec2(0,-10));
		//this.contactListener = new Box2D.b2ContactListener();
		//this.world.SetContactListener(this.contactListener);
	},
	update: function(){
		this.world.Step(1 / 60,  3,  3);
		//this.world.ClearForces();
	},
}

$(function(){
	Game.init($("#game")[0],800,480);
});