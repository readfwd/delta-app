var TitleBarController = require('./titlebar-controller');
var MapSurface = require('../views/map-surface');
var util = require('util');
var Famous = require('../shims/famous');
var MapPresets = require('../content/map-presets');
var _ = require('lodash');
var T = require('../translate');
var TemplateController = require('./template-controller');

function MapController(options) {
  options = options || {};
  options.title = options.title || T.span({ en:'Map', ro: 'Hartă' });
  options.preset = options.preset || 'default';
  options.rightBarButton = this.makeRightButton;
  TitleBarController.call(this, options);
}
util.inherits(MapController, TitleBarController);

MapController.prototype.buildContentTree = function (parentNode) {
  var modifier = new Famous.StateModifier({
    size: [undefined, undefined],
  });

  var self = this;

  var map = new MapSurface(self.solvePreset(self.options.preset));
  self.map = map;

  self.on('resize', function () {
    map.emit('resize');
  });

  map.on('switchView', function () {
    self.updateRightButton();
  });

  map.on('navigateToTemplate', function (t) {
    var vc = new TemplateController({
      template: t.template,
      title: t.title,
      titleBar: self.titleBar,
    });

    self.setNavigationItem(vc);
  });

  parentNode.add(modifier).add(map);
};

MapController.prototype.goToNextView = function () {
  if (!this.map) {
    return;
  }
  this.map.setView((this.map.currentViewIndex + 1) % this.map.views.length);
};

MapController.prototype.updateRightButton = function () {
  if (this.rightButton) {
    var index = this.map.currentViewIndex;
    var views = this.map.views;
    var name = views[index].initialOptions.switchButton || (views.length > 1 ? index : '');
    this.rightButton.setContent(name);
  }
};

MapController.prototype.makeRightButton = function () {
  var icon = new Famous.Surface({
    classes: ['title-button', 'title-button-world'],
    size: [true, true],
  });

  this.rightButton = icon;

  Famous.FastClick(icon, this.goToNextView.bind(this));

  return TitleBarController.createTitleBarButton(1, icon);
};

MapController.prototype.solvePreset = function (preset, skip) {
  var self = this;

  if (typeof(preset) === 'string') {
    preset = MapPresets[preset];
  }

  if (typeof(preset) !== 'object') {
    return null;
  }

  skip = skip || [];

  if (preset instanceof Array) {
    return mergePresets(_.map(preset, function(p) {
      return self.solvePreset(p, skip);
    }));
  }

  if (_.contains(skip, preset)) {
    return null;
  }
  skip.push(preset);

  var extend = this.solvePreset(preset.extend, skip);
  return mergePresets([ extend, preset ]);

  function mergePresets(presets) {
    presets = _.filter(presets, function(p) { return p && (typeof(p) === 'object'); });
    var solved = _.extend.bind(_, {}).apply(null, presets);
    delete solved.extend;
    var arrays = ['layers', 'views', 'features', 'constructors'];
    _.each(arrays, function(key) {
      var arr = [];
      var concatArr = [];
      _.each(presets, function(preset) {
        if (preset[key]) {
          concatArr.push(preset[key]);
        }
      });
      solved[key] = arr.concat.apply(arr, concatArr);
    });
    return solved;
  }
};

MapController.prototype.navigateToFeature = function(featureName, animated) {
  this.map.navigateToFeature(featureName, animated);
};

module.exports = MapController;
