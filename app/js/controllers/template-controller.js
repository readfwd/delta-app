var TitleBarController = require('./titlebar-controller');
var util = require('util');
var Famous = require('../shims/famous');
var $ = require('jquery');
var templates = require('../lib/templates');
var _ = require('lodash');
var T = require('../translate');

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
  var content = self.options.template(self.options.templateOptions);
  content = '<div id="' + id + 
    '" class="template-container"><div class="template-container-inner">' + 
    content + '</div></div>';

  var surface = new Famous.Surface({
    content: content,
    size: [undefined, 0],
  });

  var scrollView = new Famous.ScrollView();
  self.scrollView = scrollView;
  self.pipeToScrollView(surface);

  var containerView = new Famous.ContainerSurface({
    classes: ['template-bg'],
    size: [undefined, undefined],
  });
  self.pipeToScrollView(containerView);

  function resizeScrollView() {
    Famous.Engine.once('postrender', function () {
      surface.setSize([undefined, $('#' + id + ' > .template-container-inner').outerHeight()]);
    });
  }

  containerView.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
    Famous.Engine.once('postrender', function () {
      var element = $('#' + id + ' > .template-container-inner');
      // Famous reuses the same DOM objects on subsequent deploys
      // so we shouldn't bind event handlers on the content HTML twice
      if (!element.data('deployed')) {
        element.data('deployed', true);
        self.setUpPage(element);
      }
    });
    resizeScrollView();
  });

  containerView.on('recall', function () {
    self.emit('recall');
  });

  self.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
  });

  scrollView.sequenceFrom([surface]);
  containerView.add(scrollView);
  parentNode.add(containerView);
};

TemplateController.prototype.setUpLinks = function (page) {
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
  this.setUpSettings(page);
};

module.exports = TemplateController;
