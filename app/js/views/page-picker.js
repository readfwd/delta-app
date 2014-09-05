var util = require('util');
var _ = require('lodash');
var Famous = require('../shims/famous');
var $= require('jquery');

function PagePicker(options) {
  var self = this;
  Famous.View.call(this, options);

  options = options || {};
  options.count = options.count || 0;
  self.options = options;

  var n = options.count;

  var id = 'page-picker-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);

  var container = new Famous.ContainerSurface({
    classes: ['page-picker-container', id],
    size: [20 * n, 20],
  });

  var layout = new Famous.SequentialLayout({
    direction: 0
  });

  var surfaces = [];
  for (var i = 0; i < n; i++) {
    surfaces.push(new Famous.Surface({
      classes: ['page-picker-nub'],
      size: [20, 20],
    }));
  }

  var supportsTouch = !!('ontouchstart' in window || navigator.msMaxTouchPoints);
  var syncOpts = {};
  syncOpts[supportsTouch ? 'touch' : 'mouse'] = {};

  var sync = new Famous.GenericSync(syncOpts);

  container.pipe(sync);

  var lastPage = -1;

  function onTouch(data) {
    var pos = $('.page-picker-container.' + id).offset().left;
    var page = Math.round((data.clientX - pos) / 20 - 0.5);
    if (page < 0) {
      page = 0;
    }
    if (page >= options.count) {
      page = options.count - 1;
    }
    if (page !== lastPage) {
      lastPage = page;
      self._eventOutput.emit('navigate', { index: page });
    }
  }

  function onEnd() {
    lastPage = -1;
  }

  sync.on('start', onTouch);
  sync.on('update', onTouch);
  sync.on('end', onEnd);

  layout.sequenceFrom(surfaces);

  self.surfaces = surfaces;
  self.add(container);
  container.add(layout);
}
util.inherits(PagePicker, Famous.View);

PagePicker.prototype.setPage = function (index) {
  var n = this.options.count;
  this.page = index;
  for (var i = 0; i < n; i++) {
    var surface = this.surfaces[i];
    var classes = ['page-picker-nub'];
    if (i === index) {
      classes.push('active');
    }
    surface.setClasses(classes);
  }
};

module.exports = PagePicker;
