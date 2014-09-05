var cordova = require('./cordova');

var analytics = {};

var onError = function(error) {
  console.error('[analytics]', error);
};

var onSuccess = function() {
  // do nothing; we are fine
};

analytics.init = function (id) {
  console.log('[analytics] init:', id);
};

analytics.trackPage = function(page) {
  console.log('[analytics] Track page:', page);
};

analytics.trackEvent = function(category, action, label, value) {
  console.log('[analytics] Track page (category, action, label, value):',
    category, action, label, value);
};

cordova.ready(function(){
  var gaPlugin = window.plugins.gaPlugin;
  if (gaPlugin) {
    analytics.init = function (id) {
      gaPlugin.init(onSuccess, onError, id, 10); // each 10 seconds, send the batch
    };
    analytics.trackPage = function (page) {
      gaPlugin.trackPage(onSuccess, onError, page);
    };
    analytics.trackEvent = function(category, action, label, value) {
      action = action || 'default';
      label = label || 'default';
      value = (value !== undefined) ? value : 1;
      gaPlugin.trackEvent(onSuccess, onError, category, action, label, value);
    };

  }
});

module.exports = analytics;