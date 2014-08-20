var toggle = {
  get: function () {
    return toggle.state;
  },

  set: function (value) {
    toggle.state = value;
    try {
      window.localStorage.animationsActive = value;
    } catch (ex) {}
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
