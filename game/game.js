var system, curSystem;
var entity1 = engine.addEntity();
engine.getEntity(entity1).addComponent(engine.components.coords(0,10));
engine.getEntity(entity1).addComponent(engine.components.appearance());

engine.init();
