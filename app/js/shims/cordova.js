var cordova = {
  initialize: function () {
    /* istanbul ignore if */
    if (window.cordova) {
      this.present = true;
    } else {
      this.present = false;
    }
  },

  ready: function (cb) {
    /* istanbul ignore if */
    if (this.present) {
      document.addEventListener('deviceready', cb);
    } else {
      window.addEventListener('load', cb);
    }
  }
};

cordova.initialize();

module.exports = cordova;
