//Entity Handling Engine extensions
engine.addEntity = function() {
  //Add a new entity to the engine
  var that = this; //Copy this to be used in inner functions
  var entity = (function() {
    //Entity construction
    //Private properties and methods of the entity
    var components = {};
    var id = that.getNewEntityId(); //Get the id we should use from the engine

    //Public properties and methods of the entity
    return {
      getId: function() {
        //Returns the id of the entity
        return id;
      },
      getComponents: function() {
        //Returns the components object of the entity
        return components;
      },
      addComponent: function(component) {
        //Adds a new component, using a component definition
        components[component.name] = component;
      },
      removeComponent: function(component) {
        //Removes a component. You may pass in a name, or it will extract it
        //from a reference to the component object itself.
        var name = component;
        if(typeof component === "object") {
          name = component.name;
        }
        delete components[name];
      },
      remove: function() {
        //Deletes this entity
        delete that.entities[id];
      }
    };
  }());

  this.entities[entity.getId()] = entity; //Add entity to entity table
  return entity.getId(); //Return the id of the new entity
};
