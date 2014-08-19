var util = require('util');
var MenuController = require('./menu-controller');
var MapController = require('./map-controller');
var Famous = require('../shims/famous');
var _ = require('lodash');
var templates = require('../lib/templates');
var TemplateController = require('./template-controller');
var T = require('../translate');

function MainMenuController(options) {
  options = options || {};
  options.buttonDescriptors = {
    about: {
      title: T.span({
        ro: 'Despre Deltă',
        en: 'About the Delta',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates.article,
          title: 'Some Template',
          backIcon: 'fa-home',
        });
      },
    },
    restricted: {
      title: T.span({
        ro: 'Zone strict protejate',
        en: 'Preserved areas',
      }),
    },
    landmarks: {
      title: T.span({
        ro: 'Atracții turistice',
        en: 'Landmarks',
      }),
    },
    planning: {
      title: T.span({
        ro: 'Planificare',
        en: 'Planning',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates.planning,
          title: T.span({
            ro: 'Planificare',
            en: 'Planning',
          }),
          backIcon: 'fa-home',
        });
      },
    },
    routes: {
      title: T.span({
        ro: 'Trasee navale',
        en: 'Boat routes',
      }),
    },
    trails: {
      title: T.span({
        ro: 'Trasee terestre',
        en: 'Hiking trails',
      }),
    },
    maps: {
      title: T.span({
        ro: 'Harta Deltei',
        en: 'Map of the Delta',
      }),
      viewController: function () {
        return new MapController({
          backIcon: 'fa-home',
        });
      },
    },
    settings: {
    }
  };

  options.buttonLayout = [
    ['routes', 'trails'],
    ['landmarks', 'planning'],
    ['about', 'restricted'],
    ['maps'],
  ];

  options.title = T.span({
    ro: 'Delta Dunării',
    en: 'The Danube Delta',
  });

  MenuController.call(this, options);
}
util.inherits(MainMenuController, MenuController);

module.exports = MainMenuController;
