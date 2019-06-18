var TestVM = function() {
  var self = this;
  self.selected = ko.observable();
  self.data = ko.observableArray();
};

TestVM.prototype.select = function(item) {
  this.selected(item.id);
};

TestVM.prototype.run = function() {
  var data = _buildData(),
    date = new Date();

  this.selected(null);
  this.data(data);
  document.getElementById('run-knockout').innerHTML = new Date() - date + ' ms';
};

function _knockout() {
  var testVM = new TestVM();

  ko.applyBindings(
    //   {
    //     selected: ko.observable(),
    //     data: ko.observableArray(),

    //     select: function(item) {
    //       this.selected(item.id);
    //     },

    //     run: function() {
    //       var data = _buildData(),
    //         date = new Date();

    //       this.selected(null);
    //       this.data(data);
    //       document.getElementById('run-knockout').innerHTML =
    //         new Date() - date + ' ms';
    //     }
    //   },

    testVM,
    document.getElementById('knockout')
  );
}

ko.observableArray.fn.reset = function(values) {
  var array = this();
  this.valueWillMutate();
  ko.utils.arrayPushAll(array, values);
  this.valueHasMutated();
};
