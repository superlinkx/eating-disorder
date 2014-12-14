//Eating Disorder Engine Core definition
var engine = (function() {
  //Create the engine object
  //Private properties and methods
  var entityCount = 0; //Keeps track of how many entities have been created so far
  var engineStart;
  var engineLoop;
  var canvas;
  var ctx;
  var loop = function(timestamp) {
    engineLoop = window.requestAnimationFrame(loop);
    var progress = timestamp - engineStart;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    engineObj.runSystems();
  };

  var engineObj = {
    entities: {}, //Table to contain engine entities
    components: {}, //Table of components
    systems: {}, //Table of systems
    init: function(w, h, canvasEl) {
      //Initialization stuff
      //Takes a width, height, and optional canvas id (id defaults to game)
      canvas = document.getElementById(canvasEl || 'game');
      ctx = canvas.getContext('2d');
      canvas.width = canvas.style.width = w || 720;
      canvas.height = canvas.style.height = h || 480;
      engineStart = Date.now();

      engineLoop = window.requestAnimationFrame(loop);
    },
    stop: function() {
      if(engineLoop)
        window.cancelAnimationFrame(engineLoop);
    },
    getNewEntityId: function() {
      //Method to return a new entity id
      return entityCount++;
    },
    runSystems: function() {
      //Method to run all systems once
      //Systems must the entities list, canvas element, and the context
      var system;
      for(system in this.systems) {
        engine.systems[system](this.entities, canvas, ctx);
      }
    }
  };

  //Public properties and methods
  return engineObj;
}());
