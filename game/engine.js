//Eating Disorder Engine Core definition
var engine = (function() {
  //Create the engine object
  //Private properties and methods
  var entityCount = 0; //Keeps track of how many entities have been created so far
  var engineStart;
  var engineLoop;
  var canvas;
  var ctx;
  var entities = {};
  var getNewEntityId = function() {
    return entityCount++;
  };
  var loop = function(timestamp) {
    engineLoop = window.requestAnimationFrame(loop);
    var progress = timestamp - engineStart;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    engineObj.runSystems();
  };

  var engineObj = {
    components: {},
    systems: {},
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
    addEntity: function() {
      //Add a new entity to the engine
      var that = this;
      var entity = (function() {
        //Entity construction
        //Private properties and methods of the entity
        var id = getNewEntityId(); //Get the id we should use from the engine

        //Public properties and methods of the entity
        return {
          components: {},
          getId: function() {
            //Returns the id of the entity
            return id;
          },
          addComponent: function(component) {
            //Adds a new component, using a component definition
            this.components[component.name] = component;
          },
          removeComponent: function(component) {
            //Removes a component. You may pass in a name, or it will extract it
            //from a reference to the component object itself.
            var name = component;
            if(typeof component === "object") {
              name = component.name;
            }
            delete this.components[name];
          },
          remove: function() {
            //Deletes this entity
            delete entities[id];
          }
        };
      }());

      entities[entity.getId()] = entity; //Add entity to entity table
      return entity.getId(); //Return the id of the new entity
    },
    getEntity: function(id) {
      return entities[id];
    },
    runSystems: function() {
      //Method to run all systems once
      //Systems must the entities list, canvas element, and the context
      var system;
      for(system in this.systems) {
        this.systems[system](entities, canvas, ctx);
      }
    }
  };

  //Public properties and methods
  return engineObj;
}());
