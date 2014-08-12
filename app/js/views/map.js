var util = require('util');
var View = require('famous/core/View');
var Surface = require('famous/core/Surface');
var Timer = require('famous/utilities/Timer');
var _ = require('lodash');
var Engine = require('famous/core/Engine');
var $ = require('jquery');

function MapView(options) {
  var self = this;

  View.apply(this, arguments);
  var id = 'map-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
  var surface = new Surface({
    content: '<div id="' + id + '" class="map" style="width: 100%; height: 100%"></div>',
  });

  self.add(surface);

  surface.on('deploy', function() {
    Timer.after(function() {
      self.createMap(_.extend({
        target: id
      }, options));

      self.map.updateSize();

      Engine.on('resize', _.throttle(function () {
        Timer.after(function() {
          self.map.updateSize();
        }, 2);
      }, 100));
    }, 1);
  });
}
util.inherits(MapView, View);

MapView.prototype.trimLayer = function (layer, extent) {
  var self = this;

  layer.on('precompose', function(event) {
    var ctx = event.context;
    ctx.save();
    var pos1 = self.map.getPixelFromCoordinate([extent[0], extent[1]]);
    var pos2 = self.map.getPixelFromCoordinate([extent[2], extent[3]]);
    var ratio = window.devicePixelRatio;
    var rotation = self.map.getView().getRotation();
    pos1[0] *= ratio;
    pos1[1] *= ratio;
    pos2[0] *= ratio;
    pos2[1] *= ratio;
    ctx.translate(pos1[0], pos1[1]);
    ctx.rotate(rotation);
    var delta = [pos2[0] - pos1[0], pos2[1] - pos1[1]];
    var sin = Math.sin(-rotation);
    var cos = Math.cos(-rotation);
    delta = [delta[0] * cos - delta[1] * sin, delta[0] * sin + delta[1] * cos];
    ctx.beginPath();
    ctx.rect(0, 0, delta[0], delta[1]);
    ctx.clip();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });

  layer.on('postcompose', function(event) {
    var ctx = event.context;
    ctx.restore();
  });
}

MapView.prototype.createNavDot = function (opts) {
  var navDot = $('<div class="map-navdot">');
  var overlay = new ol.Overlay({
    element: navDot,
    positioning: 'center-center',
    stopEvent: false
  });
  this.map.addOverlay(overlay);
  this.navDot = overlay;
};

MapView.prototype.setNavDotHidden = function(hidden) {
  $(this.navDot.getElement()).toggleClass('hidden', hidden);
};

MapView.prototype.stopLocationUpdates = function () {
  var self = this;
  if (self.watchId !== undefined) {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.clearWatch(self.watchId);
    }
    self.watchId = undefined;
  }
}

MapView.prototype.startLocationUpdates = function () {
  var self = this;
  if (self.watchId !== undefined) {
    self.stopLocationUpdates();
  }
  if (window.navigator.geolocation) {
    self.watchId = window.navigator.geolocation.watchPosition(function (position) {
      alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
    }, function (err) {
      alert(err.message);
    }, {
      enableHighAccuracy: true,
      maximumAge: 15 * 60 * 1000,
    });
  }
}

MapView.prototype.createMap = function (opts) {
  var map = new ol.Map({
    target: opts.target
  });
  this.map = map;

  var extent = ol.proj.transformExtent(opts.extent, 'EPSG:4326', 'EPSG:3857');

  var mapLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: [
        ol.source.OSM.DATA_ATTRIBUTION
      ],
      url: opts.url + '/{z}/{x}/{y}.png'
    }),
    extent: extent
  });
  this.trimLayer(mapLayer, extent);
  map.addLayer(mapLayer);

  var view = new ol.View({
    extent: extent,
    minZoom: 8,
    maxZoom: 13,
  });
  map.setView(view);
  view.fitExtent(extent, map.getSize());
  view.setZoom(view.getZoom() + 1);

  this.createNavDot();
}

module.exports = MapView;
