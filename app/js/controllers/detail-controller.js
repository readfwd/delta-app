var TitleBarController = require('./titlebar-controller');
var TemplateController = require('./template-controller');
var util = require('util');
var Famous = require('../shims/famous');
var _ = require('lodash');
var PagePicker = require('../views/page-picker');

function DetailController(options) {
  options = options || {};
  this.templates = options.templates || [];
  this.titles = options.titles || [];
  this.pageIds = options.pageIds || [];
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
  });

  function resizeScrollView() {
    var width = window.innerWidth;
    var size = scrollViewModifier.getSize();
    var isTabletOld = size ? (size[0] !== undefined) : 42;
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

  var onRender = self.onRender.bind(self);

  containerView.on('deploy', function () {
    self.deploy();
  });

  containerView.on('recall', function () {
    self.recall();
  });

  self.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
    Famous.Engine.on('prerender', onRender);
  });

  self.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
    Famous.Engine.removeListener('prerender', onRender);
    _.each(viewControllers, function (vc) {
      vc.recall();
    });
  });

  var headerLayout = new Famous.HeaderFooterLayout({
    headerSize: 25,
  });

  var pagePicker = new PagePicker({
    count: self.templates.length,
  });

  var pagePickerModifier = new Famous.StateModifier({
    align: [0.5, 1],
    origin: [0.5, 1],
  });

  self.on('pageFlip', function (opt) {
    pagePicker.setPage(opt.index);
  });
  pagePicker.on('navigate', function (opt) {
    self.navigateToIndex(opt.index, Famous.AnimationToggle.get());
  });

  headerLayout.header.add(pagePickerModifier).add(pagePicker);
  headerLayout.content.add(scrollViewModifier).add(scrollView);

  parentNode.add(containerView);
  containerView.add(headerLayout);
};

DetailController.prototype.navigateToIndex = function (index, animated) {
  var self = this;

  self.currentIndex = index; 
  if (self.scrollView) {
    if (self.indexNotSet || !self.scrollView.goToPageIndex(index, animated)) {
      self.scrollView.setPosition(index * self.contentWidth);
      self.scrollView.setPageSpring(index * self.contentWidth);
    }
  }
};

DetailController.prototype.getCurrentIndex = function (returnOffset) {
  var self = this;
  var index, position;

  if (!self.indexNotSet && self.scrollView && self.scrollView._node) {
    index = self.scrollView._node.index;
    position = self.scrollView.getPosition();
    var cw = self.contentWidth;
    var cw2 = cw * 0.5;

    while (position >= cw2) {
      position -= cw;
      index++;
    }

    while (position < -cw2) {
      position += cw;
      index--;
    }

    if (index < 0) {
      index = 0;
    }

    if (index >= self.templates.length) {
      index = self.templates.length - 1;
    }
  } else {
    index = self.currentIndex;
    position = 0;
  }

  if (returnOffset) {
    return { offset: position, index: index };
  }
  return index;
};

DetailController.prototype.onRender = function () {
  var self = this;

  var currentStatus = self.getCurrentIndex(true);

  self.updateTitleBar(currentStatus);

  if (currentStatus.index !== self.pageIndex) {
    self.emit('pageFlip', { 
      index: currentStatus.index,
      id: self.pageIds[currentStatus.index],
    });
    self.pageIndex = currentStatus.index;
  }
};

DetailController.prototype.buildTitleText = function (titleRoot) {
  var self = this;

  var titleText1 = new Famous.Surface({
    classes: ['title-bar-text'],
    size: [true, true],
  });

  var titleModifier1 = new Famous.StateModifier();

  var titleText2 = new Famous.Surface({
    classes: ['title-bar-text'],
    size: [true, true],
  });

  var titleModifier2 = new Famous.StateModifier();

  titleRoot.add(titleModifier1).add(titleText1);
  titleRoot.add(titleModifier2).add(titleText2);
  self.titleModifier1 = titleModifier1;
  self.titleText1 = titleText1;
  self.titleModifier2 = titleModifier2;
  self.titleText2 = titleText2;
};


DetailController.prototype.updateTitleBar = function (status) {
  var self = this;

  var index1 = status.index;
  var direction = status.offset >= 0;
  var index2 = direction ? index1 + 1 : index1 - 1;
  if ((index2 < 0) || (index2 >= self.titles.length)) {
    index2 = null;
  }

  if (index1 !== self.titleIndex1) {
    self.titleIndex1 = index1;
    self.titleText1.setContent(self.titles[index1]);
  }

  if (index2 !== self.titleIndex2) {
    self.titleIndex2 = index2;
    self.titleText2.setContent(index2 === null ? '' : self.titles[index2]);
  }

  var width = window.innerWidth * 0.25;
  var pos1 = status.offset / self.contentWidth;
  var pos2 = direction ? pos1 - 1 : pos1 + 1;
  function getOpacity(x) {
    x = 1 - Math.abs(x);
    return x * x;
  }
  self.titleModifier1.setTransform(Famous.Transform.translate(-pos1 * width, 0, 0));
  self.titleModifier1.setOpacity(getOpacity(pos1));
  self.titleModifier2.setTransform(Famous.Transform.translate(-pos2 * width, 0, 0));
  self.titleModifier2.setOpacity(getOpacity(pos2));
};

module.exports = DetailController;
