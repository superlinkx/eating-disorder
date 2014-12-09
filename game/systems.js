//Systems Definitions Engine extensions
engine.systems.render = function(entities) {
  //Render system
  var entityId, curEntity;
  for(entityId in entities) {
    curEntity = entities[entityId];
    if(curEntity.components.appearance && curEntity.components.coords) {
      //Loop over entities and apply our system to those that have
      //the necessary components
      console.log("Current Position:");
      console.log("x: ", curEntity.components.coords.x);
      console.log("y: ", curEntity.components.coords.y);
    }
  }
};
