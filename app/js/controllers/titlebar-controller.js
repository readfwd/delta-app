var NavigationController = require('./navigation-controller');
var util = require('util');
var Famous = require('../shims/famous');
var TitleBar = require('./title-bar');
var cordova = require('../shims/cordova');

function TitleBarController(options) {
  options = options || {};
  options.title = options.title || '';
  options.backIcon = options.backIcon || 'fa-chevron-left';
  this.titleBar = options.titleBar;
  NavigationController.call(this, options);
}
util.inherits(TitleBarController, NavigationController);

TitleBarController.prototype.buildContentTree = function (/*parentNode*/) {
};

TitleBarController.prototype.buildBarItem = function () {
  var self = this;
  var root = new Famous.RenderNode();

  var homeContainer = new Famous.ContainerSurface({
    size: [44, 44],
  });

  Famous.FastClick(homeContainer, function(evt) { 
    Famous.Timer.after(function () {
      self.emit('back'); 
    }, 1);
    evt.stopPropagation();
  });

  var homeIcon = new Famous.Surface({
    classes: ['title-button', 'title-button-back'],
    content: '<i class="fa fa-lg fa-fw ' + self.options.backIcon + '"></i>',
    size: [true, true],
  });

  var titleText = new Famous.Surface({
    classes: ['title-bar-text'],
    content: self.options.title,
    size: [true, true],
  });

  var titleModifier = new Famous.Modifier();

  root.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  })).add(titleModifier).add(titleText);

  root.add(new Famous.StateModifier({
    align: [0, 0.5],
    origin: [0, 0.5],
  })).add(homeContainer);

  homeContainer.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  })).add(homeIcon);

  return {
    view: root,
    titleModifier: titleModifier,
  };
};

TitleBarController.prototype.navigateAnimation = function (isOut) {
  var self = this;
  var from = isOut ? 1 : 0;
  var to = isOut ? 0 : 1;

  var state = new Famous.Transitionable(from);
  state.set(to, {
    curve: 'easeIn',
    duration: 500,
  });

  var distance = isOut ? 20 : 8;

  self.contentModifier.opacityFrom(state);
  self.contentModifier.transformFrom(function () {
    return Famous.Transform.translate(0, 0, (state.get() - 1) * distance);
  });
};

TitleBarController.prototype.createNavRenderController = function () {
  var renderController = new Famous.RenderController({
    inTransition: {
      method: 'spring',
      period: 500,
      dampingRatio: 0.5,
    },
    outTransition: {
      duration: 400,
      curve: 'easeOut',
    }
  });

  var distance = window.innerWidth;

  renderController.inTransformFrom(function (progress) {
    return Famous.Transform.translate(distance * (1 - progress), 0, 0);
  });
  renderController.outTransformFrom(function (progress) {
    return Famous.Transform.translate(distance * (1 - progress), 0, 0);
  });

  renderController.inOpacityFrom(function () {
    return 1;
  });

  renderController.outOpacityFrom(function () {
    return 1;
  });

  return renderController;
};

TitleBarController.prototype.buildRenderTree = function (parentNode) {
  var self = this;

  var contentRoot;
  if (self.titleBar) {
    contentRoot = parentNode;
  } else {
    self.titleBar = new TitleBar();
    parentNode.add(self.titleBar);
    contentRoot = self.titleBar.contentParent;
  }

  var contentWrapper = new Famous.RenderNode();
  var contentModifier = new Famous.Modifier();
  contentRoot.add(contentModifier).add(contentWrapper);
  self.contentModifier = contentModifier;

  self.titleBar.pushItem(self.buildBarItem());
  self.buildContentTree(contentWrapper);
  self.buildNavRenderController(contentRoot);

  self.on('navigate', self.navigateAnimation.bind(self, true));

  self.on('navigateBack', function () {
    self.navigateAnimation(false);
    self.titleBar.popItem();
  });
};

module.exports = TitleBarController;
