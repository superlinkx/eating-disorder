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
			body.ApplyForceToCenter(new  Game.physics.Vec2(dirx,diry));
	},
	destroy: function(){}
};