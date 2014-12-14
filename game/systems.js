//Systems Definitions Engine extensions
engine.systems.render = function(entities, canvas, ctx) {
  //Render system
  var entityId, curEntity;
  var appearance = {};
  var coords = {};
  for(entityId in entities) {
    curEntity = entities[entityId];
    if(curEntity.components.appearance && curEntity.components.coords) {
      //Loop over entities and apply our system to those that have
      //the necessary components
      appearance = curEntity.components.appearance;
      coords = curEntity.components.coords;
      if(appearance.type === 'shape')
        if(appearance.shape === 'circle') {
          ctx.beginPath();
          ctx.fillStyle = appearance.color;
          var radius = appearance.width;
          ctx.arc(coords.x, coords.y, radius, 0, 2*Math.PI, false);
          ctx.fill();
          ctx.closePath();
        }
    }
  }
};
