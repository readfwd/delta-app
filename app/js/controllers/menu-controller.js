var util = require('util');
var ViewController = require('./view-controller');
var MapView = require('../views/map');

function MenuController() {
}
util.inherits(MenuController, ViewController)

MenuController.prototype.loadView = function () {
  var self = this;

  self.view = new MapView({
    url: 'assets/maps/delta',
    extent: [28.5, 44.33, 29.83, 45.6],
  });
}

module.exports = MenuController;
