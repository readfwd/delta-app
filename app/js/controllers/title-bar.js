var util = require('util');
var Famous = require('../shims/famous');

function TitleBar(options) {
  var self = this;

  options = options || {};
  Famous.View.call(self, options);
  self.options = options;

  var headerLayout = new Famous.HeaderFooterLayout({
    headerSize: 44
  });
  self.add(headerLayout);

  self.contentParent = headerLayout.content;

  var header = headerLayout.header.add(new Famous.StateModifier({
    transform: Famous.Transform.multiply(Famous.Transform.inFront, Famous.Transform.inFront), //This should be enough
  }));
  header.add(new Famous.Surface({
      classes: ['title-bar'],
      size: [undefined, 44],
    }));

  var renderController = new Famous.RenderController({
    inTransition: {
      curve: 'easeIn',
      duration: 500,
    },
    outTransition: {
      curve: 'easeOut',
      duration: 500,
    }
  });
  self.barItemRenderController = renderController;

  header.add(new Famous.StateModifier({
    transform: Famous.Transform.inFront,
  })).add(renderController);

  self.barItems = [];
}
util.inherits(TitleBar, Famous.View);

TitleBar.prototype.animateTitleBar = function(newTitle, oldTitle, push, animated) {
  if (animated && newTitle && oldTitle) {
    var state = new Famous.Transitionable(0);
    var transition = push ? {
      //method: 'spring',
      //period: 500,
      //dampingRatio: 0.5,
      curve: 'easeOut',
      duration: 500,
    } : {
      curve: 'easeOut',
      duration: 500,
    };
    state.set(1, transition);

    var mult = push ? -1 : 1;
    var distance = window.innerWidth * 0.25;

    newTitle.transformFrom(function () {
      return Famous.Transform.translate(distance * mult * (state.get() - 1), 0, 0);
    });

    oldTitle.transformFrom(function () {
      return Famous.Transform.translate(distance * mult * state.get(), 0, 0);
    });
  } else {
    if (newTitle) {
      newTitle.transformFrom(Famous.Transform.identity);
    }
    if (oldTitle) {
      oldTitle.transformFrom(Famous.Transform.identity);
    }
  }
};

TitleBar.prototype.pushItem = function(barItem, animated) {
  var self = this;

  if (animated === undefined) {
    animated = true;
  }
  animated = animated && Famous.AnimationToggle.get();
  var n = self.barItems.length;
  if (!n) {
    animated = false;
  }

  var oldBarItem = n ? self.barItems[n - 1] : null;
  if (oldBarItem && !animated) {
    self.barItemRenderController.hide({ duration: 0 });
  }
  self.barItemRenderController.show(barItem.view, animated ? null : { duration: 0 });
  self.animateTitleBar(barItem.titleModifier, 
      oldBarItem ? oldBarItem.titleModifier : null, true, animated);

  self.barItems.push(barItem);
};

TitleBar.prototype.popItem = function(animated) {
  var self = this;

  if (animated === undefined) {
    animated = true;
  }
  animated = animated && Famous.AnimationToggle.get();

  var n = self.barItems.length;
  if (n <= 1) {
    return;
  }

  var oldBarItem = self.barItems.pop();
  var barItem = self.barItems[n - 2];
  if (oldBarItem && !animated) {
    self.barItemRenderController.hide({ duration: 0 });
  }
  self.barItemRenderController.show(barItem.view, animated ? null : { duration: 0 });
  self.animateTitleBar(barItem.titleModifier, oldBarItem.titleModifier, false, animated);
};

module.exports = TitleBar;
