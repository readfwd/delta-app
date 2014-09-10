var NavigationController = require('./navigation-controller');
var util = require('util');
var Famous = require('../shims/famous');
var TitleBar = require('./title-bar');
var cordova = require('../shims/cordova');

function TitleBarController(options) {
  options = options || {};
  options.title = options.title || '';
  options.backIcon = options.backIcon || 'fa-chevron-left';
  if (options.pushTitleBar === undefined) {
    options.pushTitleBar = true;
  }
  if (options.createTitleBar === undefined) {
    options.createTitleBar = true;
  }
  this.titleBar = options.titleBar;
  NavigationController.call(this, options);
}
util.inherits(TitleBarController, NavigationController);

TitleBarController.prototype.buildContentTree = function (/*parentNode*/) {
};

TitleBarController.createTitleBarButton = function (align, icon) {
  var container = new Famous.ContainerSurface({
    size: [80, 65],
  });

  var sm = new Famous.StateModifier({
    size: [44, 44],
    origin: [align, 0.5],
    align: [align, 0.5],
  });

  var iconModifier = new Famous.StateModifier({
    origin: [0.5, 0.5],
    align: [0.5, 0.5],
  });

  container.add(sm).add(iconModifier).add(icon);
  return container;
};

TitleBarController.prototype.buildTitleText = function (rootNode) {
  var self = this;

  var titleText = new Famous.Surface({
    classes: ['title-bar-text'],
    content: self.options.title,
    size: [true, true],
  });

  rootNode.add(titleText);
};

TitleBarController.prototype.buildBarItem = function () {
  var self = this;
  var root = new Famous.RenderNode();

  var titleModifier = new Famous.Modifier();

  var titleRoot = root.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  })).add(titleModifier);

  self.buildTitleText(titleRoot);

  var homeIcon = new Famous.Surface({
    classes: ['title-button', 'title-button-back'],
    content: '<i class="fa fa-lg fa-fw ' + self.options.backIcon + '"></i>',
    size: [true, true],
  });

  var homeContainer = TitleBarController.createTitleBarButton(0, homeIcon);

  Famous.FastClick(homeContainer, function(evt) { 
    homeIcon.setClasses(['title-button', 'title-button-back', 'active']);
    Famous.Timer.after(function () {
      self.emit('back'); 
    }, 1);
    evt.stopPropagation();
  });

  root.add(new Famous.StateModifier({
    align: [0, 0.5],
    origin: [0, 0.5],
  })).add(homeContainer);

  if (self.options.rightBarButton) {
    root.add(new Famous.StateModifier({
      align: [1, 0.5],
      origin: [1, 0.5],
    })).add(self.options.rightBarButton.call(self));
  }

  return {
    view: root,
    titleModifier: titleModifier,
  };
};

TitleBarController.prototype.navigateAnimation = function (isOut) {
  var self = this;
  var from = isOut ? 1 : 0;
  var to = isOut ? 0 : 1;

  if (Famous.AnimationToggle.get()) {
    self.contentShowModifier.show();

    Famous.Timer.after(function () {
      var state = new Famous.Transitionable(from);
      state.set(to, {
        curve: 'easeIn',
        duration: 500,
      }, isOut ? function () {
        self.contentShowModifier.hide();
      } : null);

      var distance = isOut ? 20 : 8;

      self.contentModifier.opacityFrom(state);
      self.contentModifier.transformFrom(function () {
        return Famous.Transform.translate(0, 0, (state.get() - 1) * distance);
      });
    }, 1);
  } else {
    if (isOut) {
      self.contentShowModifier.hide();
    } else {
      self.contentShowModifier.show();
    }
    self.contentModifier.opacityFrom(1);
  }
};

TitleBarController.prototype.createNavRenderController = function () {
  var renderController = new Famous.RenderController({
    inTransition: {
      //method: 'spring',
      //period: 500,
      //dampingRatio: 0.5,
      duration: 500,
      curve: 'easeOut',
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
  if (self.titleBar || !self.options.createTitleBar) {
    contentRoot = parentNode;
  } else {
    self.titleBar = new TitleBar();
    parentNode.add(self.titleBar);
    contentRoot = self.titleBar.contentParent;
  }

  var contentModifier = new Famous.Modifier();
  var contentShowModifier = new Famous.ShowModifier();
  var contentWrapper = contentRoot.add(contentShowModifier).add(contentModifier);
  self.contentModifier = contentModifier;
  self.contentShowModifier = contentShowModifier;

  self.buildContentTree(contentWrapper);
  self.buildNavRenderController(contentRoot);

  self.on('navigate', self.navigateAnimation.bind(self, true));

  self.on('navigateBack', function () {
    self.navigateAnimation(false);
  });
};

TitleBarController.prototype.viewPresented = function () {
  var self = this;
  if (self.options.pushTitleBar && self.titleBar) {
    self.titleBar.pushItem(self.buildBarItem());
  }
};

TitleBarController.prototype.viewDismissed = function () {
  var self = this;
  if (self.options.pushTitleBar && self.titleBar) {
    self.titleBar.popItem();
  }
};

module.exports = TitleBarController;
