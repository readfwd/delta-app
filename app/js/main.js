'use strict';

var _ = require('lodash');

module.exports = {
  launch: _.once(function () {
    window.app = this;
    document.title = 'Altceva!';
  })
};

module.exports.launch();

