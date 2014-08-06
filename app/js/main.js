'use strict';

require('famous-polyfills');

var _ = require('lodash');
var Engine = require('famous/core/Engine');
var Surface = require('famous/core/Surface');
var Modifier = require('famous/core/Modifier');
var Transform = require('famous/core/Transform');

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
      },
      classes: ['backfaceVisibility']
    });

    var initialTime = Date.now();
    var modifier = new Modifier({
      origin: [0.5, 0.5],
      transform: function () {
        return Transform.rotateY(0.002 * (Date.now() - initialTime));
      }
    });

    mainContext.add(modifier).add(surface);
  })
};

module.exports.launch();

