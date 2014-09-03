var util = require('util');
var $ = require('jquery');
var Famous = require('../shims/famous');

var T = require('../translate');
var TemplateController = require('./template-controller');

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

EmergencyController.prototype.updateLocation= function(position){
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  this.locationURL = [
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
  if(this.locationURL) {
    switch(lang) {
      case 'ro':
        message = 'Sunt aici: ' + this.locationURL + ' <numele tau>';
        break;
      default:
        message = 'I am here ' + this.locationURL + ' <your name>';
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

EmergencyController.prototype.cannotGPS = function(err) {
  this.locationURL = undefined;
  if (err.code) {
    $('.emergency-has-gps').hide();
    $('.emergency-no-gps').show();
  }
};


EmergencyController.prototype.sendSMS = function(number, message) {
  console.log('sms', window.sms, sms, JSON.stringify(sms));
  var intent = "INTENT"; //leave empty for sending sms using default intent
  var success = function () { console.log('Message sent successfully'); };
  var error = function (e) { alert('Message Failed:' + e); };
  sms.send(number, message, intent, success, error);
};

EmergencyController.prototype.setUpEmergencyLogic = function() {
  var self = this;

  // Wait for content-ready so that conetntSurface is available
  self.on('content-ready', function () {
    // then for contenSurface deploy
    self.contentSurface.on('deploy', function () {
      var hotelPhone = window.localStorage.getItem('hotelPhone') || '';
      var $hotelPhone = $('input.hotel-phone');
      var $callHotel = $('a.call-hotel');
      var $smsHotel   = $('.sms-hotel');

      $hotelPhone.val(hotelPhone);

      var updateLinks = function() {
        hotelPhone = $hotelPhone.val();
        window.localStorage.setItem('hotelPhone', hotelPhone);

        if(hotelPhone.match(/^[\d \+\(\)]{4,}$/)) {
          $('.emergency-phone-number-ok').show();
          $('.emergency-phone-number-not-ok').hide();

          $callHotel.attr('href', 'tel:' + encodeURIComponent(hotelPhone));
          $smsHotel.bind('click',function(e){
            self.sendSMS(hotelPhone, this.buildTextMessage());
            return false;
          });
        } else {
          $('.emergency-phone-number-ok').hide();
          $('.emergency-phone-number-not-ok').show();
        }
      };

      if(self.hasGPS()) {
        $('.emergency-has-gps').show();
        $('.emergency-no-gps').hide();
        window.navigator.geolocation.getCurrentPosition(self.updateLocation, self.cannotGPS);

        $('button.update-coordinates').click(function() {
          $('.curent-coordinates').text('...');
          window.navigator.geolocation.getCurrentPosition(self.updateLocation, self.cannotGPS);
        });
      } else {
        $('.emergency-has-gps').hide();
        $('.emergency-no-gps').show();
      }

      // window.plugins.copy(text);

      updateLinks();
      $hotelPhone.keyup(updateLinks);
      $hotelPhone.focus(updateLinks);
      $hotelPhone.blur(updateLinks);

    });
});
};

module.exports = EmergencyController;