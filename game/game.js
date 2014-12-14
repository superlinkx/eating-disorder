var system, curSystem;
var entity1 = engine.addEntity();
engine.entities[entity1].addComponent(engine.components.coords(0,10));
engine.entities[entity1].addComponent(engine.components.appearance());

engine.init();
