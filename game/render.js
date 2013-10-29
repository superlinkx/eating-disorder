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
};