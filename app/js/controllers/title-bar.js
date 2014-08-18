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

TitleBar.prototype.animateTitleBar = function(newTitle, oldTitle, push) {
  if (!newTitle || !oldTitle) {
    return;
  }

  var state = new Famous.Transitionable(0);
  var transition = push ? {
    method: 'spring',
    period: 500,
    dampingRatio: 0.5,
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
};

TitleBar.prototype.pushItem = function(barItem) {
  var self = this;

  var n = self.barItems.length;
  if (!n) {
    self.barItemRenderController.show(barItem.view, { duration: 0 });
    barItem.titleModifier.transformFrom(Famous.Transform.identity);
  } else {
    var oldBarItem = self.barItems[n - 1];
    self.barItemRenderController.show(barItem.view);
    self.animateTitleBar(barItem.titleModifier, oldBarItem.titleModifier, true);
  }
  self.barItems.push(barItem);
};

TitleBar.prototype.popItem = function() {
  var self = this;

  var n = self.barItems.length;
  if (n <= 1) {
    return;
  }

  var oldBarItem = self.barItems.pop();
  var barItem = self.barItems[n - 2];
  self.barItemRenderController.show(barItem.view);
  self.animateTitleBar(barItem.titleModifier, oldBarItem.titleModifier, false);
};

module.exports = TitleBar;
