
'use strict';

require('famous-polyfills');

var _ = require('lodash');
var cordova = require('./shims/cordova');
var RootController = require('./controllers/root-controller');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function () {
      window.app = self;
      self.rootController = new RootController();
      // self.rootController.menuController.navigateToLabel('emergency');
    });
  })
};

module.exports.launch();
