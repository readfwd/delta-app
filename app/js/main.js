'use strict';

require('famous-polyfills');

var _ = require('lodash');
var cordova = require('./cordova-shim');
var ol = require('./ol.js');
var $ = require('jquery');

module.exports = {
  launch: _.once(function () {
    var self = this;
    cordova.ready(function() {
      window.app = self;

      $('body').append('<div id="map"></div>');

      var extent = ol.proj.transformExtent([28.5, 44.33, 29.83, 45.6], 'EPSG:4326', 'EPSG:3857');

      var map = new ol.Map({
          target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.XYZ({
              attributions: [
                ol.source.OSM.DATA_ATTRIBUTION
              ],
              url: 'assets/maps/delta/{z}/{x}/{y}.png'
            }),
            extent: extent
          })
        ],
        view: new ol.View({
          extent: extent,
          center: ol.proj.transform([29.165, 44.965], 'EPSG:4326', 'EPSG:3857'),
          minZoom: 8,
          maxZoom: 13,
          zoom: 9
        })
      });

      self.map = map;

    });
  })
};

module.exports.launch();

