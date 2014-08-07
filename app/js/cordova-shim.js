var cordova = {
  initialize: function () {
    /* istanbul ignore if */
    if (window.cordova) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  },

  ready: function (cb) {
    /* istanbul ignore if */
    if (this.isMobile) {
      document.addEventListener('deviceready', cb);
    } else {
      window.addEventListener('load', cb);
    }
  }
};

cordova.initialize();

module.exports = cordova;

