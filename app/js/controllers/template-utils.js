var TemplateUtils = {};
var _ = require('lodash');
var $ = require('jquery');
var Famous = require('../shims/famous');
var T = require('../translate');

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
    var language = $el.parents('.lang');
    language = language.length ? language.attr('class').toString().split(' ') : [];
    language = language.filter(RegExp.prototype.test.bind(/^lang-/))[0].replace(/^lang-/, '');

    if (onClick) {
      Famous.FastClick($el, function () {
        onClick(name);
      });
    }

    if (!takenNames[name]) {
      takenNames[name] = {};
    }

    if (!takenNames[name][language]) {
      var feature = {
        type: 'point',
        overlay: {
          popover: $label.length ? $label.html() : undefined,
        },
        coords: coords,
        zoomLevel: isNaN(zoom) ? null : zoom,
        name: name,
      };
      takenNames[name][language] = feature;
    }
  });

  _.each(takenNames, function (value) {
    if (value[undefined]) {
      return value[undefined];
    }
    var translate = {};
    var feature = null;
    _.each(value, function (feat, lang) {
      feature = feature || feat;
      if (feat.overlay && feat.overlay.popover) {
        translate[lang] = feat.overlay.popover;
      }
    });
    if (Object.keys(translate).length) {
      feature.overlay.popover = T.span(translate);
    }
    features.push(feature);
  });

  return features;
};

module.exports = TemplateUtils;
