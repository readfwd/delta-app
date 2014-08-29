var util = require('util');
var $ = require('jquery');
var cordova = require('../shims/cordova');

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


EmergencyController.prototype.setUpEmergencyLogic = function() {
  var self = this;

  // Wait for content-ready so that conetntSurface is available
  self.on('content-ready', function () {
    // then for contenSurface deploy
    self.contentSurface.on('deploy', function () {
      var hotelPhone = window.localStorage.getItem('hotelPhone') || '';
      var $hotelPhone = $('input.hotel-phone');
      var $callHotel = $('a.call-hotel');
      var $smsHotel   = $('a.sms-hotel');

      $hotelPhone.val(hotelPhone);

      var updateLinks = function() {
        hotelPhone = $hotelPhone.val();
        window.localStorage.setItem('hotelPhone', hotelPhone);

        if(hotelPhone.match(/^[\d \+\(\)]{4,}$/)) {
          $callHotel.unbind('click');
          $smsHotel.unbind('click');

          $callHotel.removeClass('disabled');
          $smsHotel.removeClass('disabled');

          $callHotel.attr('href', 'tel:' + encodeURIComponent(hotelPhone));
          $smsHotel.attr('href', 'sms:' + encodeURIComponent(hotelPhone) + ';body=M-am rătăcit!');
        } else {
          // Disable
          $callHotel.bind('click', function (e) { e.preventDefault(); return false; });
          $smsHotel.bind('click', function (e) { e.preventDefault(); return false;});

          $callHotel.attr('href', null);
          $smsHotel.attr('href', null);

          $callHotel.addClass('disabled');
          $smsHotel.addClass('disabled');
        }
      };

      updateLinks();

      $hotelPhone.keyup(updateLinks);
      $hotelPhone.focus(updateLinks);
      $hotelPhone.blur(updateLinks);

    });
  });
};

module.exports = EmergencyController;