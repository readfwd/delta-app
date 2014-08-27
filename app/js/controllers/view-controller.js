var util = require('util'); 
var Famous = require('../shims/famous');

function ViewController (options) {
  Famous.EventEmitter.call(this);
  options = options || {};
  this.options = options;
}
util.inherits(ViewController, Famous.EventEmitter);

ViewController.prototype.buildRenderTree = function (/*parentNode*/) {
};

ViewController.prototype.viewPresented = function () {
};

ViewController.prototype.viewDismissed = function () {
};

ViewController.prototype.deploy = function () {
  if (this._deployed) {
    return;
  } else {
    this._deployed = true;
  }
  this.emit('deploy');
};

ViewController.prototype.recall = function () {
  if (!this._deployed) {
    return;
  } else {
    this._deployed = false;
  }
  this.emit('recall');
};

ViewController.prototype.getView = function () {
  if (!this.view) {
    this.view = new Famous.RenderNode();
    this.buildRenderTree(this.view);
  }
  return this.view;
};

ViewController.prototype.propagateBackButton = function (getViewController) {
  var self = this;
  self.on('backbutton', function () {
    var vc = getViewController();
    if (vc) {
      vc.emit('backbutton');
    } else {
      self.emit('back');
    }
  });
};

module.exports = ViewController;
