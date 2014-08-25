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

/** @const */
var TOLERANCE = 0.5;

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


function _normalizeState() {
    var position = this.getPosition();
    var nodeSize = _nodeSizeForDirection.call(this, this._node);
    var nextNode = this._node.getNext();

    while (position > nodeSize + TOLERANCE && nextNode) {
        _shiftOrigin.call(this, -nodeSize);
        position -= nodeSize;
        this._scroller.sequenceFrom(nextNode);
        this._node = nextNode;
        nextNode = this._node.getNext();
        nodeSize = _nodeSizeForDirection.call(this, this._node);
    }

    var previousNode = this._node.getPrevious();
    var previousNodeSize;

    while (position < -TOLERANCE && previousNode) {
        previousNodeSize = _nodeSizeForDirection.call(this, previousNode);
        this._scroller.sequenceFrom(previousNode);
        this._node = previousNode;
        _shiftOrigin.call(this, previousNodeSize);
        position += previousNodeSize;
        previousNode = this._node.getPrevious();
    }
}

function _handleEdge(edgeDetected) {
    if (!this._onEdge && edgeDetected) {
        this.sync.setOptions({scale: this.options.edgeGrip});
        if (!this._touchCount && this._springState !== SpringStates.EDGE) {
            _setSpring.call(this, this._edgeSpringPosition, SpringStates.EDGE);
        }
    }
    else if (this._onEdge && !edgeDetected) {
        this.sync.setOptions({scale: 1});
        if (this._springState && Math.abs(this.getVelocity()) < 0.001) {
            // reset agents, detaching the spring
            _detachAgents.call(this);
            _attachAgents.call(this);
        }
    }
    this._onEdge = edgeDetected;
}

Scrollview.prototype.render = function render() {
    if (!this._node) return null;

    _normalizeState.call(this);
    _handleEdge.call(this, this._scroller.onEdge());
    if (this.options.paginated) _handlePagination.call(this);

    return this._scroller.render();
};

// Edited methods

function _handlePagination() {
    if (!this._needsPaginationCheck) return;

    if (this._touchCount) return;
    if (this._springState === SpringStates.EDGE) return;

    var velocity = this.getVelocity();
    if (Math.abs(velocity) >= this.options.pageStopSpeed) return;

    var position = this.getPosition();
    var velocitySwitch = Math.abs(velocity) > this.options.pageSwitchSpeed;

    // parameters to determine when to switch
    var nodeSize = _nodeSizeForDirection.call(this, this._node);
    var positionNext = position - this._pageSpringPosition > 0.5 * nodeSize;
    var positionPrev = position - this._pageSpringPosition < -0.5 * nodeSize;
    var velocityNext = velocity > 0;

    if ((positionNext && !velocitySwitch) || (velocitySwitch && velocityNext)) this.goToNextPage();
    else if ((positionPrev && !velocitySwitch) || (velocitySwitch && !velocityNext)) this.goToPreviousPage();
    else _setSpring.call(this, this._pageSpringPosition, SpringStates.PAGE);

    this._needsPaginationCheck = false;
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

Scrollview.prototype.setPageSpring = function (position) {
  _setSpring.call(this, position, SpringStates.PAGE);
};

module.exports = Scrollview;
