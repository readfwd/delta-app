var ViewController = require('./view-controller');
var MapSurface = require('../views/map-surface');
var util = require('util');
var Famous = require('../shims/famous');

function MapController() {
}
util.inherits(MapController, ViewController);

MapController.prototype.buildRenderTree = function (parentNode) {
  var modifier = new Famous.StateModifier({
    size: [undefined, undefined],
  });
  var map = new MapSurface({
    url: 'assets/maps/delta',
    extent: [28.5, 44.33, 29.83, 45.6],
  });

  parentNode.add(modifier).add(map);
};

module.exports = MapController;
