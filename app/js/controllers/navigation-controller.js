var util = require('util');
var ViewController = require('./view-controller');
var Famous = require('../shims/famous');

function NavigationController() {
  ViewController.apply(this, arguments);
  var self = this;
  self.backHandler = function () {
    self.navigateBack();
  };
}
util.inherits(NavigationController, ViewController);

NavigationController.prototype.setNavigationItem = function (viewController) {
  var self = this;
  if (self.viewController) {
    self.viewController.removeListener('back', self.backHandler);
  }
  var view = null;
  if (viewController) {
    viewController.on('back', self.backHandler);
    view = viewController.getView();
  }
  self.viewController = viewController;

  //Defer animation to next tick to prevent heavy load from ruining it
  Famous.Timer.after(function () {
    if (view) {
      self.renderController.show(view);
    } else {
      self.renderController.hide();
    }
  }, 1);
};

NavigationController.prototype.navigateBack = function () {
  if (!this.viewController) {
    return;
  }
  this.setNavigationItem(null);
  this.emit('navigateBack');
};

NavigationController.prototype.buildNavRenderController = function (parentNode) {
  this.renderController = this.createNavRenderController();
  parentNode.add(this.renderController);
};

NavigationController.prototype.createNavRenderController = function () {
  return new Famous.RenderController();
};

module.exports = NavigationController;
