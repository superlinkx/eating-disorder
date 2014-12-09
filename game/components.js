//Component Definitions Engine extensions
engine.components.coords = function(x, y) {
  //Component for tracking an entity's coordinates
  return {
    name: 'coords',
    x: x || 0,
    y: y || 0
  };
};

engine.components.appearance = function(options) {
  //Component for tracking an entity's rendered appearance
  if(!options) {
    //If no options given, create defaults
    options = {
      type: 'shape',
      shape: 'circle',
      color: '#000000',
      width: 10,
      height: 10,
      drawables: {}
    };
  }

  return {
    name: 'appearance',
    type: options.type,
    shape: options.shape,
    color: options.color,
    width: options.width,
    height: options.height,
    drawables: options.drawables
  };
};
