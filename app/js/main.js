'use strict';

require('famous-polyfills');

var _ = require('lodash');
var cordova = require('./cordova-shim');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function() {
      window.app = self;
    });
  })
};

module.exports.launch();

