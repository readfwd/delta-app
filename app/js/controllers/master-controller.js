var TemplateController = require('./template-controller');
var DetailController = require('./detail-controller');
var util = require('util');
var Famous = require('../shims/famous');
var _ = require('lodash');
var $ = require('jquery');
var Templates = require('../lib/templates');

function MasterController(options) {
  TemplateController.call(this, options);
}
util.inherits(MasterController, TemplateController);

MasterController.prototype.prepareDetailController = function () {
  var self = this;

  if (!self.detailController) {
    self.detailController = new DetailController({
      templates: self.templates,
      titles: self.titles,
      pageIds: self.pageIds,
      titleBar: self.titleBar,
      rightBarButton: self.options.rightBarButton,
    });
    self.detailController.on('back', function () {
      self.emit('ascend');
    });

    self.detailController.on('pageFlip', function (page) {
      self.emit('pageFlip', page);
    });
  }
};

MasterController.prototype.navigateToIndex = function (index) {
  var self = this;

  self.prepareDetailController();

  if (self.viewController) {
    self.detailController.navigateToIndex(index, true);
  } else {
    self.detailController.navigateToIndex(index, false);
    self.setNavigationItem(self.detailController);
    self.emit('descend', { index: index });
  }
};

MasterController.prototype.setUpPage = function (page) {
  var self = this;

  var links = page.find('a.template-link');
  links.on('click', function (evt) {
    evt.preventDefault();
  });

  var templates = [];
  var titles = [];
  var pageIds = [];

  links.each(function (idx, el) {
    var $el = $(el);

    var href = $el.attr('href');
    var template = Templates;
    _.each(href.split('/'), function (el) {
      template = template[el];
    });
    templates.push(template);

    titles.push($el.data('title'));

    var pageid = $el.find('.submenu-pageid');
    pageid = pageid ? pageid.data('id') : idx;
    pageIds.push(pageid);

    $el.on('click', function (evt) {
      evt.preventDefault();
    });

    Famous.FastClick($el, function() {
      self.navigateToIndex(idx);
    });
  });

  if (!self.templates) {
    self.templates = templates;
    self.titles = titles;
    self.pageIds = pageIds;
  }
};

module.exports = MasterController;
