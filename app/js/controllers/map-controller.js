var TitleBarController = require('./titlebar-controller');
var MapSurface = require('../views/map-surface');
var util = require('util');
var Famous = require('../shims/famous');
var MapPresets = require('../content/map-presets');
var _ = require('lodash');

function MapController(options) {
  options = options || {};
  options.title = options.title || 'Maps';
  options.preset = options.preset || 'default';
  TitleBarController.call(this, options);
}
util.inherits(MapController, TitleBarController);

MapController.prototype.buildContentTree = function (parentNode) {
  var modifier = new Famous.StateModifier({
    size: [undefined, undefined],
  });

  var map = new MapSurface(this.solvePreset(this.options.preset));

  this.on('resize', function () {
    map.emit('resize');
  });

  parentNode.add(modifier).add(map);
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

module.exports = MapController;
