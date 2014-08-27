var ol = require('./lib/ol');

Util = {};

Util.GPSToMercador = function (ext) {
  if (ext.length === 4) {
    return ol.proj.transformExtent(ext, 'EPSG:4326', 'EPSG:3857');
  } else {
    return ol.proj.transform(ext, 'EPSG:4326', 'EPSG:3857');
  }
};

module.exports = Util;
