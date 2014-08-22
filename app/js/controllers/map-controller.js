var TitleBarController = require('./titlebar-controller');
var MapSurface = require('../views/map-surface');
var util = require('util');
var Famous = require('../shims/famous');

function MapController(options) {
  options = options || {};
  options.title = 'Maps';
  TitleBarController.call(this, options);
}
util.inherits(MapController, TitleBarController);

MapController.prototype.buildContentTree = function (parentNode) {
  var modifier = new Famous.StateModifier({
    size: [undefined, undefined],
  });
  var map = new MapSurface({
    url: 'assets/maps/delta',
    extent: [28.5, 44.33, 29.83, 45.6],
  });

  this.on('resize', function () {
    map.emit('resize');
  });

  parentNode.add(modifier).add(map);
};

module.exports = MapController;
