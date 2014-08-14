var util = require('util'); 
var Famous = require('../shims/famous');

function ViewController () {
  Famous.EventEmitter.apply(this, arguments);
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
