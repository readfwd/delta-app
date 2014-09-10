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
        if (event.touches.length !== 1) {
          targeted = false;
          return;
        }
        var dist;
        if (event.pageX) { //Safari
          dist = Math.abs(event.pageX - currentEvent.pageX) +
                 Math.abs(event.pageY - currentEvent.pageY);
        } else { //Chrome
          dist = Math.abs(event.touches[0].clientX - currentEvent.touches[0].clientX) +
                 Math.abs(event.touches[0].clientY - currentEvent.touches[0].clientY);
        }
        if (dist > 25) {
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
