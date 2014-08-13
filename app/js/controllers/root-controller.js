var util = require('util');
var cordova = require('../shims/cordova');
var Famous = require('../shims/famous');
var ViewController = require('./view-controller');
var MenuController = require('./menu-controller');

function RootController () {
  ViewController.apply(this, arguments);

  var self = this;
  self.context = Famous.Engine.createContext();
  self.menuController = new MenuController();
  self.buildRenderTree(self.context);
}
util.inherits(RootController, ViewController);

RootController.prototype.buildRenderTree = function (parentNode) {
  var self = this;
  var contentView = parentNode;

  var iOS7 = (cordova.present &&
              window.device.platform === 'iOS' &&
              parseInt(window.device.version) >= 7);
  if (iOS7) {
    var layout = new Famous.HeaderFooterLayout({
      headerSize: 20
    });
    layout.header.add(new Famous.Surface({
      classes: ['status-bar']
    }));

    contentView = layout.content;
    parentNode.add(layout);
  }

  self.menuController.buildRenderTree(contentView);
};

module.exports = RootController;
