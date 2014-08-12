function ViewController() {
}

ViewController.prototype.getView = function() {
  if (!this.view) {
    this.loadView();
  }
  return this.view;
};

module.exports = ViewController;
