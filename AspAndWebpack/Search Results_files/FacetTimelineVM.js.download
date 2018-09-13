/**
 * A view model to represent the leaf node of a facet tree. i.e one that cannot be expanded.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetTimelineVM = function (model, facetsVM, parentPanel) {
    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-timeline", facetsVM);
    self.reloadOnSearch = false;

    self.parentPanel = parentPanel;

    self.selectedItem = ko.observable(model.Value);
    self.selectedVal = ko.pureComputed({
        read: function () {
            var selected = self.selectedItem();
            return selected.getTime ? selected : new Date(typeof selected == "string" ? Date.parse(selected) : selected);
        },
        write: function (value) {
            var selected = value.getTime ? value : new Date(typeof value == "string" ? Date.parse(value) : value);
            self.selectedItem(selected);
        },
        owner: this
    });
    self.children = ko.observableArray(model.Children || []);

    self.animateChildren = ko.observable(false);
    self.animateChildren.subscribe(self.animate.bind(self));
};

/**
 * Inheritance
 */
FacetTimelineVM.prototype = Object.create(FacetItemVM.prototype);
FacetTimelineVM.prototype.constructor = FacetTimelineVM;

FacetTimelineVM.prototype.isSelectedChild = function (data) {
    var self = this;
    if (self.selectedItem().getTime && data.getTime) {
        return self.selectedItem().getTime() === data.getTime();
    }

    return self.selectedItem() === data.getTime();
};

FacetTimelineVM.prototype.animate = function (playing) {
    var self = this;

    if (!playing) {
        if(self.playing)
            clearInterval(self.playing);
        return;
    }

    var doMove = function (start) {
        var children = self.children();
        var index = children.map(Number).indexOf(+self.selectedVal());
        if (start && (index < 0 || index == children.length - 1)) index = -1;
        index++;
        if (index >= children.length) { self.animateChildren(false); return; }
        self.selectedVal(children[index]);
    };
    doMove(true);

    self.playing = setInterval(doMove, 1000);
};
