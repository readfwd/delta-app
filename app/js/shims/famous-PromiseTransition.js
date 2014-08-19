var TweenTransition = require('famous/transitions/TweenTransition');

function PromiseTransition() {
    this.state = 0;
}

PromiseTransition.SUPPORTS_MULTIPLE = true;

PromiseTransition.prototype.get = function get() {
  if (this._instance) {
    return this._instance.get();
  }
  return this.state;
};

PromiseTransition.prototype.set = function set(endState, transition, callback) {
  if (!this._instance) {
    var method = transition.promiseMethod;
    if (!method) {
      method = TweenTransition;
    }
    this._instance = new method();
    this._instance.reset(this.state);
  }
  this._instance.set(endState, transition, transition.promise ? function () {
    transition.promise.then(callback);
  } : callback);
  this._endState = endState;
  this._transition = transition;
  this._callback = callback;
  this._running = true;
  this._startTime = Date.now();
};

PromiseTransition.prototype.reset = function reset(startState) {
  this.state = startState;
  if (this._instance) {
    this._instance.reset(startState);
  }
};

module.exports = PromiseTransition;
