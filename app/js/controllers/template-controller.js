var TitleBarController = require('./titlebar-controller');
var util = require('util');
var Famous = require('../shims/famous');
var $ = require('jquery');
var templates = require('../lib/templates');
var _ = require('lodash');
var T = require('../translate');
var cordova = require('../shims/cordova');
var analytics = require('../shims/analytics');
var TemplateUtils = require('./template-utils');
var url = require('url');

function TemplateController(options) {
  options = options || {};
  options.template = options.template || (function () {});
  options.templateOptions = options.templateOptions || { T: T };
  TitleBarController.call(this, options);
}
util.inherits(TemplateController, TitleBarController);

TemplateController.prototype.pipeToScrollView = function (renderable) {
  var sv1 = this.options.scrollView;
  var sv2 = this.scrollView;
  if (sv1) {
    renderable.pipe(sv1);
  }
  if (sv2) {
    renderable.pipe(sv2);
  }
};

TemplateController.prototype.buildContentTree = function (parentNode) {
  var self = this;

  var id = 'template-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
  self.elementId = id;
  var content = self.options.template(self.options.templateOptions);
  content = '<div id="' + id +
    '" class="template-container"><div class="template-container-inner">' +
    content + '</div></div>';

  this.contentSurface = new Famous.Surface({
    content: content,
    size: [undefined, 0],
  });

  var surface = this.contentSurface;

  var scrollView = new Famous.ScrollView();
  self.scrollView = scrollView;
  self.pipeToScrollView(surface);

  var containerView = new Famous.ContainerSurface({
    classes: ['template-bg'],
    size: [undefined, undefined],
  });
  self.pipeToScrollView(containerView);

  function resizeNow(element) {
    var size = surface.size;
    var height;
    if (!size || size[1] !== (height = element.outerHeight())) {
      surface.setSize([undefined, height]);
    }
  }

  function resizeScrollView() {
    Famous.Engine.once('postrender', function () {
      resizeNow($('#' + id + ' > .template-container-inner'));
    });
  }

  containerView.on('recall', function () {
    self.recall();
  });

  containerView.on('deploy', function () {
    self.deploy();
  });

  self.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
    Famous.Engine.once('postrender', function () {
      var element = $('#' + id + ' > .template-container-inner');
      resizeNow(element);
      // Famous reuses the same DOM objects on subsequent deploys
      // so we shouldn't bind event handlers on the content HTML twice
      if (!element.data('deployed')) {
        element.data('deployed', true);
        element[0].addEventListener('DOMSubtreeModified', resizeNow.bind(null, element));
        element.find('img').on('load', function() {
          Famous.Timer.setTimeout(resizeScrollView, 100);
        });
        self.setUpPage(element);
      }
    });
    resizeScrollView();
  });

  self.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
  });

  scrollView.sequenceFrom([surface]);
  containerView.add(scrollView);
  parentNode.add(containerView);

  // Emit an event to signal that the buildContentTree phase finished
  // this.contentSurface is now available, but not yet deployed
  this.emit('content-ready', this);
};

TemplateController.prototype.scrollTo = function (query) {
  if (!this._deployed) {
    this.queuedScrollTo = query;
    return;
  }
  var container = $('#' + this.elementId);
  var el = container.find('> .template-container-inner ' + query);
  if (!el.length) { return; }
  var pos = el.offset().top - container.offset().top;
  this.scrollView.setPosition(pos);
  this.scrollView.setEdgeSpring(pos);
};

TemplateController.prototype.setUpTemplateLinks = function (page) {
  var self = this;

  var links = page.find('a.template-link');
  links.on('click', function (evt) {
    evt.preventDefault();
  });

  Famous.FastClick(links, function(evt) {
    var href = $(evt.currentTarget).attr('href');
    var t = templates;
    _.each(href.split('/'), function (el) {
      t = t[el];
    });

    var viewController = new TemplateController({
      titleBar: self.titleBar,
      title: $(evt.currentTarget).data('title'),
      template: t,
    });

    analytics.trackEvent('Link', 'Click', $(evt.currentTarget).data('title'));

    self.setNavigationItem(viewController);
  });

};

TemplateController.prototype.setUpLinks = function (page) {
  var links = page.find('a:not(.link)');
  links.on('click', function (evt) {
    evt.preventDefault();
  });

  Famous.FastClick(links, function(evt) {
    var href = $(evt.currentTarget).attr('href');
    if (/^tel:/.test(href)) {
      if (cordova.present) {
        buttons = {
          en: ['Cancel', 'Call'],
          ro: ['Anulați', 'Apelați'],
        };
        title = {
          en: 'Phone number',
          ro: 'Număr de telefon',
        };
        var lang = T.getLanguage();
        navigator.notification.confirm(decodeURIComponent(href.replace(/^tel:/, '')), function (index) {
          if (index === 2) {
            analytics.trackEvent('Link', 'Telephone', href);
            window.open(href, '_system');
          }
        }, title[lang], buttons[lang]);
      } else {
        window.open(href, '_self');
      }
      return;
    }
    if (/^mailto:/.test(href)) {

      if (window.plugin && window.plugin.email) {
        analytics.trackEvent('Link', 'Email', href);
        var parsedUrl = url.parse(href, true);
        window.plugin.email.open({
          to: [ parsedUrl.auth + '@' + parsedUrl.host ],
          subject: parsedUrl.query.subject,
          body: parsedUrl.query.body,
        });
      } else {
        window.open(href, '_self');
      }
      return;
    }

    window.open(href, cordova.present ? '_system' : '_blank');
  });

};

TemplateController.prototype.setUpSettings = function (page) {
  var self = this;

  var settingsDesc = self.options.settings;
  if (settingsDesc) {
    var settings = page.find('input[data-setting]');
    settings.each(function (idx, el) {
      var $el = $(el);
      var desc = settingsDesc[$el.data('setting')];
      if (desc) {
        $el.prop('checked', desc.get());
      }
    });

    settings.on('change', function () {
      var $el = $(this);
      var desc = settingsDesc[$el.data('setting')];
      if (desc) {
        desc.set($el.prop('checked'));
      }
    });
  }
};

TemplateController.prototype.setUpPage = function (page) {
  this.setUpLinks(page);
  this.setUpTemplateLinks(page);
  this.setUpSettings(page);
  TemplateUtils.setUpMapLinks.call(this, page);
  if (this.queuedScrollTo) {
    this.scrollTo(this.queuedScrollTo);
    this.queuedScrollTo = null;
  }
};

module.exports = TemplateController;
