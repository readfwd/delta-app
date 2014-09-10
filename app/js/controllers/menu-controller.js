var util = require('util');
var NavigationController = require('./navigation-controller');
var Famous = require('../shims/famous');
var _ = require('lodash');
var cordova = require('../shims/cordova.js');
var W = require('when');

function MenuController(options) {
  options = options || {};
  options.buttonDescriptors = options.buttonDescriptors || {};
  options.buttonLayout = options.buttonLayout || [];
  NavigationController.call(this, options);

  var self = this;

  self.buttons = [];
  self.on('navigateBack:before', function() {
    self.presentIn(300, true);
  });
}
util.inherits(MenuController, NavigationController);

MenuController.prototype.buildButtonForLabel = function(label) {
  var self = this;

  var buttonDescriptor = self.options.buttonDescriptors[label];

  var renderNode = new Famous.RenderNode();
  var surface = new Famous.ContainerSurface({
    classes: ['menu-button', 'menu-' + label],
  });
  var buttonText = new Famous.Surface({
    classes: ['menu-button-text', 'menu-' + label],
    content: buttonDescriptor.title,
    size: [true, true],
  });
  var textModifier = new Famous.StateModifier({
    transform: Famous.Transform.inFront,
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  });
  var modifier = new Famous.Modifier();
  var showModifier = new Famous.ShowModifier({
    visible: false,
  });
  var node = renderNode.add(modifier).add(showModifier);
  node.add(surface);
  surface.add(textModifier).add(buttonText);

  self.buttons.push({
    modifier: modifier,
    showModifier: showModifier,
  });
  modifier.label = label;

  Famous.FastClick(surface, function () {
    if (self.userInput) {
      self.navigateToLabel(label);
    }
  });

  buttonText.pipe(surface);

  return {
    root: renderNode,
    surface: surface,
  };
};

MenuController.prototype.navigateToLabel = function (label) {
  var self = this;
  if (self.viewController) { return; }

  var buttonDescriptor = self.options.buttonDescriptors[label];
  var viewController = buttonDescriptor.viewController;
  if (typeof(viewController) === 'function') {
    viewController = viewController();
  }
  if (!viewController) {
    return;
  }

  self.setNavigationItem(viewController);

  //Defer animation to next tick to prevent heavy load from ruining it
  if (Famous.AnimationToggle.get()) {
    Famous.Timer.after(function () {
      self.presentOut(label);
    }, 2);
  } else {
    self.presentOut(label);
  }
};

MenuController.prototype.present = function (isIn, skip, globalDelay, callback, back) {
  var self = this;

  globalDelay = globalDelay || 0;

  var distance = 30;
  var delayOff = 30;

  var start = isIn ? 0 : 1;
  var end = isIn ? 1 : 0;
  var easing = isIn ? 'easeOut' : 'easeIn';

  var promises = [];
  var afterActions = [];

  function presentSurface(modifier, showModifier, willTranslate, delay) {
    showModifier.show();

    transition = {
      duration: 200,
      curve: easing,
    };

    var state = new Famous.Transitionable(start);
    var totalDelay = delay + globalDelay;
    if (!Famous.AnimationToggle.get()) {
      totalDelay = 0;
      transition.duration = 0;
    }

    var promise = W.promise(function (resolve) {
      Famous.Timer.after(function () {
        if (totalDelay) {
          Famous.Timer.setTimeout(function () {
            state.set(end, transition, resolve);
          }, totalDelay);
        } else {
          state.set(end, transition, resolve);
        }
      }, 1);
    });

    if (!isIn) {
      afterActions.push(function () {
        showModifier.hide();
      });
    }

    promises.push(promise);

    modifier.opacityFrom(state);
    if (willTranslate) {
      modifier.transformFrom(function() {
        return Famous.Transform.translate(0, 0, (1 - state.get()) * distance);
      });
    } else {
      modifier.transformFrom(function() {
        return Famous.Transform.translate(0, 0, 0);
      });
    }
  }

  var buttons = _.shuffle(self.buttons);
  _.each(buttons, function(button, i) {
    var shouldSkip = button.modifier.label === skip;
    var delay = shouldSkip ? 150 : i * delayOff;
    presentSurface(button.modifier, button.showModifier, !shouldSkip && !back, delay);
  });

  presentSurface(self.titleBarModifier, self.titleBarShowModifier, false, 0);
  presentSurface(self.captureSurfaceModifier, self.captureSurfaceShowModifier, false, isIn ? 300 : 0);

  self.endOfTransitionPromise = W.all(promises).then(function () {
    _.each(afterActions, function (cb) {
      cb();
    });
    if (callback) {
      callback();
    }
  });
};

MenuController.prototype.presentOut = function (label, delay) {
  this.present(false, label, delay);
};

MenuController.prototype.presentIn = function (delay, back) {
  var self = this;
  self.userInput = false;
  self.present(true, null, delay, function () {
    self.userInput = true;
  }, back);
};

