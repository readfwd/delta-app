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

var styleCache = [{}, {}];

function styleConstructor(mapSurface) {
  return function (feature) {
    var traseu = feature.getProperties().NumarTrase;
    traseu = /^D/.test(traseu) ? 'trail' + traseu : 'route' + traseu;
    var active = mapSurface.lastFeatureName === traseu ? 1 : 0;
    var styles = styleCache[active][traseu];
    if (!styles) {
      var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
      });
      var stroke = new ol.style.Stroke({
        color: active ? '#f6463b' : '#3399cc',
        width: active ? 2.5 : 1.25,
      });
      styles = [
        new ol.style.Style({
          image: new ol.style.Circle({
            fill: fill,
            stroke: stroke,
            radius: 5
          }),
          fill: fill,
          stroke: stroke,
          zIndex: active ? 30 : undefined,
        })
      ];

      styleCache[active][traseu] = styles;
    }
    return styles;
  };
}

MapPresets.registerPreset('routes', {
  extend: 'default',
  layers: [ {
    type: 'geojson',
    url: 'assets/routes.geojson',
    extent: deltaExtent,
    styleConstructor: styleConstructor,
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
    styleConstructor: styleConstructor,
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
