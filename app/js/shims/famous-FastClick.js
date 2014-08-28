var cordova = require('./cordova');

function FastClick(element, callback) {
  if (cordova.iOS) {
    var targeted = true;
    var currentEvent;

    element.on('touchstart', function (event) {
      if (!(event instanceof window.TouchEvent) && 
        (event.originalEvent instanceof window.TouchEvent)) {
          event = event.originalEvent;
      }
      if (event.touches.length === 1) {
        targeted = true;
        currentEvent = event;
      }
    });
    element.on('touchmove', function (event) {
      if (targeted) {
        if (!(event instanceof window.TouchEvent) && 
          (event.originalEvent instanceof window.TouchEvent)) {
            event = event.originalEvent;
        }
        var dist = Math.abs(event.pageX - currentEvent.pageX) +
          Math.abs(event.pageY - currentEvent.pageY);
        if (dist > 10) {
          targeted = false;
        }
      }
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
