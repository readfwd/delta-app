var TitleBarController = require('./titlebar-controller');
var util = require('util');
var Famous = require('../shims/famous');
var $ = require('jquery');
var templates = require('../lib/templates');
var _ = require('lodash');
var cordova = require('../shims/cordova');
var T = require('../translate');

function TemplateController(options) {
  options = options || {};
  options.template = options.template || (function () {});
  options.templateOptions = options.templateOptions || { T: T };
  TitleBarController.call(this, options);
}
util.inherits(TemplateController, TitleBarController);

TemplateController.prototype.buildContentTree = function (parentNode) {
  var self = this;

  var id = 'template-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
  var content = self.options.template(self.options.templateOptions);
  content = '<div id="' + id + '" class="template-container"><div class="template-container-inner">' + content + '</div></div>';

  var surface = new Famous.Surface({
    content: content,
    size: [undefined, 0],
  });

  var scrollView = new Famous.ScrollView();
  surface.pipe(scrollView);

  var containerView = new Famous.ContainerSurface({
    classes: ['template-bg'],
    size: [undefined, undefined],
  });

  parentNode.add(containerView);
  containerView.add(scrollView);

  function resizeScrollView() {
    Famous.Engine.once('postrender', function () {
      surface.setSize([undefined, $('#' + id + ' > .template-container-inner').outerHeight()]);
    });
  }

  surface.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
    Famous.Engine.once('postrender', function () {
      self.setUpPage($('#' + id + ' > .template-container-inner'));
    });
    resizeScrollView();
  });
  surface.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
  });

  scrollView.sequenceFrom([surface]);
};

TemplateController.prototype.setUpPage = function (page) {
  var self = this;

  var links = page.find('a');
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
    self.setNavigationItem(viewController);
  });

  var settingsDesc = this.options.settings;
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

module.exports = TemplateController;
