var cordova = require('./cordova');

var analytics = {};

var onError = function(error) {
  console.error('[analytics]', error);
};

var onSuccess = function() {
  // do nothing; we are fine
};

analytics.init = function (mobileId, webId) {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', webId, 'auto');
  ga('send', 'pageview');
  this.ga = window.ga;
};

analytics.trackPage = function(page) {
  page = page.replace(/(<([^>]+)>)/ig,'');
  this.ga('send', 'pageview', {
    'page': encodeURIComponent(page),
    'title': page
  });

  this.trackEvent('PageView', page);
};

analytics.trackEvent = function(category, action, label, value) {
  action = action || 'default';
  label = label || 'default';
  value = (value !== undefined) ? value : 1;

  this.ga('send', 'event', category, action, label, value);
};

cordova.ready(function(){
  var gaPlugin = window.plugins && window.plugins.gaPlugin;
  if (gaPlugin) {
    analytics.init = function (mobileId /*, webId*/) {
      gaPlugin.init(onSuccess, onError, mobileId, 10); // each 10 seconds, send the batch
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