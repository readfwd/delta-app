var TitleBarController = require('./titlebar-controller');
var TemplateController = require('./template-controller');
var util = require('util');
var Famous = require('../shims/famous');
var _ = require('lodash');

function DetailController(options) {
  options = options || {};
  this.templates = options.templates || [];
  this.titles = options.titles || [];
  TitleBarController.call(this, options);
}
util.inherits(DetailController, TitleBarController);

DetailController.prototype.buildContentTree = function (parentNode) {
  var self = this;

  var scrollView = new Famous.ScrollView({
    direction: 0, //horizontal scroll
    paginated: true,
  });

  self.scrollView = scrollView;

  var viewControllers = [];
  var modifiers = [];
  var views = _.map(self.templates, function (template, idx) {
    var viewController = new TemplateController({
      scrollView: scrollView,
      titleBar: self.titleBar,
      pushTitleBar: false,
      template: template,
      title: self.titles[idx],
    });

    var view = viewController.getView();

    var modifier = new Famous.StateModifier();

    var renderNode = new Famous.RenderNode();
    renderNode.add(modifier).add(view);

    modifiers.push(modifier);
    viewControllers.push(viewController);
    return renderNode;
  });

  scrollView.sequenceFrom(views);

  var containerView = new Famous.ContainerSurface();

  var scrollViewModifier = new Famous.StateModifier({
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
    size: [undefined, undefined],
  });

  function resizeScrollView() {
    var width = window.innerWidth;
    var isTabletOld = scrollViewModifier.getSize()[0] !== undefined;
    var isTablet = false;

    if (width > 600) {
      width = 320;
      isTablet = true;
    }
    if (isTablet !== isTabletOld) {
      scrollViewModifier.setSize([isTablet ? width : undefined, undefined]);
      containerView.setClasses(['detail-container', isTablet ? 'detail-tablet' : 'detail-mobile']);
    }

    self.contentWidth = width;
    scrollViewModifier.setSize([width, undefined]);
    self.navigateToIndex(self.getCurrentIndex(), false);
  }

  self.indexNotSet = true;
  resizeScrollView();
  self.indexNotSet = false;

  containerView.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
  });

  containerView.on('recall', function () {
    self.emit('recall');
  });

  self.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
  });

  parentNode.add(containerView);
  containerView.add(scrollViewModifier).add(scrollView);
};

DetailController.prototype.navigateToIndex = function (index, animated) {
  var self = this;

  self.currentIndex = index; 
  if (self.scrollView) {
    if (self.indexNotSet || !self.scrollView.goToPageIndex(index, animated)) {
      self.scrollView.setPosition(index * self.contentWidth);
    }
  }
};

DetailController.prototype.getCurrentIndex = function () {
  var self = this;

  if (!self.indexNotSet && self.scrollView && self.scrollView._node) {
    var index = self.scrollView._node.index;
    var position = self.scrollView.getPosition();
    var cw = self.contentWidth;
    var cw2 = cw * 0.5;

    while (position >= cw2) {
      position -= cw;
      index++;
    }

    while (position < -cw2) {
      pocition += cw;
      index--;
    }

    if (index < 0) {
      index = 0;
    }

    if (index >= self.templates.length) {
      index = self.templates.length - 1;
    }

    return index;
  }
  return self.currentIndex;
};

module.exports = DetailController;
