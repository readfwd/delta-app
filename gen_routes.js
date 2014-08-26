#!/usr/bin/env node

var fs = require('fs');
var _ = require('lodash');
var geo = JSON.parse(fs.readFileSync('./raw_routes.geojson'));
var exec = require('child_process').exec;

//Configurable vars

var offset = [0, 0];
var trailOffsets = {
};

var filter = /^.*$/;

//End of configurable vars

geo.features = _.sortBy(geo.features, function (feature) {
  return feature.properties.NumarTrase;
});

var extents = {};

_.each(geo.features, function (feature) {
  var traseu = feature.properties.NumarTrase;
  var off = trailOffsets[traseu] || [0, 0];
  off[0] += offset[0];
  off[1] += offset[1];
  var extent = extents[traseu] || [Infinity, Infinity, -Infinity, -Infinity];
  extents[traseu] = extent;

  function fixCoords(v) {
    _.each(v, function (coord, i) {
      if (typeof(coord) === 'string') {
        coord = coord.split(',');
        coord[0] = parseFloat(coord[0]);
        coord[1] = parseFloat(coord[1]);
        v[i] = coord;
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
    });
  }

  if (/^Multi/.test(feature.geometry.type)) {
   _.each(feature.geometry.coordinates, fixCoords);
  } else {
    fixCoords(feature.geometry.coordinates);
  }
});

geo.features = _.filter(geo.features, function(feature) {
  return filter.test(feature.properties.NumarTrase);
});

var allFeatures = geo.features;
var routeFeatures = _.filter(allFeatures, function(feature) {
  return /^[0-9]+$/.test(feature.properties.NumarTrase);
});
var trailFeatures = _.filter(allFeatures, function(feature) {
  return /^D[0-9]+$/.test(feature.properties.NumarTrase);
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
