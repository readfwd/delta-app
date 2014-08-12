var util = require('util');
var ViewController = require('./view-controller');
var MapView = require('../views/map');
var Famous = require('../shims/famous');

function MenuController() {

}
util.inherits(MenuController, ViewController);

MenuController.prototype.loadView = function () {
  var self = this;

  var grid = new Famous.GridLayout({
    dimensions: [4, 1]
  });

  var surfaces = [];
  grid.sequenceFrom(surfaces);

  var node = new Famous.RenderNode();
  node.add(new Famous.StateModifier({
    origin: [1, 1],
    align: [1, 1],
    transform: Transform.inFront,
    size: [undefined, 50]
  })).add(grid);

  self.view = node;

  var renderController = new Famous.RenderController({
    inTransition: {
      method: 'spring',
      period: 400,
      dampingRatio: 0.4,
    },
    outTransition: {
      method: 'spring',
      period: 400,
      dampingRatio: 0.4,
    }
  });
  var renderNodes = [];

  renderNodes.push(new Famous.Surface({
    content: 'lorem',
    properties: {
      backgroundColor: 'red'
    }
  }));

  renderNodes.push(new Famous.MapView({
    url: 'assets/maps/delta',
    extent: [28.5, 44.33, 29.83, 45.6],
  }));

  renderNodes.push(
    (new Famous.RenderNode())
      .add(new Famous.StateModifier({transform: Transform.inFront}))
      .add(new Famous.Surface({
        content: 'ipsum',
        properties: {
          backgroundColor: 'blue'
        }
      }))
  );

  renderController.show(renderNodes[0]);

  var showSurface = function (i) {
    return function () {
      renderController.show(renderNodes[i]);
    };
  };

  for (var i = 0; i < 4; i++) {
    var surface = new Famous.Surface({
      content: i + 1,
      size: [undefined, undefined]
    });
    surfaces.push(surface);

    surface.on('click', showSurface(i));
  }

  renderController.inTransformFrom(function (progress) {
    return Transform.translate(window.innerWidth * (progress - 1), 0, 0);
  });
  renderController.outTransformFrom(function (progress) {
    return Transform.translate(window.innerWidth * (progress - 1), 0, 0);
  });

  renderController.inOpacityFrom(function () {
    return 1;
  });
  renderController.outOpacityFrom(function () {
    return 1;
  });

  node.add(renderController);
};

module.exports = MenuController;
