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

    var modifier = new Famous.StateModifier({
      size: [320, undefined],
    });

    var renderNode = new Famous.RenderNode();
    renderNode.add(modifier).add(view);

    modifiers.push(modifier);
    viewControllers.push(viewController);
    return renderNode;
  });

  scrollView.sequenceFrom(views);
  parentNode.add(scrollView);
};

DetailController.prototype.navigateToIndex = function (index) {
  self.currentIndex = index; 
};

module.exports = DetailController;
