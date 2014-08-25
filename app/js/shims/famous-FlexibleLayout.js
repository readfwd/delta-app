var FlexibleLayout = require('famous/views/FlexibleLayout');

var oldCommit = FlexibleLayout.prototype.commit;
FlexibleLayout.prototype.commit = function (context) {
  var r = oldCommit.call(this, context);
  r.opacity = context.opacity;
  return r;
};

module.exports = FlexibleLayout;
