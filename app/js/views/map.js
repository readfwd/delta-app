var util = require('util');
var View = require('famous/core/View');
var Surface = require('famous/core/Surface');
var Timer = require('famous/utilities/Timer');
var _ = require('lodash');
var Engine = require('famous/core/Engine');

function MapView(options) {
  var self = this;

  View.apply(this, arguments);
  var surface = new Surface({
    content: '<div id="map" style="width: 100%; height: 100%"></div>',
  });

  self.add(surface);

  surface.on('deploy', function() {
    Timer.after(function() {
      var map = self.createMap(_.extend({
        target: 'map'
      }, options));

      map.updateSize();

      Engine.on('resize', _.throttle(function () {
        Timer.after(function() {
          map.updateSize();
        }, 2);
      }, 100));
    }, 1);
  });
}
util.inherits(MapView, View);

MapView.prototype.createMap = function (opts) {
  var extent = ol.proj.transformExtent(opts.extent, 'EPSG:4326', 'EPSG:3857');
  var center = [
    (opts.extent[0] + opts.extent[2]) * 0.5,
    (opts.extent[1] + opts.extent[3]) * 0.5
  ];
  center = ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857');

  var mapLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: [
        ol.source.OSM.DATA_ATTRIBUTION
      ],
      url: opts.url + '/{z}/{x}/{y}.png'
    }),
    extent: extent
  });

  mapLayer.on('precompose', function(event) {
    var ctx = event.context;
    ctx.save();
    var pos1 = map.getPixelFromCoordinate([extent[0], extent[1]]);
    var pos2 = map.getPixelFromCoordinate([extent[2], extent[3]]);
    var ratio = window.devicePixelRatio;
    var rotation = view.getRotation();
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

  mapLayer.on('postcompose', function(event) {
    var ctx = event.context;
    ctx.restore();
  });

  var view = new ol.View({
    extent: extent,
    center: center,
    minZoom: 8,
    maxZoom: 13,
  });

  var map = new ol.Map({
      target: opts.target,
    layers: [mapLayer],
    view: view
  });

  view.fitExtent(extent, map.getSize());
  view.setZoom(view.getZoom() + 1);
  return map;
}

module.exports = MapView;
