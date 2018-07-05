/**
 * A view model to represent the leaf node of a facet tree. i.e one that cannot be expanded.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetMapLayerVM = function(FacetLeafVM, mapLayer) {
  var self = this;

  for (var part in FacetLeafVM) {
    if (self[part] !== undefined) continue;
    self[part] = FacetLeafVM[part];
  }

  self.templateName("template-facet-layer");
  self.isSelected.subscribe(self.applyFacet.bind(self));
  self.isSettingUp = false;
  self.layer = mapLayer;
  self.isLoading = ko.observable(false);
  self.static = self.layer.options.static;
};

/**
 * Inheritance
 */
FacetMapLayerVM.prototype = Object.create(FacetLeafVM.prototype);
FacetMapLayerVM.prototype.constructor = FacetMapLayerVM;

FacetMapLayerVM.prototype.toggleSelected = function() {
  var self = this;

  var isSelected = self.isSelected();
  self.isSelected(!isSelected);
  return true;
};

/**
 * Apply any facet filter to the facet.
 * @param {string} filterText - The filter that will be applied to the facet.
 * @param {boolean} filterChanged - Whether or not the filter has changed since the last apply.
 * @returns {boolean} - Whether or not the facet matches the filter.
 */
FacetMapLayerVM.prototype.applyFilter = function(filterText, filterChanged) {
  var self = this;

  var result =
    self
      .displayText()
      .toLowerCase()
      .indexOf(filterText) > -1;

  return result;
};

/**
 * Applies the facet to the url.
 */
FacetMapLayerVM.prototype.applyFacet = function(isSelected) {
  var self = this;
  if (self.isSettingUp) return;
  if (self.layer.checkFacet(self) === false) {
    return;
  }

  var stopSubmit = !!self.static;
  var updateStatic = function() {
    if (!stopSubmit || !self.layer.updateStatic) {
      self.layer.isVisible(true);
      return;
    }
    self.layer.updateStatic();
  };

  var facets = self.facetsVM.getFacetsFromSearch();
  var exclude = "";
  var inverseExclude = "!!";
  if (!isSelected) {
    exclude = "!!";
    inverseExclude = "";
  }

  var indexer = self.indexer + "!!";
  if (
    isSelected &&
    facets.hasOwnProperty(indexer) &&
    (facets[indexer].values || []).indexOf(self.value) >= 0
  ) {
    self.facetsVM.removeFacet(indexer, self.value, undefined, stopSubmit);
    updateStatic();
    return;
  }

  indexer = self.indexer;
  if (
    !isSelected &&
    facets.hasOwnProperty(indexer) &&
    (facets[indexer].values || []).indexOf(self.value) >= 0
  ) {
    self.facetsVM.removeFacet(indexer, self.value, undefined, stopSubmit);
    updateStatic();
    return;
  }

  var path = self.value.split("__");
  if (
    path.length > 1 &&
    isSelected &&
    facets.hasOwnProperty(self.indexer + "!!")
  ) {
    var route = "";
    indexer = self.indexer + "!!";
    for (var i = 0; i < path.length; i++) {
      route = path.slice(0, i).join("_");
      if ((facets[indexer].values || []).indexOf(route) >= 0) {
        self.facetsVM.removeFacet(indexer, route, undefined, true);
      }
    }
  }

  self.facetsVM.applyFacet(
    self.indexer + exclude,
    self.value,
    undefined,
    undefined,
    stopSubmit
  );
  updateStatic();
};

FacetMapLayerVM.prototype.updateSelectedFromSearch = function() {
  var self = this;
  var isSelected = (function() {
    var facets = self.facetsVM.getFacetsFromSearch(),
      facetValues = [];

    function test(indexer, value, is) {
      var facet, values, i;
      if (!(facet = facets[indexer])) return true;
      if ((values = facet.values).length === 0) return true;
      var valueParts = value.split("__"),
        newPart = "";
      while (valueParts.length) {
        newPart = valueParts.join("__");
        i = values.length;
        while (i--) {
          if (values[i] == newPart) return !!is;
        }
        valueParts.pop();
      }
      return !is;
    }

    return (
      test(self.indexer, self.value, true) &&
      test(self.indexer + "!!", self.value, false)
    );
  })();
  self.isSettingUp = true;
  self.isSelected(isSelected && self.layer.isVisible());
  self.isActive(isSelected);
  self.isSettingUp = false;
};
