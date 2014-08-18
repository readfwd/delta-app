var cordova = {
  initialize: function () {
    /* istanbul ignore if */
    if (window.cordova) {
      this.present = true;
    } else {
      this.present = false;
    }

    if (this.present) {
      document.addEventListener('deviceready', this.onReady.bind(this));
    } else {
      window.addEventListener('load', this.onReady.bind(this));
    }

    this.isReady = false;
    this.readyCallbacks = [];
  },

  _onReady: function () {
    this.iOS = /iP(hone|ad|od)/.test(window.navigator.userAgent);
    this.iOS7App = (cordova.present &&
                    window.device.platform === 'iOS' &&
                    parseInt(window.device.version) >= 7);
    this.clickEvent = this.iOS ? 'touchend' : 'click';
  },

  onReady: function () {
    this.isReady = true;
    this._onReady();
    for (var i = 0, v = this.readyCallbacks, n = v.length; i < n; i++) {
      v[i]();
    }
    v.length = [];
  },

  ready: function (cb) {
    if (this.isReady) {
      cb();
    } else {
      this.readyCallbacks.push(cb);
    }
  }
};

cordova.initialize();

module.exports = cordova;
