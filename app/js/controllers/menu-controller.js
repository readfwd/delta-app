var util = require('util');
var ViewController = require('./view-controller');
var MapSurface = require('../views/map-surface');
var Famous = require('../shims/famous');

function MenuController() {
}
util.inherits(MenuController, ViewController);

MenuController.prototype.buildSectionButton = function(section) {
  var renderNode = new Famous.RenderNode();
  var surface = new Famous.Surface({
    classes: ['menu-button'],
  });
  var buttonText = new Famous.Surface({
    classes: ['menu-button-text'],
    content: section + 1,
    size: [true, true],
  });
  var textModifier = new Famous.StateModifier({
    transform: Famous.Transform.inFront,
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  });
  renderNode.add(surface);
  renderNode.add(textModifier).add(buttonText);
  return renderNode;
};

MenuController.prototype.buildRenderTree = function (parentNode) {
  var verticalLayout = new Famous.FlexibleLayout({
    ratios: [true, 1, true, 1, true, 1, true, 1, true],
    direction: 1,
  });

  var borderWidth = 15;

  function verticalSpacer(ratio) {
    if (!ratio) {
      ratio = 1;
    }
    return new Famous.Surface({ 
      size: [undefined, borderWidth]
    });
  }

  function horizontalSpacer(ratio) {
    if (!ratio) {
      ratio = 1;
    }
    return new Famous.Surface({ 
      size: [borderWidth, undefined]
    });
  }

  var verticalViews = [];
  var horizontalLayout, horizontalViews;
  verticalLayout.sequenceFrom(verticalViews);
  for (var i = 0; i < 4; i++) {
    verticalViews.push(verticalSpacer(i ? 1 : 0.5));

    horizontalViews = [];
    horizontalLayout = new Famous.FlexibleLayout({
      ratios: (i === 3) ? [true, 1, true] : [true, 1, true, 1, true]
    });

    verticalViews.push(horizontalLayout);
    horizontalLayout.sequenceFrom(horizontalViews);

    horizontalViews.push(horizontalSpacer(0.5));

    if (i === 3) {
      horizontalViews.push(this.buildSectionButton(i * 2));
    } else {
      horizontalViews.push(this.buildSectionButton(i * 2));
      horizontalViews.push(horizontalSpacer(1));
      horizontalViews.push(this.buildSectionButton(i * 2 + 1));
    }

    horizontalViews.push(horizontalSpacer(0.5));
  }
  verticalViews.push(verticalSpacer(0.5));
  parentNode.add(verticalLayout);
};

module.exports = MenuController;
