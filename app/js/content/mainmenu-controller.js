var util = require('util');
var MenuController = require('../controllers/menu-controller');
var MapController = require('../controllers/map-controller');
var Famous = require('../shims/famous');
var templates = require('../lib/templates');
var TemplateController = require('../controllers/template-controller');
var EmergencyController = require('../controllers/emergency-controller');
var MapSplitController = require('../controllers/mapsplit-controller');
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
          template: templates.ghid.about.index,
          title: T.span({
            ro: 'Despre Deltă',
            en: 'About the Delta',
          }),
          backIcon: 'fa-home',
        });
      },
    },
    restricted: {
      title: T.span({
        ro: 'Zone strict protejate',
        en: 'Preserved areas',
      }),
      viewController: function () {
        return new MapSplitController({
          template: templates.ghid.restricted.index,
          mapOptions: {
            preset: 'restricted',
          },
          title: T.span({
            ro: 'Zone strict protejate',
            en: 'Preserved areas',
          }),
          backIcon: 'fa-home',
        });
      },
    },
    landmarks: {
      title: T.span({
        ro: 'Cultură și istorie',
        en: 'Culture and history',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates.ghid.landmarks.index,
          title: T.span({
            ro: 'Cultură și istorie',
            en: 'Culture and history',
          }),
          backIcon: 'fa-home',
        });
      },
    },
    planning: {
      title: T.span({
        ro: 'Planificare',
        en: 'Planning',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates.ghid.planning.index,
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
      viewController: function () {
        return new MapSplitController({
          template: templates.ghid.routes.index,
          mapOptions: {
            preset: 'routes',
          },
          title: T.span({
            ro: 'Trasee navale',
            en: 'Boat routes',
          }),
          backIcon: 'fa-home',
        });
      },
    },
    trails: {
      title: T.span({
        ro: 'Trasee terestre',
        en: 'Hiking trails',
      }),
      viewController: function () {
        return new MapSplitController({
          template: templates.ghid.trails.index,
          mapOptions: {
            preset: 'trails',
          },
          title: T.span({
            ro: 'Trasee terestre',
            en: 'Hiking trails',
          }),
          backIcon: 'fa-home',
        });
      },
    },
    maps: {
      title: T.span({
        ro: 'Harta Deltei',
        en: 'Map of the Delta',
      }),
      viewController: function () {
        return new MapController({
          backIcon: 'fa-home',
          preset: 'all',
        });
      },
    },
    'code-of-conduct': {
      title: T.span({
        ro: 'Cod de conduită',
        en: 'Code of Conduct',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates['code-of-conduct'],
          title: T.span({
            ro: 'Cod de conduită',
            en: 'Code of Conduct'
          }),
          backIcon: 'fa-home',
        });
      }
    },
    'emergency': {
      title: T.span({
        ro: 'Urgențe',
        en: 'Emergency',
      }),
      viewController: function () {
        return new EmergencyController({
          template: templates['emergency'],
          title: T.span({
            ro: 'Urgențe',
            en: 'Emergency'
          }),
          backIcon: 'fa-home',
        });
      }
    },
    'about-app': {
      title: T.span({
        ro: 'Despre aplicație',
        en: 'About app',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates['about-app'],
          title: T.span({
            ro: 'Despre aplicație',
            en: 'About app',
          }),
          backIcon: 'fa-home',
        });
      }
    },
    settings: {
      title: T.span({
        ro: 'Setări/Settings',
        en: 'Setări/Settings',
      }),
      viewController: function () {
        return new TemplateController({
          template: templates.ghid.settings.index,
          settings: {
            lang: {
              get: function () {
                return T.getLanguage() === 'en';
              },
              set: function (value) {
                T.setLanguage(value? 'en' : 'ro');
              },
            },
            animations: {
              get: Famous.AnimationToggle.get,
              set: Famous.AnimationToggle.set,
            },
          },
          title: T.span({
            ro: 'Setări',
            en: 'Settings',
          }),
          backIcon: 'fa-home',
        });
      },
    }
  };

  options.buttonLayout = [
    ['routes', 'trails'],
    ['maps'],
    ['landmarks', 'planning'],
    ['about', 'restricted'],
    ['emergency','code-of-conduct'],
    ['about-app','settings']
  ];

  options.title = T.span({
    ro: 'Delta Dunării',
    en: 'The Danube Delta',
  });

  MenuController.call(this, options);
}
util.inherits(MainMenuController, MenuController);

module.exports = MainMenuController;
