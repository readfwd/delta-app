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

ViewController.prototype.getView = function() {
  if (!this.view) {
    this.view = new Famous.RenderNode();
    this.buildRenderTree(this.view);
  }
  return this.view;
};

module.exports = ViewController;
