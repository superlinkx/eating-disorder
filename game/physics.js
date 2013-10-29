var physicsModule = {
	init: function(scale){
		this.listeners = [];
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
		//this.DebugDraw = Box2D.b2DebugDraw;
		this.scale = scale;
		this.world = new this.World(new this.Vec2(0,0));
		this.contactListener = new Box2D.b2ContactListener();
	},
	setBeginContactListener: function(listener){
		var newListener = {
			original: Box2D.b2ContactListener.prototype.BeginContact,
			replacement: listener
		};
		this.listeners.push(newListener); //TODO: This is a terrible idea. But it's future me's problem.
		Box2D.customizeVTable(this.contactListener, this.listeners)
		this.world.SetContactListener(this.contactListener);
	},
	setPreSolveListener: function(listener){
		var newListener = {
			original: Box2D.b2ContactListener.prototype.PreSolve,
			replacement: listener
		};
		this.listeners.push(newListener); //TODO: This is a terrible idea. But it's future me's problem.
		Box2D.customizeVTable(this.contactListener, this.listeners)
		this.world.SetContactListener(this.contactListener);
	},
	setPostSolveListener: function(listener){
		var newListener = {
			original: Box2D.b2ContactListener.prototype.PostSolve,
			replacement: listener
		};
		this.listeners.push(newListener); //TODO: This is a terrible idea. But it's future me's problem.
		Box2D.customizeVTable(this.contactListener, this.listeners)
		this.world.SetContactListener(this.contactListener);
	},
	setEndContactListener: function(listener){
		var newListener = {
			original: Box2D.b2ContactListener.prototype.EndContact,
			replacement: listener
		};
		this.listeners.push(newListener); //TODO: This is a terrible idea. But it's future me's problem.
		Box2D.customizeVTable(this.contactListener, this.listeners)
		this.world.SetContactListener(this.contactListener);
	},
	update: function(){
		this.world.Step(1 / 60,  3,  3);
		//this.world.ClearForces();
	},
	removeBody: function(body){
		this.world.DestroyBody(body);
	}
	
};

var CirclePhysics = {
	init: function(parent) {
		this.parent = parent;
		var fixtureDef = new Game.physics.FixtureDef();
		var shape = new Game.physics.CircleShape();
		shape.set_m_radius(this.parent.radius/Game.physics.scale);
		fixtureDef.set_shape(shape)
		fixtureDef.set_density(1);
		fixtureDef.set_restitution(1);
		fixtureDef.set_friction(0);
		
		var bodyDef = new Game.physics.BodyDef();
		bodyDef.set_type(Game.physics.dynamicBody);
		bodyDef.set_position(new Game.physics.Vec2(this.parent.posx/Game.physics.scale,this.parent.posy/Game.physics.scale));
		this.physBody = Game.physics.world.CreateBody(bodyDef);
		this.physBody.SetUserData(this.parent);
		this.physFixture = this.physBody.CreateFixture(fixtureDef);
		
	},
	run: function() {	
		this.move();
	},
	move: function() {
		var pos = this.physBody.GetPosition();
		this.parent.posx=pos.get_x()*Game.physics.scale;
		this.parent.posy=pos.get_y()*Game.physics.scale;
		
	},
	destroy: function(){
		Game.physics.removeBody(this.physBody);
	}
};

var WallPhysics = {
	init: function(parent) {
		this.parent = parent;
		var fixtureDef = new Game.physics.FixtureDef();
		var shape = new Game.physics.PolygonShape();
		shape.SetAsBox(this.parent.width/Game.physics.scale,this.parent.height/Game.physics.scale);
		fixtureDef.set_shape(shape);
		
		var physDef = new Game.physics.BodyDef();
		physDef.set_type(Game.physics.staticBody);
		physDef.set_position(new Game.physics.Vec2(this.parent.posx/Game.physics.scale,this.parent.posy/Game.physics.scale));
		this.physBody = Game.physics.world.CreateBody(physDef);
		this.physBody.SetUserData(this.parent);
		this.physFixture = this.physBody.CreateFixture(fixtureDef);
	},
	run: function() {
	},
	destroy: function(){
		Game.physics.removeBody(this.physBody);
	}
	
};