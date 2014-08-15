var Transform = require('famous/core/Transform');
 
function ShowModifier(options) {
  this.visible = !!options.visible;
  this._output = {
    transform: Transform.identity,
    opacity: 1,
    origin: null,
    align: null,
    size: null,
    target: null
  };
}
 
ShowModifier.prototype.modify = function(target){
  this._output.target = this.visible? target: null;
  return this._output;
};
 
ShowModifier.prototype.show = function show(){
  this.visible = true;
};
 
ShowModifier.prototype.hide = function hide() {
  this.visible = false;
};
 
module.exports = ShowModifier;
