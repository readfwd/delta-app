'use strict';

require('famous-polyfills');

var _ = require('lodash');
var Engine = require('famous/core/Engine');
var Surface = require('famous/core/Surface');
var ImageSurface = require('famous/surfaces/ImageSurface');
var RenderNode = require('famous/core/RenderNode');
var Modifier = require('famous/core/Modifier');
var Transform = require('famous/core/Transform');
var GridLayout = require('famous/views/GridLayout');
var ScrollView = require('famous/views/ScrollView');

module.exports = {
  launch: _.once(function () {
    window.app = this;
    document.title = 'Altceva!';

    var mainContext = Engine.createContext();

    var scrollView = new ScrollView();

    var numSurfaces = 24;
    var height = 300;

    var grid = new GridLayout({
      dimensions: [2, numSurfaces / 2]
    });

    var surfaces = [];
    grid.sequenceFrom(surfaces);


    var tempSurface, tempMod, tempNode, initialTime = Date.now();
    for (var i = 0; i < numSurfaces; i++) {
      tempSurface = new ImageSurface({
        content: 'http://placekitten.com/1000/10' + ((i < 10) ? ('0' + i) : i),
        size: [undefined, height],
        classes: ['backfaceVisibility']
      });


      tempMod = new Modifier({
        origin: [0.5, 0.5],
        transform: function () {
          return Transform.rotateY(0.002 * (Date.now() - initialTime));
        }
      });
      
      tempSurface.pipe(scrollView);

      tempNode = new RenderNode();
      tempNode.add(tempMod).add(tempSurface);
      surfaces.push(tempNode);
    }

    var gridModifier = new Modifier({
      size: [undefined, (numSurfaces * height) / 2]
    });
    var renderNode = new RenderNode();
    renderNode.add(gridModifier).add(grid);

    scrollView.sequenceFrom([renderNode]);

    mainContext.add(scrollView);
  })
};

module.exports.launch();

