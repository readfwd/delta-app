var TitleBarController = require('./titlebar-controller');
var MapSurface = require('../views/map-surface');
var util = require('util');
var Famous = require('../shims/famous');
var MapPresets = require('../content/map-presets');
var _ = require('lodash');
var T = require('../translate');

function MapController(options) {
  options = options || {};
  options.title = options.title || T.span({ en:'Map', ro: 'Hartă' });
  options.preset = options.preset || 'default';
  TitleBarController.call(this, options);
}
util.inherits(MapController, TitleBarController);

MapController.prototype.buildContentTree = function (parentNode) {
  var modifier = new Famous.StateModifier({
    size: [undefined, undefined],
  });

  this.map = new MapSurface(this.solvePreset(this.options.preset));

  this.on('resize', function () {
    map.emit('resize');
  });

  parentNode.add(modifier).add(this.map);
};

MapController.prototype.solvePreset = function (preset) {

  if (typeof(preset) === 'string') {
    preset = MapPresets[preset];
  }

  if (typeof(preset) !== 'object') {
    return null;
  }

  var extend = this.solvePreset(preset.extend);
  var solved = _.extend({}, extend, preset);
  var arrays = ['layers', 'views', 'features'];
  if (preset && extend) {
    for (var i = 0, n = arrays.length; i < n; i++) {
      var name = arrays[i];
      if (preset[name] && extend[name]) {
        solved[name] = extend[name].concat(preset[name]);
      }
    }
  }
  delete solved.extend;

  return solved;
};

MapController.GPSToMercador = function (ext) {
  if (ext.length === 4) {
    return ol.proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857');
  } else {
    return ol.proj.transform(ext, 'EPSG:4326', 'EPSG:3857');
  }
};

MapController.prototype.navigateToFeature = function(featureName, animated) {
  this.map.navigateToFeature(featureName, animated);
};

module.exports = MapController;
