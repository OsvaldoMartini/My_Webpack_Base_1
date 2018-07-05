/**
 * A view model to represent the checkbox node. Used to apply a boolean to the search.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 */
var FacetCheckboxVM = function(model, facetsVM) {

    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-checkbox", facetsVM);

    self.checked = ko.observable(model.Checked);
    self.label = model.Label;
    
    self.isActive = ko.observable(false);

    self.values = [model.False || false, model.True || true];

    self.removeIfUnchecked = model.RemoveIfUnchecked;

    if (self.removeIfUnchecked) {
        self.facetsVM.search.registerFinishedCallback(function () {
            if (!self.facetsVM.hasFacet(self.indexer, "true", self.facetsVM.getFacetsFromSearch())) {
                self.checked(false);
            }
        });
    }

    self.checked.subscribe(function() {
        self.applyFacet();
    }, this);
};

/**
 * Inheritance
 */
FacetCheckboxVM.prototype = Object.create(FacetItemVM.prototype);
FacetCheckboxVM.prototype.constructor = FacetCheckboxVM;

/**
 * Calculate the value to apply to the query string. This will include any upper or lower ranges.
 * @returns {string} - The value to apply to the query string.
 */
FacetCheckboxVM.prototype.getFacetValue = function () {
    var self = this;
    return self.values[+self.checked()];
};

/**
 * Applies the facet to the url.
 */
FacetCheckboxVM.prototype.applyFacet = function () {
    var self = this;

    if (self.removeIfUnchecked && !self.checked()) {
        self.facetsVM.removeFacet(self.indexer, (!self.checked()).toString(), self.facetsVM.getFacetsFromSearch(), false);
    }
    else {
        self.facetsVM.applyFacet(self.indexer, self.getFacetValue(), true);
    }
};