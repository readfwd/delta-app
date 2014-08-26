var util = require('util');
var ViewController = require('./view-controller');
var Famous = require('../shims/famous');

function NavigationController() {
  ViewController.apply(this, arguments);
  var self = this;
  self.propagateBackButton(function () {
    return self.viewController;
  });
  self.backHandler = function () {
    self.navigateBack();
  };
}
util.inherits(NavigationController, ViewController);

NavigationController.prototype.setNavigationItem = function (viewController) {
  var self = this;
  var oldViewController = self.viewController;
  if (oldViewController === viewController) {
    return;
  }

  if (oldViewController) {
    oldViewController.removeListener('back', self.backHandler);
  }
  var view = null;
  if (viewController) {
    viewController.on('back', self.backHandler);
    view = viewController.getView();
  }
  self.viewController = viewController;

  function onAnimationEnd() {
    //only release the view controller after the animation 
    //is finished so the GC won't destroy our FPS
    if (oldViewController) {
      oldViewController = null; 
    }
  }

  //Defer animation to next tick to prevent heavy load from ruining it
  function commitAnimation() {
    var transition = Famous.AnimationToggle.get() ? null : {
      duration: 0
    };
    if (view) {
      self.renderController.show(view, transition, onAnimationEnd);
    } else {
      self.renderController.hide(transition, onAnimationEnd);
    }
  }

  if (oldViewController) {
    oldViewController.viewDismissed();
  }
  if (viewController) {
    viewController.viewPresented();
  }

  if (Famous.AnimationToggle.get()) {
    Famous.Timer.after(commitAnimation, 2);
  } else {
    commitAnimation();
  }

  if (viewController) {
    self.emit('navigate');
  }
};

NavigationController.prototype.navigateBack = function () {
  if (!this.viewController) {
    return;
  }
  if ((this.viewController instanceof NavigationController) && this.viewController.viewController) {
    return;
  }
  this.emit('navigateBack:before');
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
