var NavigationController = require('./navigation-controller');
var util = require('util');
var Famous = require('../shims/famous');
var TitleBar = require('./title-bar');

function TitleBarController(options) {
  options = options || {};
  options.title = options.title || '';
  options.backIcon = options.backIcon || 'fa-home';
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

  homeContainer.on('click', function(evt) { 
    Famous.Timer.after(function () {
      self.emit('back'); 
    }, 1);
    evt.stopPropagation();
  });

  var homeIcon = new Famous.Surface({
    classes: ['title-button', 'title-button-back'],
    content: '<i class="fa fa-lg ' + self.options.backIcon + '"></i>',
    size: [true, true]
  });

  var titleText = new Famous.Surface({
    classes: ['title-bar-text'],
    content: self.options.title,
    size: [true, true],
  });

  root.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  })).add(titleText);

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
  };
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
  contentRoot.add(contentWrapper);
  self.contentNode = contentWrapper;

  self.titleBar.pushItem(self.buildBarItem());
  self.buildContentTree(contentWrapper);
  self.buildNavRenderController(contentRoot);

  self.on('navigateBack', function () {
    self.titleBar.popItem();
  });
};

module.exports = TitleBarController;
