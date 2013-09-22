var Game = {
	entities: [],
	game_canvas: null,
	game_context: null,
	init: function(){
		Game.game_canvas = $("#game")[0];
		Game.game_canvas.width = Game.game_canvas.clientWidth;
		Game.game_canvas.height = Game.game_canvas.clientHeight;
		Game.game_context = Game.game_canvas.getContext("2d");
		Game.entities.push(playerFactory());
		window.requestAnimationFrame(Game.loop);
	},
	loop: function(){
		window.requestAnimationFrame(Game.loop);
		var length = Game.entities.length;
		for(var i = 0; i < length; i++) {
			Game.entities[i].update();
		}
	},
}

var Entity = {
	density: 0,
	update: function() {
		this.input.run();
		this.physics.run();
		this.render.run();
	},
	input: {},
	physics: {},
	render: {}
}

var playerFactory = function() {
	var player = Object.create(Entity);
	player.posx = Game.game_canvas.width/4;
	player.posy = Game.game_canvas.height/4;
	player.velx = 0;
	player.vely = 0;
	player.radius = 10;
	player.input = Object.create(PlayerInput);
	player.input.init(player);
	player.physics = Object.create(Physics);
	player.physics.init(player);
	player.render = Object.create(Render);
	player.render.init(player);
	return player;
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
		if(this.keyState.up)
			this.parent.vely -= speed;
		if(this.keyState.down)
			this.parent.vely += speed;
		if(this.keyState.left)
			this.parent.velx -= speed;
		if(this.keyState.right)
			this.parent.velx += speed;
	}
};

var Physics = {
	init: function(parent) {
		this.parent = parent;
	},
	run: function() {
		this.move();
	},
	move: function() {
		
		this.parent.posx += this.parent.velx;
		this.parent.posy += this.parent.vely;
	}
};

var Render = {
	init: function(parent) {
		this.parent = parent;
		this.color = "#0000ff";
	},
	run: function() {
		Game.game_context.beginPath();
		Game.game_context.arc(this.parent.posx, this.parent.posy, this.parent.radius, 0, 2*Math.PI);
		Game.game_context.stroke();
	}
};