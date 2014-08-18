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
    },
    open: {
      title: 'Open',
    },
    people: {
      title: 'People',
    },
    tabs: {
      title: 'Tabs',
    },
    guide: {
      title: 'Guide',
    },
    maps: {
      title: 'Maps',
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

  options.title = 'ARGO Open';

  MenuController.call(this, options);
}
util.inherits(MainMenuController, MenuController);

module.exports = MainMenuController;
