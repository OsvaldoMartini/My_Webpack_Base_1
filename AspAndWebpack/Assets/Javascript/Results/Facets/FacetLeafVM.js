/**
 * A view model to represent the leaf node of a facet tree. i.e one that cannot be expanded.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetLeafVM = function (model, facetsVM, parentPanel) {
    var self = this;

    var template = model.SingleSelect ? "template-facet-leaf-single-select" : "template-facet-leaf";

    //Call the super constructor
    FacetItemVM.call(self, model, template, facetsVM);
    self.reloadOnSearch = model.ReloadOnSearch === undefined ? true : model.ReloadOnSearch;

    self.value = model.Value;

    self.displayText = ko.observable(model.Text || "N/A");
    self.count = ko.observable(model.Count || 0);

    self.parentPanel = parentPanel;
    self.isExcluding = ko.observable(parentPanel.isExcluding());
    self.disableLabelClick = facetsVM.options.disableLabelClick || false;
    self.viewMore = ko.observable(model.ShowViewMore || false);
    self.singleSelect = model.SingleSelect || false;
};

/**
 * Inheritance
 */
FacetLeafVM.prototype = Object.create(FacetItemVM.prototype);
FacetLeafVM.prototype.constructor = FacetLeafVM;

FacetLeafVM.prototype.toggleSelected = function () {
    var self = this;

    var isSelected = self.isSelected();
    self.isSelected(!isSelected);

    self.facetsVM.registerSelected(self);

    //Allow knockout to continue through the event tree.
    return true;
};

/**
 * Apply any facet filter to the facet.
 * @param {string} filterText - The filter that will be applied to the facet.
 * @param {boolean} filterChanged - Whether or not the filter has changed since the last apply.
 * @returns {boolean} - Whether or not the facet matches the filter. 
 */
FacetLeafVM.prototype.applyFilter = function (filterText, filterChanged) {

    var self = this;

    var result = self.displayText().toLowerCase().indexOf(filterText) > -1;

    return result;
};

/**
 * Applies the facet to the url.
 */
FacetLeafVM.prototype.applyFacet = function() {
    var self = this;

    var exclude = '';
    if (self.parentPanel != null && self.parentPanel.isExcluding() == true) {
        exclude = '!!';
    }

    self.facetsVM.applyFacet(self.indexer + exclude, self.value);
};