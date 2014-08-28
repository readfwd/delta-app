var TemplateUtils = {};
var _ = require('lodash');
var $ = require('jquery');
var Famous = require('../shims/famous');

TemplateUtils.setUpMapLinks = function (page, onClick) {
  var self = this;

  var links = page.find('a.map-link');
  links.on('click', function (evt) {
    evt.preventDefault();
  });

  if (onClick === undefined) {
    var MapController = require('./map-controller');
    onClick = function (name) {
      var vc = new MapController({
        preset: {
          extend: 'default',
          features: features,
        },
        titleBar: self.titleBar,
      });
      self.setNavigationItem(vc);
      vc.navigateToFeature(name);
    };
  }
  
  var features = [];
  var takenNames = {};
  _.each($.makeArray(links), function (link, idx) {
    var href = link.href;
    var params = href.replace(/^map:(\/\/)?/, '').split('/');
    var coords = Util.GPSToMercador([
      parseFloat(params[1]), 
      parseFloat(params[0]),
    ]);
    var zoom = parseInt(params[2]);
    var $el = $(link);
    var name = $el.data('name') || ('map-link-' + idx);
    var $label = $el.find('.map-label');

    if (onClick) {
      Famous.FastClick($el, function () {
        onClick(name);
      });
    }

    if (!takenNames[name]) {
      features.push({
        type: 'point',
        overlay: {
          popover: $label.length ? $label.html() : undefined,
        },
        coords: coords,
        zoomLevel: isNaN(zoom) ? null : zoom,
        name: name,
      });
      takenNames[name] = name;
    }
  });

  return features;
};

module.exports = TemplateUtils;
