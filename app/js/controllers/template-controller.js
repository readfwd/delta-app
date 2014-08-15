var TitleBarController = require('./titlebar-controller');
var util = require('util');
var Famous = require('../shims/famous');
var $ = require('jquery');
var templates = require('../lib/templates');
var _ = require('lodash');

function TemplateController(options) {
  options = options || {};
  options.template = options.template || (function () {});
  options.templateOptions = options.templateOptions || {};
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
  scrollView.sequenceFrom([surface]);
  surface.pipe(scrollView);

  parentNode.add(new Famous.Surface({
    classes: ['template-bg'],
    size: [undefined, undefined],
  }));

  parentNode.add(new Famous.StateModifier({
    transform: Famous.Transform.inFront,
  })).add(scrollView);


  function resizeScrollView() {
    Famous.Engine.once('postrender', function () {
      surface.setSize([undefined, $('#' + id + ' > .template-container-inner').outerHeight()]);
    });
  }

  window.surface = surface;
  window.id = id;

  surface.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
    Famous.Engine.once('postrender', function () {
      $('#' + id + ' a').click(function(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var href = $(evt.target).attr('href');
        var t = templates;
        _.each(href.split('/'), function (el) {
          t = t[el];
        });

        var viewController = new TemplateController({
          titleBar: self.titleBar,
          title: $(evt.target).data('title'),
          template: t,
        });
        self.setNavigationItem(viewController);
      });
    });
    resizeScrollView();
  });
  surface.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
  });

};

module.exports = TemplateController;
