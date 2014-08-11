'use strict';

require('famous-polyfills');

var _ = require('lodash');
var cordova = require('./cordova-shim');
var $ = require('jquery');
var maps = require('./maps');
var RootController = require('./controllers/root-controller');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function() {
      window.app = self;
      self.rootController = new RootController();
    });
  })
};

module.exports.launch();

