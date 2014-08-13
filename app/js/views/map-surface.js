var util = require('util');
var _ = require('lodash');
var ol = require('../lib/ol');
var Famous = require('../shims/famous');
var $ = require('jquery');

function MapSurface(options) {
  var self = this;

  var id = 'map-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
  options.content = '<div id="' + id + '" class="map" style="width: 100%; height: 100%"></div>';

  Famous.Surface.call(this, options);

  function once(emitter, type, f) {
    function cb() {
      f();
      emitter.removeListener(type, cb);
    }
    emitter.on(type, cb);
  }

  var resizeScheduled = false;
  function onResize() {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    once(Famous.Engine, 'postrender', _.throttle(function () {
      self.map.updateSize();
      self.updateNavDotHeading();
      resizeScheduled = false;
    }, 300));
  }


  self.on('deploy', function () {
    once(Famous.Engine, 'postrender', function () {
      $('#' + id).html('');
      self.createMap(_.extend({
        target: id
      }, options));

      self.map.updateSize();
      self.startLocationUpdates();
      self.startHeadingUpdates();

      Famous.Engine.on('resize', onResize);
    });
  });

  self.on('recall', function () {
    self.map = undefined;
    self.navDot = undefined;
    self.jumpControl = undefined;
    Engine.removeListener('resize', onResize);
    self.stopLocationUpdates();
    self.stopHeadingUpdates();
  });
}
util.inherits(MapSurface, Famous.Surface);

MapSurface.prototype.trimLayer = function (layer, extent) {
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
};

MapSurface.prototype.createNavDot = function () {
  var navDot = $('<div class="map-navdot">');
  var overlay = new ol.Overlay({
    element: navDot,
    positioning: 'center-center',
    stopEvent: false
  });
  this.map.addOverlay(overlay);
  this.navDot = overlay;
  this.map.getView().on('change:rotation', this.updateNavDotHeading.bind(this));
};

MapSurface.prototype.setNavDotHidden = function(hidden) {
  $(this.navDot.getElement()).toggleClass('hidden', hidden);
};

MapSurface.prototype.stopLocationUpdates = function () {
  var self = this;
  if (self.watchId !== undefined) {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.clearWatch(self.watchId);
    }
    self.watchId = undefined;
  }
};

MapSurface.prototype.updateMapDotLocation = function () {
  var self = this;
  if (self.navDot && self.lastLocation) {
    coords = ol.proj.transform(self.lastLocation, 'EPSG:4326', 'EPSG:3857');
    self.navDot.setPosition(coords);
  }
  if (self.jumpControl) {
    self.jumpControl.toggleClass('hidden', 
      !ol.extent.containsCoordinate(self.boundingExtent, self.lastLocation));
  }
};

MapSurface.prototype.startLocationUpdates = function () {
  var self = this;
  if (self.watchId !== undefined) {
    self.stopLocationUpdates();
  }
  if (window.navigator.geolocation) {
    self.watchId = window.navigator.geolocation.watchPosition(function (position) {
      var coords = [position.coords.latitude, position.coords.longitude];
      //Mock coords
      //coords = [28.787548, 45.172372]; //Fabrica de șnițele
      //coords = [26.030969, 44.930918]; //Service de MacBook-uri
      self.lastLocation = coords;
      self.updateMapDotLocation();
    }, function (err) {
      alert(err.message);
    }, {
      enableHighAccuracy: true,
      maximumAge: 15 * 60 * 1000,
    });
  }
};

MapSurface.prototype.stopHeadingUpdates = function () {
  var self = this;
  if (self.watchIdCompass !== undefined) {
    if (window.navigator.compass) {
      window.navigator.compass.clearWatch(self.watchIdCompass);
    }
    self.watchIdCompass = undefined;
  }
};

MapSurface.prototype.updateNavDotHeading = function () {
  var self = this;

  if (self.heading === undefined || self.map === undefined) {
    return;
  }

  function lowPass(lastVal, newVal, period, cutoff) {
    var RC = 1.0 / cutoff;
    var alpha = period / (period + RC);
    return newVal * alpha + lastVal * (1.0 - alpha);
  }

  var rot = self.heading + self.map.getView().getRotation() * (180 / Math.PI);
  if (window.orientation) {
    rot += window.orientation;
  }
  var lrot = self.lastNavDotRotation;
  if (lrot) {
    // To prevent animation jerkyness
    while (rot > lrot + 180) { rot -= 360; }
    while (rot < lrot - 180) { rot += 360; }

    // Add a low pass filter for good measure
    rot = lowPass(lrot, rot, 0.1, 10/*Hz*/);
  }
  self.lastNavDotRotation = rot;
  $(self.navDot.getElement()).css('transform', 'rotate(' + rot + 'deg)');
};

MapSurface.prototype.startHeadingUpdates = function () {
  var self = this;
  if (self.watchIdCompass !== undefined) {
    self.stopHeadingUpdates();
  }
  if (window.navigator.compass) {
    self.watchIdCompass = window.navigator.compass.watchHeading(function (heading) {
      if (self.navDot) {
        self.heading = heading.magneticHeading;
        self.updateNavDotHeading();
      }
    }, function () {
    }, {
      frequency: 100,
    });
  }
};

MapSurface.prototype.createJumpHomeControl = function () {
  var self = this;

  var control = $('<div class="ol-control ol-unselectable map-jumpcontrol hidden"></div>');
  var button = $('<button class="ol-has-tooltip" type="button">' +
                    '<span role="tooltip">Jump to my location</span>I' +
                 '</button>');
  control.append(button);
  button.on('click', function() {
    if (!self.map ||
        !self.lastLocation ||
        !ol.extent.containsCoordinate(self.boundingExtent, self.lastLocation)) {
      return;
    }
    var view = self.map.getView();
    var pan = ol.animation.pan({
      duration: 700,
      source: view.getCenter()
    });
    var zoom = ol.animation.zoom({
      duration: 700,
      resolution: view.getResolution()
    });
    self.map.beforeRender(pan);
    self.map.beforeRender(zoom);
    view.setCenter(ol.proj.transform(self.lastLocation, 'EPSG:4326', 'EPSG:3857'));
    view.setZoom(12);
  });
  self.jumpControl = control;

  self.map.addControl(new ol.control.Control({
    element: control[0],
  }));
};

MapSurface.prototype.createMap = function (opts) {
  var map = new ol.Map({
    target: opts.target
  });
  this.map = map;

  this.boundingExtent = opts.extent;
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
  this.createJumpHomeControl();
};

module.exports = MapSurface;
