
'use strict';

require('famous-polyfills');

var _ = require('lodash');
var cordova = require('./shims/cordova');
var analytics = require('./shims/analytics');
var RootController = require('./controllers/root-controller');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function () {
      window.app = self;
      self.rootController = new RootController();
      
      analytics.init('UA-54503159-1');
      analytics.trackEvent('Application', 'started', cordova.platformId || 'unknown');
    });
  })
};

module.exports.launch();
