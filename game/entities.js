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
};

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
};

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