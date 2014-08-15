var TweenTransition = require('famous/transitions/TweenTransition');
var Transitionable = require('famous/transitions/Transitionable');

function DelayTransition() {
    this.state = 0;
}

DelayTransition.SUPPORTS_MULTIPLE = true;

DelayTransition.prototype.get = function get() {
  if (!this._running || Date.now() < this._startTime + this._transition.delay) {
    return this.state;
  }
  if (!this._instance) {
    var method = this._transition.delayMethod;
    if (!method) {
      method = TweenTransition;
    }
    this._instance = new method();
    this._instance.reset(this.state);
    this._instance.set(this._endState, this._transition, this._callback);
  }
  return this._instance.get();
};

DelayTransition.prototype.set = function set(endState, transition, callback) {
  this._endState = endState;
  this._transition = transition;
  this._callback = callback;
  this._running = true;
  this._startTime = Date.now();
};

DelayTransition.prototype.reset = function reset(startState) {
  this._running = false;
  this.state = startState;
};

module.exports = DelayTransition;
