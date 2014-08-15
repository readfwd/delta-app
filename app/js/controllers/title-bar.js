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
    transform: Famous.Transform.inFront,
  }));
  header.add(new Famous.Surface({
      classes: ['title-bar'],
      size: [undefined, 44],
    }));

  var renderController = new Famous.RenderController();
  self.barItemRenderController = renderController;

  header.add(new Famous.StateModifier({
    transform: Famous.Transform.inFront,
  })).add(renderController);

  self.barItems = [];
}
util.inherits(TitleBar, Famous.View);

TitleBar.prototype.pushItem = function(barItem) {
  var self = this;

  if (self.barItems.length) {
    self.barItemRenderController.show(barItem.view, { duration: 0 });
  } else {
    //set up in/out transitions
    var transition = {
      easing: 'easeInOut',
      duration: 500,
    };
    self.barItemRenderController.show(barItem.view, transition);
  }
  self.barItem.push(barItem);
};

TitleBar.prototype.pushItem = function(barItem) {
  var self = this;

  if (self.barItems.length) {
    self.barItemRenderController.show(barItem.view, { duration: 0 });
  } else {
    //set up in/out transitions
    var transition = {
      easing: 'easeOut',
      duration: 500,
    };
    self.barItemRenderController.show(barItem.view, transition);
  }
  self.barItems.push(barItem);
};

TitleBar.prototype.popItem = function() {
  var self = this;

  var n = self.barItems.length;
  if (n <= 1) {
    return;
  }

  self.barItems.pop();
  var barItem = self.barItems[n - 2];

  //set up in/out transitions
  var transition = {
    easing: 'easeOut',
    duration: 500,
  };
  self.barItemRenderController.show(barItem.view, transition);
};

module.exports = TitleBar;
