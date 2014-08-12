var util = require('util');
var ViewController = require('./view-controller');
var Engine = require('famous/core/Engine');
var Surface = require('famous/core/Surface');
var cordova = require('../cordova-shim');
var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');
var MenuController = require('./menu-controller');
var View = require('famous/core/View');
var Transform = require('famous/core/Transform');
var Modifier = require('famous/core/Modifier');

function RootController() {
  ViewController.apply(this, arguments);

  var self = this;
  self.context = Engine.createContext();
  self.menuController = new MenuController();
  self.context.add(self.getView());
}
util.inherits(RootController, ViewController);

RootController.prototype.loadView = function() {
  var self = this;
  var contentView = new View();

  contentView.add(new Modifier({
    transform: Transform.behind
  })).add(new Surface({
    classes: ['content-bg']
  }));

  self.contentView = contentView;

  if (cordova.present && window.device.platform === 'iOS' && parseInt(window.device.version) >= 7) {
    var layout = new HeaderFooterLayout({
      headerSize: 20
    });
    layout.header.add(new Surface({
      classes: ['status-bar']
    }));
    layout.content.add(contentView);

    self.view = layout;
  } else {
    self.view = contentView;
  }

  self.contentView.add(self.menuController.getView());
}

module.exports = RootController;
