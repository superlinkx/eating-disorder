//Component Definitions
engine.components.coords = function(x, y) {
  //Component for tracking coordinates
  return {
    name: 'coords',
    x: (function() {
      return x || 0;
    }),
    y: (function() {
      return y || 0;
    })
  };
};
