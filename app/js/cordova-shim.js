var cordova = {
  initialize: function() {
    this.isMobile = window.cordova ? true : false;
  },

  ready: function(cb) {
    if (this.isMobile) {
      document.addEventListener("deviceready", cb);
    } else {
      window.addEventListener("load", cb);
    }
  }
};

cordova.initialize();

module.exports = cordova;
