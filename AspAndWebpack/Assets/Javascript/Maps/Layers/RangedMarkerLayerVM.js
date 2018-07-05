/**
 * A layer representing markers which can contain range rings.
 * @param {object} options - A collection of properties that are to be used to set-up the layer.
 */
var RangedMarkerLayerVM = function (options) {
    var self = this;

    //Call the super/base constructor.
    MarkerLayerVM.apply(self, [options, { toggleChildren: !!options.id }]);

    self.toggleRange = function (id) {
        if (self.rangesSwitched.indexOf(id) > -1) {
            self.rangesSwitched.remove(id);
        } else {
            self.rangesSwitched.push(id);
        }

        return true;
    }

    self.rangesSwitched = ko.observableArray([]);
    self.rangesSwitched.subscribe(function (newValue) {
        self.search.setQueryValue("rangesSwitched", newValue.join(","));
        self.search.updateResults();
    });
};

//Use the parent's prototype as a base.
RangedMarkerLayerVM.prototype = Object.create(MarkerLayerVM.prototype);

//But use your own constructor, not your parent's constructor (yet).
RangedMarkerLayerVM.prototype.constructor = RangedMarkerLayerVM;

RangedMarkerLayerVM.prototype.setupLayerSettings = function () {
    var self = this;
    MarkerLayerVM.prototype.setupLayerSettings.call(self,
        true,
        function() {
            self.rangesSwitched([]);
        });
}