var Scrollview = require('famous/views/Scrollview');

var PhysicsEngine = require('famous/physics/PhysicsEngine');
var Particle = require('famous/physics/bodies/Particle');
var Drag = require('famous/physics/forces/Drag');
var Spring = require('famous/physics/forces/Spring');
var EventHandler = require('famous/core/EventHandler');
var OptionsManager = require('famous/core/OptionsManager');
var ViewSequence = require('famous/core/ViewSequence');
var Scroller = require('famous/views/Scroller');
var Utility = require('famous/utilities/Utility');
var GenericSync = require('famous/inputs/GenericSync');
var ScrollSync = require('famous/inputs/ScrollSync');
var TouchSync = require('famous/inputs/TouchSync');

/** @enum */
var SpringStates = {
    NONE: 0,
    EDGE: 1,
    PAGE: 2
};

// Copied over private methods

function _attachAgents() {
    if (this._springState) this._physicsEngine.attach([this.spring], this._particle);
    else this._physicsEngine.attach([this.drag, this.friction], this._particle);
}

function _detachAgents() {
    this._springState = SpringStates.NONE;
    this._physicsEngine.detachAll();
}

function _setSpring(position, springState) {
    var springOptions;
    if (springState === SpringStates.EDGE) {
        this._edgeSpringPosition = position;
        springOptions = {
            anchor: [this._edgeSpringPosition, 0, 0],
            period: this.options.edgePeriod,
            dampingRatio: this.options.edgeDamp
        };
    }
    else if (springState === SpringStates.PAGE) {
        this._pageSpringPosition = position;
        springOptions = {
            anchor: [this._pageSpringPosition, 0, 0],
            period: this.options.pagePeriod,
            dampingRatio: this.options.pageDamp
        };
    }

    this.spring.setOptions(springOptions);
    if (springState && !this._springState) {
        _detachAgents.call(this);
        this._springState = springState;
        _attachAgents.call(this);
    }
    this._springState = springState;
}

function _shiftOrigin(amount) {
    this._edgeSpringPosition += amount;
    this._pageSpringPosition += amount;
    this.setPosition(this.getPosition() + amount);
    if (this._springState === SpringStates.EDGE) {
        this.spring.setOptions({anchor: [this._edgeSpringPosition, 0, 0]});
    }
    else if (this._springState === SpringStates.PAGE) {
        this.spring.setOptions({anchor: [this._pageSpringPosition, 0, 0]});
    }
}

function _nodeSizeForDirection(node) {
    var direction = this.options.direction;
    var nodeSize = (node.getSize() || this._scroller.getSize())[direction];
    if (!nodeSize) nodeSize = this._scroller.getSize()[direction];
    return nodeSize;
}

// End of private methods

Scrollview.prototype.goToPageIndex = function (index, animated) {
  if (animated === undefined) {
    animated = true;
  }

  var node = this._node;
  if (!node) { return null; }
  var currentIndex = node.index;
  var inc = index > currentIndex ? 1 : -1;

  var position = 0;
  for (; currentIndex !== index; currentIndex += inc) {
    var nextNode = inc === 1 ? node.getNext() : node.getPrevious();
    if (!nextNode) {
      break;
    }
    position += inc * _nodeSizeForDirection.call(this, inc === 1 ? node : nextNode);
    node = nextNode;
  }

  _setSpring.call(this, position, SpringStates.PAGE);
  if (!animated) {
    this.setPosition(position);
  }

  return node;
};

module.exports = Scrollview;
