var util = require('util');
var MenuController = require('./menu-controller');
var MapController = require('./map-controller');
var Famous = require('../shims/famous');
var _ = require('lodash');
var templates = require('../lib/templates');
var TemplateController = require('./template-controller');

function MainMenuController(options) {
  options = options || {};
  options.buttonDescriptors = {
    schedule: {
      title: 'Schedule',
      span: 1,
      viewController: function () {
        return new TemplateController({
          template: templates.article,
          title: 'Some Template',
          backIcon: 'fa-home',
        });
      },
    },
    venues: {
      title: 'Venues',
      span: 1,
    },
    open: {
      title: 'Open',
      span: 1,
    },
    people: {
      title: 'People',
      span: 1,
    },
    tabs: {
      title: 'Tabs',
      span: 1,
    },
    guide: {
      title: 'Guide',
      span: 1,
    },
    maps: {
      title: 'Maps',
      span: 2,
      viewController: function () {
        return new MapController({
          backIcon: 'fa-home',
        });
      },
    },
    settings: {
      title: 'Settings',
    }
  };

  options.scrollable = true;

  options.buttonLayout = [
    ['schedule', 'venues'],
    ['open', 'people'],
    ['tabs', 'guide'],
    ['maps'],
  ];

  MenuController.call(this, options);
}
util.inherits(MainMenuController, MenuController);

module.exports = MainMenuController;
