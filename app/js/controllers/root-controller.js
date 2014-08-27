var util = require('util');
var cordova = require('../shims/cordova');
var Famous = require('../shims/famous');
var ViewController = require('./view-controller');
var MainMenuController = require('../content/mainmenu-controller');

function RootController () {
  ViewController.apply(this, arguments);

  var self = this;

  self.context = Famous.Engine.createContext();
  self.context.setPerspective(100);
  self.menuController = new MainMenuController();
  self.buildRenderTree(self.context);

  if (cordova.present) {
    var backHandler = function () {
      self.menuController.emit('backbutton');
    };
    self.menuController.on('navigate', function () {
      document.addEventListener('backbutton', backHandler, false);
    });
    self.menuController.on('navigateBack', function () {
      document.removeEventListener('backbutton', backHandler);
    });
  }

  if (navigator.splashscreen) {
    Famous.Timer.after(function () {
      navigator.splashscreen.hide();
    }, 1);
  }
}
util.inherits(RootController, ViewController);

RootController.prototype.buildRenderTree = function (parentNode) {
  var self = this;
  var contentView = parentNode;

  if (cordova.iOS7App) {
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
