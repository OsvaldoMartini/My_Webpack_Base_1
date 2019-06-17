function _knockout() {
  ko.applyBindings(
    {
      selected: ko.observable(),
      data: ko.observableArray(),

      select: function(item) {
        this.selected(item.id);
      },

      run: function() {
        var data = _buildData(),
          date = new Date();

        this.selected(null);
        this.data(data);
        document.getElementById('run-knockout').innerHTML =
          new Date() - date + ' ms';
      }
    },
    document.getElementById('knockout')
  );
}

ko.observableArray.fn.reset = function(values) {
  var array = this();
  this.valueWillMutate();
  ko.utils.arrayPushAll(array, values);
  this.valueHasMutated();
};
