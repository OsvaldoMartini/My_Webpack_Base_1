/**
 * The super class for all facets. Stores common properties found in each facet.
 * @param {object} model - The object used to populate the facet.
 * @param {string} templateName - The name of the knockout template that will be used to present the GUI.
 * @param {FacetsVM} facetsVM - The facets view model containing functions needed by the facets.
 */
var FacetItemVM = function(model, templateName, facetsVM) {
  var self = this;

  self.facetClientId = ko.observable("facet_" + Math.random());
  self.indexer = model.Key;
    self.isActive = ko.observable(model.Act || false);
    self.isSelected = ko.observable(model.Act || false);
  self.facetsVM = facetsVM;
  self.facetType = model.FacetType;
  self.facetKey = model.FacetKey;
  self.templateName = ko.observable(templateName);
  self.isInSelectedTree = ko.observable(model.SubAct || false);
    self.isInActiveTree = ko.observable(model.SubAct || false);
  self.icon = ko.observable(model.Icon || "");
  self.queryKey = "f";

  // on Search callback, reload facet, default = false.
  self.reloadOnSearch = false;
};

/**
 * Apply any facet filter to the facet. This is the super method, so it will also believe the filter applies to the facet.
 * Will be overriden by individual facet types where necessary.
 * @returns {boolean} - Wether or not the tree is to remain visible after the filter is applied.
 */
FacetItemVM.prototype.applyFilter = function() {
  return true;
};

/**
 * Applies a set of properties onto the object.
 * @param {object} properties - A dictionary of properties and their values that are to be applied.
 */
FacetItemVM.prototype.applyProperties = function(properties) {
  var self = this;

  for (var key in properties) {
    if (self.hasOwnProperty(key)) {
      if (typeof self[key] === "function") {
        self[key](properties[key]);
      } else {
        self[key] = properties[key];
      }
    }
  }
};

/**
 * Called when applying the changed facets to the search.
 */
FacetItemVM.prototype.onApplyFilter = function() {};

/**
 * Called when facetItem is shown.
 */
FacetItemVM.prototype.onShow = function() {};

/**
 * Count the number of facet items within this facet item.
 */
FacetItemVM.prototype.countDescendants = function() {
  return 1;
};
