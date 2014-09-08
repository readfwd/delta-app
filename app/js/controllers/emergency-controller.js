var util = require('util');
// TODO: put 'var back'
$ = require('jquery');

var T = require('../translate');
var TemplateController = require('./template-controller');
var cordova = require('../shims/cordova');

var lastPosition;
var lastLocationURL;

function EmergencyController(options) {
  options = options || {};
  this.templates = options.templates || [];
  this.titles = options.titles || [];
  this.pageIds = options.pageIds || [];

  TemplateController.call(this, options);

  this.setUpEmergencyLogic();
}

util.inherits(EmergencyController, TemplateController);


EmergencyController.prototype.hasGPS = function() {
  return window || window.navigator || window.navigator.geolocation;
};

EmergencyController.prototype.cannotGPS = function(err) {
  lastLocationURL = undefined;
  lastPosition    = undefined;

  if (err && err.code) {
    $('.emergency-has-gps').hide();
    $('.emergency-no-gps').show();
  }
};

EmergencyController.prototype.updateLocation= function(position){
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  latitude = latitude.toPrecision(6);
  longitude = longitude.toPrecision(6);

  lastPosition = position;

  lastLocationURL = [
  'http://www.openstreetmap.org/?mlat=',
  latitude,
  '&mlon=',
  longitude
  ].join('');

  $('.curent-coordinates').html([
    'Lat:',
    latitude,
    '<br/>',
    'Long:',
    longitude
    ].join(' '));
};

EmergencyController.prototype.buildTextMessage = function () {
  var message;
  var lang = T.getLanguage();
  if(lastLocationURL) {
    switch(lang) {
      case 'ro':
      message = 'Sunt aici: ' + lastLocationURL + ' <numele tau>';
      break;
      default:
      message = 'I am here ' + lastLocationURL + ' <your name>';
    }
  } else {
    switch(lang) {
      case 'ro':
      message = 'Am nevoie de ajutor. Sunati-ma, va rog la acest numar! <numele tau>';
      break;
      default:
      message = 'I need some assistance. Call me on this number! <your name>';
    }
  }
  return message;
};

EmergencyController.prototype.copyTextToClipboard = function (text) {
  if(!lastPosition) {
    switch(T.getLanguage()) {
      case 'ro':
      alert('Poziția ta nu a fost determinată. Încearcă din nou atunci când în aplicație sunt afișate coordonatele tale.');
      break;
      default:
      alert('Your location could not be ');
    }
    return;
  }

  if(cordova && cordova.present) {
    window.cordova.plugins.clipboard.copy(text);
    var old = $('.curent-coordinates').html();

    $('.curent-coordinates').html('OK');
    window.setTimeout(function() {
      $('.curent-coordinates').html(old);
    }, 1500);
  } else {
    switch(T.getLanguage()) {
      case 'ro':
      window.prompt("Copiază în clipboard: Ctrl+C sau Cmd + C, Enter", text);
      break;
      default:
      window.prompt("Copy to clipboard: Ctrl+C or Cmd + C, Enter", text);
    }
  }
};

EmergencyController.prototype.copyCoordinatesToClipboard = function () {
  this.copyTextToClipboard($('.curent-coordinates').eq(0).text());
};

EmergencyController.prototype.copyMapURLToClipboard = function () {
  this.copyTextToClipboard(lastLocationURL);
};

// Unfortunately this is android only
EmergencyController.prototype.sendTextMessage = function(number, message) {
  var intent = "INTENT"; //leave empty for sending sms using default intent
  var success = function () { console.log('Message sent successfully'); };
  var error = function (e) { console.log('Message Failed:' + e); };
  sms.send(number, message, intent, success, error);
};

EmergencyController.prototype.setUpEmergencyLogic = function() {
  var self = this;

  // Wait for content-ready so that conetntSurface is available
  self.on('content-ready', function () {
    // then for contenSurface deploy
    self.contentSurface.on('deploy', function () {
      var hotelPhone  = window.localStorage.getItem('hotelPhone') || '';
      var $hotelPhone = $('input.hotel-phone');
      var $callHotel  = $('.call-hotel');
      var $smsHotel   = $('.sms-hotel');

      $hotelPhone.val(hotelPhone);

      var updateLinks = function() {
        hotelPhone = $hotelPhone.val();
        window.localStorage.setItem('hotelPhone', hotelPhone);

        if(hotelPhone.match(/^[\d \+\(\)]{4,}$/)) {
          $('.emergency-phone-number-ok').show();
          $('.emergency-phone-number-not-ok').hide();

          $callHotel.attr('href', 'tel:' + encodeURIComponent(hotelPhone));
          $smsHotel.attr('href',  'sms:' + encodeURIComponent(hotelPhone));
        } else {
          $('.emergency-phone-number-ok').hide();
          $('.emergency-phone-number-not-ok').show();
        }
      };

      $callHotel.attr('target', cordova.present ? '_system' : '_blank');
      $callHotel.attr('target', cordova.present ? '_system' : '_blank');

      if('undefined' === typeof sms && cordova.ios) {
        var coordonatesWillBeCopiedText = '(coordonates will be copied, paste them in the message)';
        if(T.getLanguage() === 'ro') {
          coordonatesWillBeCopiedText =  '(coordonatele vor fi copiate; apoi poți da "paste"/"lipește" în aplicația SMS)';
        }
        $smsHotel.find('span.emergency-has-gps').text(coordonatesWillBeCopiedText);
      }

      $smsHotel.bind('click',function(){
        if('undefined' !== typeof sms) {
          self.sendTextMessage(hotelPhone, self.buildTextMessage());
        } else {
          if(lastLocationURL) {
            self.copyTextToClipboard(self.buildTextMessage());
          }
          return true;
        }
        return false;
      });

      if(self.hasGPS()) {
        $('.emergency-has-gps').show();
        $('.emergency-no-gps').hide();
        window.navigator.geolocation.getCurrentPosition(self.updateLocation, self.cannotGPS);

        $('button.update-coordinates').click(function() {
          $('.curent-coordinates').text('...');
          window.navigator.geolocation.getCurrentPosition(self.updateLocation, self.cannotGPS);
        });
      } else {
        self.cannotGPS();
      }

      $('.copy-coordinates').click(function () {
        self.copyCoordinatesToClipboard();
      });
      $('.copy-map-link').click(function () {
        self.copyMapURLToClipboard();
      });

      updateLinks();

      $hotelPhone.keyup(updateLinks);
      $hotelPhone.focus(updateLinks);
      $hotelPhone.blur(updateLinks);

    });
});
};

module.exports = EmergencyController;