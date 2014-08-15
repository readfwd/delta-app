var ViewController = require('./view-controller');
var util = require('util');
var Famous = require('../shims/famous');

function TitleBarController(options) {
  options = options || {};
  options.title = options.title || '';
  ViewController.call(this, options);
}
util.inherits(TitleBarController, ViewController);

TitleBarController.prototype.buildContentTree = function (/*parentNode*/) {
};

TitleBarController.prototype.buildRenderTree = function (parentNode) {
  var self = this;

  var headerLayout = new Famous.HeaderFooterLayout({
    headerSize: 44
  });

  self.buildContentTree(headerLayout.content);

  var header = headerLayout.header.add(new Famous.StateModifier({
    transform: Famous.Transform.inFront,
  }));
  header.add(new Famous.Surface({
      classes: ['title-bar'],
      size: [undefined, 44],
    }));

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
    content: '<i class="fa fa-lg fa-home"></i>',
    size: [true, true]
  });

  var titleText = new Famous.Surface({
    classes: ['title-bar-text'],
    content: self.options.title,
    size: [true, true],
  });

  header.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
    transform: Famous.Transform.inFront,
  })).add(titleText);

  header.add(new Famous.StateModifier({
    align: [0, 0.5],
    origin: [0, 0.5],
    transform: Famous.Transform.inFront,
  })).add(homeContainer);

  homeContainer.add(new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  })).add(homeIcon);

  parentNode.add(headerLayout);
};

module.exports = TitleBarController;
