var util = require('util');
var NavigationController = require('./navigation-controller');
var MapController = require('./map-controller');
var Famous = require('../shims/famous');
var _ = require('lodash');

function MenuController() {
  NavigationController.apply(this, arguments);

  var self = this;

  self.buttonModifiers = [];
  self.buttonShowModifiers = [];
  self.on('navigateBack', function() {
    Famous.Timer.setTimeout(function() {
      self.presentIn();
    }, 200);
  });
}
util.inherits(MenuController, NavigationController);

MenuController.prototype.buildSectionButton = function(section) {
  var renderNode = new Famous.RenderNode();
  var surface = new Famous.Surface({
    classes: ['menu-button'],
  });
  var buttonText = new Famous.Surface({
    classes: ['menu-button-text'],
    content: section + 1,
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
  node.add(textModifier).add(buttonText);

  this.buttonModifiers[section] = modifier;
  this.buttonShowModifiers[section] = showModifier;
  modifier.section = section;

  surface.on('click', this.navigateToSection.bind(this, section));
  return renderNode;
};

MenuController.prototype.navigateToSection = function (section) {
  var self = this;
  if (self.viewController) { return; }

  var viewController = null;
  if (section === 6) {
    viewController = new MapController();
  }
  self.setNavigationItem(viewController);

  //Defer animation to next tick to prevent heavy load from ruining it
  Famous.Timer.after(function () {
    self.presentOut(section);
  }, 2);
};

MenuController.prototype.present = function (isIn, skip) {
  var self = this;

  var distance = 30;
  var delayOff = isIn ? 40 : 30;

  var start = isIn ? 0 : 1;
  var end = isIn ? 1 : 0;
  var easing = isIn ? 'easeOut' : 'easeIn';

  var buttons = _.shuffle(self.buttonModifiers);
  _.each(buttons, function(modifier, i) {
    var delay = i * delayOff;
    if (modifier.section === skip) {
      delay = 150;
    }
    Famous.Timer.setTimeout(function() {
      self.buttonShowModifiers[modifier.section].show();

      var state = new Famous.Transitionable(start);
      state.set(end, {
        duration: 200,
        curve: easing,
      }, function () {
        if (!isIn) {
          self.buttonShowModifiers[modifier.section].hide();
        }
      });

      modifier.opacityFrom(state);
      if (modifier.section !== skip) {
        modifier.transformFrom(function() {
          return Famous.Transform.translate(0, 0, (1 - state.get()) * distance);
        });
      }
    }, delay);
  });
};

MenuController.prototype.presentOut = function (section) {
  this.present(false, section);
};

MenuController.prototype.presentIn = function () {
  this.present(true);
};

MenuController.prototype.buildGrid = function (parentNode) {
  var self = this;

  var borderWidth = 15;

  var verticalLayout = new Famous.GridLayout({
    dimensions: [1, 4],
    gutterSize: [0, borderWidth],
  });

  var verticalViews = [];
  var horizontalLayout, horizontalViews;
  verticalLayout.sequenceFrom(verticalViews);
  for (var i = 0; i < 4; i++) {
    horizontalViews = [];
    horizontalLayout = new Famous.GridLayout({
      dimensions: [((i === 3) ? 1 : 2), 1],
      gutterSize: [borderWidth, 0]
    });

    verticalViews.push(horizontalLayout);
    horizontalLayout.sequenceFrom(horizontalViews);

    if (i === 3) {
      horizontalViews.push(self.buildSectionButton(i * 2));
    } else {
      horizontalViews.push(self.buildSectionButton(i * 2));
      horizontalViews.push(self.buildSectionButton(i * 2 + 1));
    }
  }

  var verticalGutter = new Famous.FlexibleLayout({
    ratios: [true, 1, true],
    direction: 1,
  });
  verticalGutter.sequenceFrom([new Famous.Surface({
    size: [undefined, borderWidth],
  }), verticalLayout, new Famous.Surface({
    size: [undefined, borderWidth],
  })]);

  var horizontalGutter = new Famous.FlexibleLayout({
    ratios: [true, 1, true],
    direction: 0,
  });
  horizontalGutter.sequenceFrom([new Famous.Surface({
    size: [borderWidth, undefined],
  }), verticalGutter, new Famous.Surface({
    size: [borderWidth, undefined],
  })]);

  parentNode.add(horizontalGutter);
};

MenuController.prototype.createNavRenderController = function () {
  var renderController = new Famous.RenderController({
    inTransition: {
      /*duration: 500,
      curve: 'easeOut',*/
      method: 'spring',
      period: 500,
      dampingRatio: 0.5,
    },
    outTransition: {
      duration: 500,
      curve: 'easeIn',
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

  Famous.Timer.setTimeout(function () {
    self.presentIn();
  }, 600);
};

module.exports = MenuController;
