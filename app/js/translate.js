var _ = require('lodash');
var $ = require('jquery');

var Translate = {
  initialize: function () {
    var lang = window.localStorage.language;
    if (!lang) {
      var sysLang = navigator.language || navigator.userLanguage;
      sysLang = sysLang.replace(/-.*$/, '');
      switch (sysLang) {
        case 'ro':
          lang = sysLang;
          break;
        default:
          lang = 'en';
      }
    }

    this.setLanguage(lang);
  },

  setLanguage: function (lang) {
    this.lang = lang;
    try {
      window.localStorage.language = lang;
    } catch (ex) {}

    var styleEl = $('#language-style');
    if (!styleEl.length) {
      styleEl = $('<style id="language-style"></style');
      $(document.body).append(styleEl);
    }
    styleEl.html('.lang:not(.lang-' + lang + ') { display: none; }');
  },

  getLanguage: function () {
    return this.lang;
  },

  span: function (spec) {
    var out = [];
    _.each(spec, function (content, lang) {
      out.push('<span class="lang lang-');
      out.push(lang);
      out.push('">');
      out.push(content);
      out.push('</span>');
    });
    return out.join('');
  },
};

Translate.initialize();

module.exports = Translate;
