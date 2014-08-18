var cordova = require('./cordova');

function FastClick(element, callback) {
  if (cordova.iOS) {
    var targeted = true;

    element.on('touchstart', function (event) {
      targeted = event.touches.length === 1;
    });
    element.on('touchmove', function () {
      targeted = false;
    });
    element.on('touchend', function (event) {
      if (targeted) {
        if (callback) {
          callback(event);
        } else {
          element.emit('fastclick', event);
        }
      }
      targeted = false;
    });
    element.on('touchcancel', function () {
      targeted = false;
    });
  } else {
    element.on('click', callback);
  }
}

module.exports = FastClick;
