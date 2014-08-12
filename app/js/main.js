'use strict';

require('famous-polyfills');

var _ = require('lodash');
var $ = require('jquery');
var cordova = require('./shims/cordova');
var maps = require('./shims/maps');
var templates = require('./lib/templates');
var RootController = require('./controllers/root-controller');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function () {
      window.app = self;
      self.rootController = new RootController();
    });
  })
};

module.exports.launch();
