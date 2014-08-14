var util = require('util'); 
var Famous = require('../shims/famous');

function ViewController () {
}
util.inherits(ViewController, Famous.EventEmitter);

ViewController.prototype.buildRenderTree = function (/*parentNode*/) {
};

module.exports = ViewController;
