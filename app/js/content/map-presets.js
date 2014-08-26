var ol = require('../lib/ol');
var routeExtents = require('./route-extents');
var _ = require('lodash');

var MapPresets = {};

MapPresets.registerPreset = function (name, preset) {
  MapPresets[name] = preset;
};

function gps2mp(ext) {
  if (ext.length === 4) {
    return ol.proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857');
  } else {
    return ol.proj.transform(ext, 'EPSG:4326', 'EPSG:3857');
  }
}

var deltaExtent = gps2mp([28.1,44.3296,29.8324,45.6004]);

MapPresets.registerPreset('default', {
  layers: [ {
    type: 'tile',
    url: 'assets/maps/delta',
    extent: deltaExtent,
    trim: true,
  } ],
  views: [ {
    minZoom: 8,
    maxZoom: 13,
    zoom: 10,
    extent: deltaExtent,
  } ],
});

MapPresets.registerPreset('routes', {
  extend: 'default',
  layers: [ {
    type: 'geojson',
    url: 'assets/routes.geojson',
    extent: deltaExtent,
  } ],
  features: _.map(_.filter(_.keys(routeExtents), 
                RegExp.prototype.test.bind(/^[0-9]+/)), 
              function(route) {
    return {
      type: 'extent',
      coords: gps2mp(routeExtents[route]),
      name: 'route' + route,
    };
  }),
});

MapPresets.registerPreset('trails', {
  extend: 'default',
  layers: [ {
    type: 'geojson',
    url: 'assets/trails.geojson',
    extent: deltaExtent,
  } ],
  features: _.map(_.filter(_.keys(routeExtents), 
                RegExp.prototype.test.bind(/^D[0-9]+/)), 
              function(route) {
    return {
      type: 'extent',
      coords: gps2mp(routeExtents[route]),
      name: 'trail' + route,
    };
  }),
});

module.exports = MapPresets;
