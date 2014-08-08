'use strict';

require('famous-polyfills');

var _ = require('lodash');
var cordova = require('./cordova-shim');
var ol = require('./ol.js');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function() {
      window.app = self;

      var map = new ol.Map({
          target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'sat'})
          })
        ],
        view: new ol.View({
          center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
          zoom: 4
        })
      });

      self.map = map;

    });
  })
};

module.exports.launch();

