'use strict';

require('famous-polyfills');

var _ = require('lodash');
var Engine = require('famous/core/Engine');
var Surface = require('famous/core/Surface');
var Modifier = require('famous/core/Modifier');

module.exports = {
  launch: _.once(function () {
    window.app = this;
    document.title = 'Altceva!';

    var mainContext = Engine.createContext();
    var surface = new Surface({
      size: [200, 200],
      content: 'Lorem',
      properties: {
        textAlign: 'center',
        lineHeight: '200px',
        background: '#ddd',
      }
    });

    var modifier = new Modifier({
      origin: [0.5, 0.5]
    });

    mainContext.add(modifier).add(surface);
  })
};

module.exports.launch();

