var toggle = {
  get: function () {
    return toggle.state;
  },

  set: function (value) {
    toggle.state = value;
    window.localStorage.animationsActive = value;
  },

  initialize: function () {
    toggle.state = window.localStorage.animationsActive;
    if (toggle.state === undefined) {
      toggle.state = true;
    } else {
      toggle.state = toggle.state === 'true';
    }
  },
};

toggle.initialize();
module.exports = toggle;
