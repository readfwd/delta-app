#!/usr/bin/env node

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;

//Configurable vars

var offset = [-0.001900034613999999999999999996993239897, -0.00033912515641479129895961294911968155929999999999];
var trailOffsets = {
};

var filter = /^.*$/;

//End of configurable vars

function processGeo(geo, extraProps) {
  var extents = {};
  extraProps = extraProps || {};

  _.each(geo.features, function (feature) {
    var traseu = feature.properties.NumarTrase || feature.properties.name;
    feature.properties = _.extend({ name: traseu }, extraProps);
    var off = trailOffsets[traseu] || [0, 0];
    off[0] += offset[0];
    off[1] += offset[1];
    var extent = extents[traseu] || [Infinity, Infinity, -Infinity, -Infinity];
    extents[traseu] = extent;

    function fixCoords(coord) {
      if (typeof(coord) === 'string') {
        coord = coord.split(',');
        coord[0] = parseFloat(coord[0]);
        coord[1] = parseFloat(coord[1]);
      }
      coord[0] += off[0];
      coord[1] += off[1];
      if (coord[0] < extent[0]) {
        extent[0] = coord[0];
      }
      if (coord[0] > extent[2]) {
        extent[2] = coord[0];
      }
      if (coord[1] < extent[1]) {
        extent[1] = coord[1];
      }
      if (coord[1] > extent[3]) {
        extent[3] = coord[1];
      }

      return coord;
    }

    function processVector(v) {
      if (typeof(v[0]) === 'object') {
       _.each(v, function(coord, idx) {
         var r = processVector(coord);
         if (r) {
           v[idx] = r;
         }
       });
       return null;
      } else {
        return fixCoords(v);
      }
    }
    processVector(feature.geometry.coordinates);
  });

  geo.features = _.sortBy(geo.features, function (feature) {
    return feature.properties.name;
  });

  return extents;
}

var geo = JSON.parse(fs.readFileSync('./raw_routes.geojson'));
var extents =processGeo(geo);

geo.features = _.filter(geo.features, function(feature) {
  return filter.test(feature.properties.name);
});

var allFeatures = geo.features;
var routeFeatures = _.filter(allFeatures, function(feature) {
  return /^[0-9]+$/.test(feature.properties.name);
});
var trailFeatures = _.filter(allFeatures, function(feature) {
  return /^D[0-9]+$/.test(feature.properties.name);
});

fs.writeFile('./app/js/content/route-extents.json', JSON.stringify(extents));
geo.features = routeFeatures;
fs.writeFile('./app/assets/routes.geojson', JSON.stringify(geo));
geo.features = trailFeatures;
fs.writeFile('./app/assets/trails.geojson', JSON.stringify(geo));
geo.features = allFeatures;

function commitAndPush() {
  fs.writeFileSync('/tmp/routes-gist/routes.geojson', JSON.stringify(geo));
  exec('cd /tmp/routes-gist && git add routes.geojson && git commit -m "update" && git push');
}
if (process.env.MAP_GIST) {
  if (!fs.existsSync('/tmp/routes-gist')) {
    exec('cd /tmp && git clone "' + process.env.MAP_GIST + '" routes-gist', commitAndPush);
  } else {
    commitAndPush();
  }
}

var res = JSON.parse(fs.readFileSync('./raw_restricted.geojson'));
var resExtents = processGeo(res, { featureType: 'restrictedArea' });
fs.writeFile('./app/js/content/restricted-extents.json', JSON.stringify(resExtents));
fs.writeFile('./app/assets/restricted.geojson', JSON.stringify(res));
