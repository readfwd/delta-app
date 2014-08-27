var ol = require('../lib/ol');
var routeExtents = require('./route-extents');
var restrictedExtents = require('./restricted-extents');
var _ = require('lodash');
var templates = require('../lib/templates');
var T = require('../translate');
var $ = require('jquery');
var TemplateUtils = require('../controllers/template-utils');
var Util = require('../util');

var MapPresets = {};

MapPresets.registerPreset = function (name, preset) {
  MapPresets[name] = preset;
};

var gps2mp = Util.GPSToMercador;

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

var flatUIColors = [ 
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', 
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', 
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', 
    '#16a085', '#27ae60', '#2980b9', '#2c3e50' ];

var styleCache = [{}, {}];

function styleConstructor(mapSurface) {
  return function (feature) {
    var route = feature.getProperties().name;
    var routeIndex = parseInt(route.replace(/^D/, ''));
    route = /^D/.test(route) ? 'trail' + route : 'route' + route;
    var active = mapSurface.lastFeatureName === route ? 1 : 0;
    var styles = styleCache[active][route];
    if (!styles) {
      var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
      });
      var stroke = new ol.style.Stroke({
        color: active ? '#f6463b' : flatUIColors[routeIndex],
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

      styleCache[active][route] = styles;
    }
    return styles;
  };
}

var restrictedStyleCache;
function restrictedStyle() {
  if (!restrictedStyleCache) {
    var styles = [
      new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(231, 76, 60, 0.4)',
        }),
      }),
    ];
    restrictedStyleCache = styles;
  }
  return restrictedStyleCache;
}

MapPresets.registerPreset('routes', {
  extend: 'default',
  resetStyleOnHighlight: true,
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
  resetStyleOnHighlight: true,
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

MapPresets.registerPreset('restricted', {
  extend: 'default',
  layers: [ {
    type: 'geojson',
    url: 'assets/restricted.geojson',
    extent: deltaExtent,
    style: restrictedStyle,
  } ],
  features: _.map(_.keys(restrictedExtents), function(route) {
    return {
      type: 'extent',
      coords: gps2mp(restrictedExtents[route]),
      name: 'restricted' + route,
    };
  }),
});

var templates = [
  templates.ghid.landmarks.history,
  templates.ghid.landmarks.museums,
  templates.ghid.about.geographical,
];

var templateTitles = [
  T.span({ 
    en: 'Historic objectives near the Reserve',
    ro: 'Obiective istorice din vecinătatea Rezervaţiei' }),
  T.span({ 
    en: 'Museums and Memorial houses', 
    ro: 'Muzee şi case memoriale' }),
  T.span({ 
    en: 'Spatial extension and geographical coordinates', 
    ro: 'Extensiune spațială și coordonate geografice' }),
];

var templateColors = [
  '#67809F',
  '#a1605c',
  '#27ae60',
];

MapPresets.registerPreset('all', {
  extend: ['restricted', 'trails', 'routes'].concat(_.map(templates, function(t, idx) {
    var $el = $('<div>' + t({T: T}) + '</div>');
    var color = templateColors[idx];
    var features = TemplateUtils.setUpMapLinks($el, false);
    _.each(features, function(f) {
      f.overlay.color = color;
      f.overlay.click = function() {
        //this is the map surface
        this.emit('navigateToTemplate', {
          template: t,
          title: templateTitles[idx]
        });
      };
    });
    return {
      features: features,
    };
  })),
});

module.exports = MapPresets;
