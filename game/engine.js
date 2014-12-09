//Eating Disorder Engine Core definition
var engine = (function() {
  //Create the engine object
  //Private properties and methods
  var entityCount = 0; //Keeps track of how many entities have been created so far

  //Public properties and methods
  return {
    entities: {}, //Table to contain engine entities
    components: {}, //Table of components
    systems: {}, //Table of systems
    init: function() {
      //Initialization stuff
    },
    getNewEntityId: function() {
      //Method to return a new entity id
      return entityCount++;
    }
  };
}());
