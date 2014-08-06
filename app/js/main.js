'use strict';

require('famous-polyfills');

var _ = require('lodash');
var Engine = require('famous/core/Engine');
var Surface = require('famous/core/Surface');
var Modifier = require('famous/core/Modifier');
var Transform = require('famous/core/Transform');
var GridLayout = require("famous/views/GridLayout");

module.exports = {
  launch: _.once(function () {
    window.app = this;
    document.title = 'Altceva!';

    var mainContext = Engine.createContext();

    var grid = new GridLayout({
      dimensions: [4, 2]
    });

    var surfaces = [];
    grid.sequenceFrom(surfaces);

    for (var i = 0; i < 8; i++) {
      surfaces.push(new Surface({
        content: 'panel ' + (i + 1),
        size: [undefined, undefined],
        properties: {
          backgroundColor: 'hsl(' + (i * 360 / 8) + ', 100%, 50%)',
          color: '#333',
          lineHeight: '100px',
          textAlign: 'center'
        }
      }));
    }

    mainContext.add(grid);
  })
};

module.exports.launch();

