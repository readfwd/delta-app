'use strict';

require('famous-polyfills');

var _ = require('lodash');
var $ = require('jquery');
var cordova = require('./cordova-shim');
var maps = require('./maps');
var templates = require('./lib/templates');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function() {
      window.app = self;

      $('body').append('<div id="map"></div>');
      self.map = maps.createMap({
        target: 'map',
        url: 'assets/maps/delta',
        extent: [28.5, 44.33, 29.83, 45.6],

      });

    });
  })
};

module.exports.launch();

