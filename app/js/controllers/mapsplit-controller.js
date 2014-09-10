var MapController = require('./map-controller');
var MasterController = require('./master-controller');
var ViewController = require('./view-controller');
var util = require('util');
var Famous = require('../shims/famous');
var cordova = require('../shims/cordova');
var _ = require('lodash');
var ol = require('../lib/ol');
var $ = require('jquery');
var TitleBarController = require('./titlebar-controller');

function MapSplitController(options) {
  options = options || {};
  options.mapOptions = options.mapOptions || {};
  options.splitRatio = options.splitRatio || 0.4;
  ViewController.call(this, options);

  var self = this;
  self.propagateBackButton(function () {
    return self.infoVC;
  });
}
util.inherits(MapSplitController, ViewController);

MapSplitController.prototype.buildRenderTree = function (parentNode) {
  var self = this;

  var split = self.options.splitRatio;


  var infoShowModifier = new Famous.ShowModifier({visible: true});
  var infoModifier = new Famous.StateModifier();
  var layoutInfo = new Famous.FlexibleLayout({ 
    direction: 1,
    ratios: [split, 1 - split],
  });
  var infoOptions = _.clone(self.options);
  infoOptions.rightBarButton = self.createInfoFullScreenControl.bind(self);
  var infoVC = new MasterController(infoOptions);
  var infoView = infoVC.getView();
  infoVC.on('back', function () {
    self.emit('back');
  });
  self.infoVC = infoVC;
  var navToId = _.debounce(function (id) {
    mapVC.navigateToFeature(id);
  }, 500);
  infoVC.on('pageFlip', function (page) {
    navToId(page.id);
  });
  infoVC.on('ascend', function () {
    mapVC.navigateToFeature(null);
  });
  layoutInfo.sequenceFrom([new Famous.RenderNode(), infoView]);
  parentNode.add(infoShowModifier).add(infoModifier).add(layoutInfo);


  var mapShowModifier = new Famous.ShowModifier({visible: true});
  var mapModifier = new Famous.StateModifier();
  var layoutMap = new Famous.FlexibleLayout({ 
    direction: 1,
    ratios: [split, 1 - split],
  });
  var mapOptions = self.options.mapOptions;
  mapOptions.createTitleBar = false;
  mapOptions.preset = {
    extend: mapOptions.preset,
    mapClasses: ['map-split'],
    constructors: [ function (mapSurface) {
      self.createMapFullScreenControl(mapSurface);
    } ],
  };
  var mapVC = new MapController(mapOptions);
  var mapView = mapVC.getView();
  layoutMap.sequenceFrom([mapView, new Famous.RenderNode()]);
  parentNode.add(mapShowModifier).add(mapModifier).add(layoutMap);


  self.on('fullscreenNone', self.setFullScreenState.bind(self, 0));
  self.on('fullscreenMap', self.setFullScreenState.bind(self, 1));
  self.on('fullscreenInfo', self.setFullScreenState.bind(self, 2));

  self.layouts = [layoutMap, layoutInfo];
  self.currentSplits = [split, split];
  self.viewControllers = [mapVC, infoVC];
  self.modifiers = [mapModifier, infoModifier];
  self.showModifiers = [mapShowModifier, infoShowModifier];
};

MapSplitController.prototype.createInfoFullScreenControl = function () {
  var self = this;

  var infoIcon = new Famous.Surface({
    classes: ['title-button', 'title-button-full-screen'],
    content: '<i class="fa fa-lg fa-fw ' + self.options.backIcon + '"></i>',
    size: [true, true],
  });

  var infoContainer = TitleBarController.createTitleBarButton(1, infoIcon);

  function setState() {
    var icon = self.infoIconState ? 'fa-chevron-down' : 'fa-arrows-alt';
    infoIcon.setContent('<i class="fa fa-lg fa-fw ' + icon  + '"></i>');
  }
  setState();

  Famous.FastClick(infoContainer, function(evt) { 
    self.infoIconState = !self.infoIconState;
    setState();
    if (self.infoIconState) {
      self.emit('fullscreenInfo');
    } else {
      self.emit('fullscreenNone');
    }
    evt.stopPropagation();
  });

  return infoContainer;
};

MapSplitController.prototype.createMapFullScreenControl = function (mapSurface) {
  var self = this;

  var $el = $('<div class="ol-unselectable ol-control ol-full-screen"></div>');
  var $button = $('<button class="ol-has-tooltip"><span role="tooltip">Toggle full-screen</span><i class="full-screen-false fa fa-fw fa-arrows-alt"></i><i class="full-screen-true fa fa-fw fa-chevron-up"></i></button>');
  var state = false;
  function setState() {
    $button.toggleClass('ol-full-screen-true', state);
    $button.toggleClass('ol-full-screen-false', !state);
  }
  setState();
  $el.append($button);
  $button.on('click', function () {
    $button.blur();
    state = !state;
    setState();
    if (state) {
      self.emit('fullscreenMap');
    } else {
      self.emit('fullscreenNone');
    }
  });
  var control = new ol.control.Control({
    element: $el[0],
  });
  mapSurface.map.addControl(control);
};

MapSplitController.prototype.viewPresented = function () {
  this.viewControllers[0].viewPresented();
  this.viewControllers[1].viewPresented();
};

MapSplitController.prototype.viewDismissed = function () {
  this.viewControllers[0].viewDismissed();
  this.viewControllers[1].viewDismissed();
};

MapSplitController.prototype.setFullScreenState = function (state) {
  var self = this;

  function animateLayout(idx, target) {
    if (self.currentSplits[idx] === target) {
      return;
    }

    var state;

    function setSplit(split) {
      self.currentSplits[idx] = split;
      self.layouts[idx].setRatios([split, 1 - split]);
      self.viewControllers[idx].emit('resize');
      var height = window.innerHeight;
      if (cordova.iOS7App) {
        height -= 20;
      }
      var delta = (split - self.options.splitRatio) * height;
      self.modifiers[1 - idx].setTransform(Famous.Transform.translate(0, delta, 0));
    }

    function onFrame() {
      setSplit(state.get());
    }

    function hideStuff() {
      if (target === 1 - idx) {
        self.showModifiers[1 - idx].hide();
      }
    }

    self.showModifiers[0].show();
    self.showModifiers[1].show();

    if (Famous.AnimationToggle.get()) {
      state = new Famous.Transitionable(self.currentSplits[idx]);
      Famous.Engine.on('prerender', onFrame);
      state.set(target, {
        curve: 'easeInOut',
        duration: 700,
      }, function () {
        Famous.Engine.removeListener('prerender', onFrame);
        hideStuff();
      });
    } else {
      setSplit(target);
      hideStuff();
    }
  }

  var generalSplit = self.options.splitRatio;
  animateLayout(0, state === 1 ? 1 : generalSplit);
  animateLayout(1, state === 2 ? 0 : generalSplit);
};

module.exports = MapSplitController;
