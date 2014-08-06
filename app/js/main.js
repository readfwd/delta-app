'use strict';

require('famous-polyfills');

var _ = require('lodash');
var $ = require('jquery');
var cordova = require('./cordova-shim');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function() {
      window.app = self;
      document.title = 'Altceva!';
      if (cordova.isMobile) {
        $('body').append('<h1>cordova works</h1>');
      } else {
        $('body').append('<h1>cordova shim works</h1>');
      }
    });
  })
};

module.exports.launch();

