/**
 * A view model to represent the type ahead node. Used search on a particular indexer when a users starts typing.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetDropdownVM = function (model, facetsVM, parentPanel) {

    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-dropdown", facetsVM);
    self.reloadOnSearch = true;

    self.placeholderText = model.PlaceHolder || "Select Some Options";
    self.filteredChildren = ko.observableArray(Object.keys(model.TopLinks));
    self.selectedItems = ko.observableArray([]);

    self.isActive = ko.observable(false);
    self.isLoading = ko.observable(false);
    self.parentPanel = parentPanel;
    self.isExcluding = ko.observable(parentPanel.isExcluding());

    self.selectedItems.subscribe(function () {
        self.updateApplyButton();
    });



    /**
     * Applies the facet to the url.
     */
    self.applyFacet = function (item) {
        var keyToUse;
        if (typeof (item) === "object") {
            keyToUse = item.displayText;
        } else {
            keyToUse = item;
        }

        var exclude = '';
        if (self.parentPanel != null && self.parentPanel.isExcluding() == true) {
            exclude = '!!';
        }

        self.facetsVM.applyFacet(self.indexer + exclude, keyToUse, true);
    };

    self.updateApplyButton();
};

/**
 * Inheritance
 */
FacetDropdownVM.prototype = Object.create(FacetItemVM.prototype);
FacetDropdownVM.prototype.constructor = FacetDropdownVM;

/*
 * Checks if value is selected and enables the apply button
 */
FacetDropdownVM.prototype.updateApplyButton = function () {
    var self = this;

    self.value = self.getFacetValue();
    self.isSelected(false);
    if (self.selectedItems().length > 0) {
        self.isSelected(true);
    }
    self.facetsVM.registerSelected(self);
};

/**
 * Calculate the value to apply to the query string. This will include any upper or lower ranges.
 * @returns {string} - The value to apply to the query string.
 */
FacetDropdownVM.prototype.getFacetValue = function () {
    var self = this;

    return self.selectedItems().join(self.facetsVM.operator.or);
};

