var TitleBarController = require('./titlebar-controller');
var util = require('util');
var Famous = require('../shims/famous');
var $ = require('jquery');

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
  parentNode.add(scrollView);

  function resizeScrollView() {
    Famous.Engine.once('postrender', function () {
      var el = $('#' + id + ' > .template-container-inner');
      console.log(el);
      surface.setSize([undefined, $('#' + id + ' > .template-container-inner').outerHeight()]);
    });
  }

  window.surface = surface;
  window.id = id;

  surface.on('deploy', function () {
    Famous.Engine.on('resize', resizeScrollView);
    resizeScrollView();
  });
  surface.on('recall', function () {
    Famous.Engine.removeListener('resize', resizeScrollView);
  });

};

module.exports = TemplateController;
