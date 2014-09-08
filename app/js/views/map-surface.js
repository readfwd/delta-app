var util = require('util');
var _ = require('lodash');
var ol = require('../lib/ol');
var Famous = require('../shims/famous');
var $ = require('jquery');

function MapSurface(options) {
  var self = this;

  options = options || {};
  options.layers = options.layers || [];
  options.views = options.views || [];
  options.features = options.features || [];
  options.constructors = options.constructors || [];
  options.mapClasses = options.mapClasses || [];
  options.mapClasses.push('map');
  self.mapOptions = options;

  var id = 'map-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
  var content = '<div id="' + id + '" class="' + options.mapClasses.join(' ') + '" style="width: 100%; height: 100%"></div>';
  self.mapId = id;

  Famous.Surface.call(this, {
    content: content
  });

  var resizeScheduled = false;
  function onResize() {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    Famous.Engine.once('postrender', _.throttle(function () {
      resizeScheduled = false;
      if (!self.map) { return; }
      self.map.updateSize();
      self.updateNavDotHeading();
    }, 300));
  }

  self.on('resize', onResize);

  self.on('deploy', function () {
    Famous.Engine.once('postrender', function () {
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
    Famous.Engine.removeListener('resize', onResize);
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

    var sin, cos;
    var rot2 = self.map.getPixelFromCoordinate([0, 0]);
    var rot1 = self.map.getPixelFromCoordinate([0, 10]);
    rot1[0] -= rot2[0];
    rot1[1] -= rot2[1];
    var len = Math.sqrt(rot1[0] * rot1[0] + rot2[0] * rot2[0]);
    if (len) {
      sin = rot1[1] / len;
      cos = rot1[0] / len;
      rotation = Math.atan2(sin, cos);
    } else {
      rotation = self.map.getView().getRotation();
    }

    pos1[0] *= ratio;
    pos1[1] *= ratio;
    pos2[0] *= ratio;
    pos2[1] *= ratio;
    ctx.translate(pos1[0], pos1[1]);
    ctx.rotate(rotation);
    var delta = [pos2[0] - pos1[0], pos2[1] - pos1[1]];
    sin = Math.sin(-rotation);
    cos = Math.cos(-rotation);
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
    self.navDot.setPosition(self.lastLocation);
  }
  if (self.jumpControl) {
    self.jumpControl.toggleClass('hidden', 
      !self.boundingExtentsContaining(self.lastLocation).length);
  }
};

MapSurface.prototype.boundingExtentsContaining = function (coord) {
  var r = [];
  if (coord) {
    for (var i = 0, v = this.views, n = v.length; i < n; i++) {
      var extent = v[i].initialOptions.extent;
      if (extent && ol.extent.containsCoordinate(extent, coord)) {
        r.push(i);
      }
    }
  }
  return r;
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
      self.lastLocation = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
      self.updateMapDotLocation();
    }, function (err) {
      console.log('Could not get location: ' + err.message);
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
    if (self.lastLocation) {
      self.navigateToPoint(self.lastLocation);
    }
  });
  self.jumpControl = control;

  self.map.addControl(new ol.control.Control({
    element: control[0],
  }));
};

MapSurface.prototype.setView = function (index) {
  var view = this.views[index];
  var oldTileLayer = null;
  _.each(this.map.getLayers().getArray(), function(l) {
    if (l instanceof ol.layer.Tile) {
      oldTileLayer = l;
    }
  });
  if (oldTileLayer) {
    this.map.removeLayer(oldTileLayer);
  }
  this.map.addLayer(this.tileLayers[index]);
  this.map.setView(view);
  this.currentViewIndex = index;
  if (view.initialOptions.extent) {
    view.fitExtent(view.initialOptions.extent, this.map.getSize());
    if (view.initialOptions.zoom) {
      view.setZoom(view.initialOptions.zoom);
    } else {
      view.setZoom(view.getZoom() + 1);
    }
  }
};

MapSurface.prototype.setViewAtCoordinates = function (coord) {
  var self = this;
  var viewIndices = self.boundingExtentsContaining(coord);
  if (!viewIndices.length) {
    return false;
  }
  if (!_.contains(viewIndices, self.currentViewIndex)) {
    self.setView(viewIndices[0]);
  }
  return true;
};

MapSurface.prototype.navigateToPoint = function(coord, zoom, animated, isResolution) {
  var self = this;

  if (!self.map) {
    return;
  }

  self.setViewAtCoordinates(coord);

  if (animated === undefined) {
    animated = true;
  }

  var view = self.map.getView();
  if (animated && Famous.AnimationToggle.get()) {
    self.map.beforeRender(ol.animation.pan({
      duration: 700,
      source: view.getCenter(),
    }));
    self.map.beforeRender(ol.animation.zoom({
      duration: 700,
      resolution: view.getResolution(),
    }));
  }

  view.setCenter(coord);
  if (isResolution) {
    view.setResolution(zoom);
  } else {
    var zoomLevel = zoom || (view.initialOptions.maxZoom || 28);
    view.setZoom(zoomLevel);
  }
};

MapSurface.prototype.navigateToExtent = function(extent, animated) {
  var self = this;

  if (!self.map) {
    return;
  }

  var view = self.map.getView();
  var center = ol.extent.getCenter(extent);
  var resolution = view.getResolutionForExtent(extent, self.map.getSize());
  resolution = view.constrainResolution(resolution, 0, 1);

  self.navigateToPoint(center, resolution, animated, true);
};

MapSurface.prototype.navigateToFeature = function(featureName, animated) {
  var self = this;

  self.lastFeatureName = featureName;
  self.lastFeatureAnimated = animated;

  if (!featureName) {
    return;
  }

  if (!self.map) {
    return;
  }

  var feature = _.find(self.mapOptions.features, function (a) {
    return a.name === featureName;
  });


  if (!feature) {
    return;
  }

  switch (feature.type) {
    case 'point':
      self.navigateToPoint(feature.coords, feature.zoomLevel, animated);
      if (feature.overlay.popover) {
        var $mapel = $('#' + self.mapId);
        var pins = $mapel.find('.map-overlay-pin');
        pins.removeClass('overlay');
        pins.filter('.map-feature-' + feature.name).addClass('overlay');
      }
      break;
    case 'extent':
      self.navigateToExtent(feature.coords, animated);
      break;
  }

  // Refresh styles
  if (self.options.resetStyleOnHighlight) {
    _.each(self.map.getLayers().getArray(), function (layer) {
      if (layer instanceof ol.layer.Vector) {
        layer.setStyle(layer.getStyle());
      }
    });
  }
};

MapSurface.prototype.createMap = function (opts) {
  var self = this;

  var map = new ol.Map({
    target: opts.target
  });
  self.map = map;

  self.tileLayers = [];

  _.each(opts.layers, function (opt) {
    var layer;
    var layerOptions = {
      extent: opt.extent,
    };

    if (opt.type === 'tile') {
      if (opt.url) {
        layerOptions.source = new ol.source.XYZ({
          attributions: [
            ol.source.OSM.DATA_ATTRIBUTION
          ],
          url: opt.url + '/{z}/{x}/{y}.png'
        });
      }

      layer = new ol.layer.Tile(layerOptions);
    }

    if (opt.type === 'geojson') {
      if (opt.url) {
        layerOptions.source = new ol.source.GeoJSON({
          url: opt.url,
          projection: 'EPSG:3857',
        });
      }

      if (opt.styleConstructor) {
        layerOptions.style = opt.styleConstructor(self);
      } else {
        layerOptions.style = opt.style;
      }

      layer = new ol.layer.Vector(layerOptions);
    }

    if (opt.trim && opt.extent) {
      self.trimLayer(layer, opt.extent);
    }


    if (opt.type === 'tile') {
      self.tileLayers.push(layer);
    } else {
      map.addLayer(layer);
    }
  });

  self.views = _.map(opts.views, function (opt) {
    var viewOpts = _.extend({}, opt);
    var view = new ol.View(viewOpts);
    view.initialOptions = viewOpts;
    return view;
  });

  var $mapel = $('#' + opts.target);
  var dismissOverlays = function() {
    $mapel.find('.map-overlay-pin').removeClass('overlay');
  };
  $mapel[0].addEventListener('touchstart', dismissOverlays, true);
  $mapel[0].addEventListener('mousedown', dismissOverlays, true);

  _.each(opts.features, function(f) {
    if (f.type === 'point' && f.overlay) {
      var overlay = f.overlay;
      if (typeof(overlay) !== 'object') {
        overlay = {};
      }

      overlay.color = overlay.color || '#f9645c';
      overlay.positioning = overlay.positioning || 'bottom-center';

      var content = [];
      content.push('<div class="map-overlay-pin ');
      content.push('map-feature-' + f.name);
      content.push('">');
      if (overlay.popover) {
        content.push('<div class="map-overlay-popover">');
        content.push(overlay.popover);
        content.push('</div>');
      }
      content.push('<i class="fa fa-map-marker"></i>');
      content.push('</div>');
      var $el = $(content.join(''));
      $el[0].style.color = overlay.color;

      if (overlay.popover) {
        $el.on('mousedown touchstart', function() {
          $el.addClass('overlay');
        });
      }

      if (overlay.click) {
        Famous.FastClick($el, overlay.click.bind(self));
      }

      var mapOverlay = new ol.Overlay({
        element: $el[0],
        position: f.coords,
        positioning: overlay.positioning,
        stopEvent: !!(overlay.popover || overlay.click),
      });

      map.addOverlay(mapOverlay);
    }
  });

  self.setView(0);
  if (self.lastFeatureName) {
    self.navigateToFeature(self.lastFeatureName, self.lastFeatureAnimated);
  }
  self.createNavDot();
  self.createJumpHomeControl();

  _.each(opts.constructors, function(cb) {
    cb(self);
  });
};

module.exports = MapSurface;