MenuController.prototype.buildGrid = function (parentNode) {
  var self = this;

  var borderWidth = 15;
  var buttonHeight = 100;
  var hasTitleBar = !!(self.options.title || self.options.buttonDescriptors.settings);

  // Set up the external layout
  var buttonLayout = self.options.buttonLayout;
  var verticalLayout = new Famous.GridLayout({
    dimensions: [1, buttonLayout.length],
    gutterSize: [0, borderWidth],
    size: [undefined, undefined],
  });

  var horizontalGutter = new Famous.FlexibleLayout({
    ratios: [true, 1, true],
    direction: 0,
  });
  horizontalGutter.sequenceFrom([new Famous.Surface({
    size: [borderWidth, undefined],
  }), verticalLayout, new Famous.Surface({
    size: [borderWidth, undefined],
  })]);

  // Set up the scrollView
  var scrollView;
  var modifier = new Famous.StateModifier();
  var renderNode = new Famous.RenderNode();
  var scrollContainer = renderNode.add(modifier);
  scrollContainer.add(horizontalGutter);

  scrollView = new Famous.ScrollView();
  scrollView.sequenceFrom([renderNode]);

  function configureHeight() {
    var layoutHeight = (buttonHeight + borderWidth) * buttonLayout.length - borderWidth;
    var screenHeight = window.innerHeight - borderWidth;
    if (cordova.iOS7App) {
      screenHeight -= 20;
    }
    if (hasTitleBar) {
      screenHeight -= 44;
    } else {
      screenHeight -= borderWidth;
    }

    if (screenHeight > layoutHeight) {
      layoutHeight = screenHeight;
    }
    modifier.setSize([undefined, layoutHeight]);
  }

  Famous.Engine.on('resize', configureHeight);
  configureHeight();

  // Building the layout
  var verticalViews = [];

  verticalLayout.sequenceFrom(verticalViews);
  _.each(buttonLayout, function (buttons) {
    var horizontalViews = [];
    var horizontalLayout = new Famous.GridLayout({
      dimensions: [buttons.length, 1],
      gutterSize: [borderWidth, 0],
    });

    verticalViews.push(horizontalLayout);
    horizontalLayout.sequenceFrom(horizontalViews);
    horizontalLayout.pipe(scrollView);

    _.each(buttons, function (label) {
      var button = self.buildButtonForLabel(label);
      horizontalViews.push(button.root);
      button.surface.pipe(scrollView);
    });
  });

  // Set up the gutter
  var verticalGutter = new Famous.HeaderFooterLayout({
    headerSize: hasTitleBar ? 44 : borderWidth,
    footerSize: borderWidth,
  });

  verticalGutter.content.add(scrollView);
  parentNode.add(verticalGutter);

  // Set up the background scroll capture view
  self.captureSurfaceModifier = new Famous.Modifier();
  self.captureSurfaceModifier.transformFrom(Famous.Transform.behind);
  self.captureSurfaceShowModifier = new Famous.ShowModifier({ visible: false });

  var captureSurface = new Famous.Surface({
    classes: ['menu-bg'],
    size: [undefined, undefined],
    properties: {
      zIndex: -10000,
    }
  });
  scrollContainer
    .add(self.captureSurfaceShowModifier)
    .add(self.captureSurfaceModifier)
    .add(captureSurface);
  captureSurface.pipe(scrollView);

  // Set up the title bar
  if (hasTitleBar) {
    self.titleBarShowModifier = new Famous.ShowModifier({ visible: false });
    self.titleBarModifier = new Famous.Modifier();
    self.titleBarModifier.transformFrom(
      Famous.Transform.multiply(Famous.Transform.behind, Famous.Transform.behind)
    );

    var titleBarRoot = verticalGutter.header
      .add(self.titleBarShowModifier)
      .add(self.titleBarModifier);

    if (self.options.title) {
      titleBarRoot.add(new Famous.StateModifier({
        align: [0.5, 0.5],
        origin: [0.5, 0.5],
      })).add(new Famous.Surface({
        classes: ['menu-title'],
        content: self.options.title,
        size: [true, true],
      }));
    }

    var settingsButton = self.options.buttonDescriptors.settings;
    if (settingsButton) {
      var settingsContainer = new Famous.ContainerSurface({
        size: [44, 44],
      });

      Famous.FastClick(settingsContainer, function () {
        if (self.userInput) {
          self.navigateToLabel('settings');
        }
      });

      titleBarRoot.add(new Famous.StateModifier({
        align: [1, 0.5],
        origin: [1, 0.5],
      })).add(settingsContainer);

      settingsContainer.add(new Famous.StateModifier({
        align: [0.5, 0.5],
        origin: [0.5, 0.5],
      })).add(new Famous.Surface({
        classes: ['menu-settings-icon'],
        content: '<i class="fa fa-lg fa-fw fa-gear"></i>',
        size: [true, true],
      }));
    }
  }
};

MenuController.prototype.createNavRenderController = function () {
  var self = this;
  var renderController = new Famous.RenderController({
    inTransition: {
      method: 'delay',
      delay: 300,
      delayMethod: Famous.SpringTransition,
      period: 500,
      dampingRatio: 0.5,
    },
    outTransition: {
      duration: 400,
      curve: 'easeOut',
      delay: 100,
      method: 'delay',
      delayMethod: Famous.PromiseTransition,
      promise: { 
        then: function () {
          self.endOfTransitionPromise.then.apply(self.endOfTransitionPromise, arguments);
        }
      }
    }
  });

  var distance = 30;

  renderController.inTransformFrom(function (progress) {
    return Famous.Transform.translate(0, 0, distance * (progress - 1));
  });
  renderController.outTransformFrom(function (progress) {
    return Famous.Transform.translate(0, 0, distance * (progress - 1));
  });

  return renderController;
};

MenuController.prototype.buildRenderTree = function (parentNode) {
  var self = this;

  self.buildGrid(parentNode);
  self.buildNavRenderController(parentNode);

  if (Famous.AnimationToggle.get()) {
    Famous.Timer.after(function () {
      self.presentIn();
    }, 10);
  } else {
    self.presentIn();
  }
};

module.exports = MenuController;
