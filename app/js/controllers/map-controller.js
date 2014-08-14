var ViewController = require('./view-controller');
var MapSurface = require('../views/map-surface');
var util = require('util');
var Famous = require('../shims/famous');

function MapController() {
  ViewController.apply(this, arguments);
}
util.inherits(MapController, ViewController);

MapController.prototype.buildRenderTree = function (parentNode) {
  var self = this;

  var modifier = new Famous.StateModifier({
    size: [undefined, undefined],
  });
  var map = new MapSurface({
    url: 'assets/maps/delta',
    extent: [28.5, 44.33, 29.83, 45.6],
  });

  var headerLayout = new Famous.HeaderFooterLayout({
    headerSize: 44
  });

  headerLayout.content.add(modifier).add(map);

  var header = headerLayout.header.add(new Famous.Surface({
    classes: ['title-bar'],
    size: [undefined, 44],
  }));

  var homeContainer = new Famous.ContainerSurface({
    size: [44, 44],
  });

  homeContainer.on('click', function(evt) { 
    Famous.Timer.after(function () {
      self.emit('back'); 
    }, 1);
    evt.stopPropagation();
  });

  var homeIcon = new Famous.Surface({
    classes: ['title-button', 'title-button-back'],
    content: '<i class="fa fa-lg fa-home"></i>',
    size: [true, true]
  });

  var titleText = new Famous.Surface({
    classes: ['title-bar-text'],
    content: 'Map',
    size: [true, true],
  });

  headerLayout.header.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
    transform: Famous.Transform.inFront,
  })).add(titleText);

  headerLayout.header.add(new Famous.StateModifier({
    align: [0, 0.5],
    origin: [0, 0.5],
    transform: Famous.Transform.inFront,
  })).add(homeContainer);

  homeContainer.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  })).add(homeIcon);

  parentNode.add(headerLayout);
};

module.exports = MapController;
