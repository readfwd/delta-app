var util = require('util');
var ViewController = require('./view-controller');
var MapView = require('../views/map');
var GridLayout = require('famous/views/GridLayout');
var Surface = require('famous/core/Surface');
var Modifier = require('famous/core/Modifier');
var RenderNode = require('famous/core/RenderNode');
var assert = require('assert');
var RenderController = require('famous/views/RenderController');
var Transform = require('famous/core/Transform');
var Transitionable = require('famous/transitions/Transitionable');
var SpringTransition = require('famous/transitions/SpringTransition');

Transitionable.registerMethod('spring', SpringTransition);

function MenuController() {
}
util.inherits(MenuController, ViewController)

MenuController.prototype.loadView = function () {
  var self = this;

  var grid = new GridLayout({
    dimensions: [4, 1]
  });

  var surfaces = [];
  grid.sequenceFrom(surfaces);

  var node = new RenderNode();
  node.add(new Modifier({
    origin: [1, 1],
    align: [1, 1],
    transform: Transform.inFront,
    size: [undefined, 50]
  })).add(grid);

  self.view = node;
  
  var renderController = new RenderController({
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

  renderNodes.push(new Surface({
    content: 'lorem',
    properties: {
      backgroundColor: 'red'
    }
  }));

  renderNodes.push(new MapView({
    url: 'assets/maps/delta',
    extent: [28.5, 44.33, 29.83, 45.6],
  }));

  renderNodes.push(
    (new RenderNode())
      .add(new Modifier({transform: Transform.inFront}))
      .add(new Surface({
        content: 'ipsum',
        properties: {
          backgroundColor: 'blue'
        }
      }))
  );

  renderController.show(renderNodes[0]);

  for (var i = 0; i < 4; i++) {
    (function(i) {
      var surface = new Surface({
        content: i + 1,
        size: [undefined, undefined],
        classes: ['btn']
      });
      surfaces.push(surface);

      surface.on('click', function(evt) {
        renderController.show(renderNodes[i]);
      });
    })(i);
  }

  //var inTransitionable = new Transitionable(Tranform.translate(-320, 0, 0));
  renderController.inTransformFrom(function (progress) {
    return Transform.translate(window.innerWidth * (progress - 1), 0, 0);
  });
  renderController.outTransformFrom(function (progress) {
    return Transform.translate(window.innerWidth * (progress - 1), 0, 0);
  });

  renderController.inOpacityFrom(function (progress) {
    return 1;
  });
  renderController.outOpacityFrom(function (progress) {
    return 1;
  });

  node.add(renderController);
}

module.exports = MenuController;
