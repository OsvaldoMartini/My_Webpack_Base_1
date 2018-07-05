/**
 * A view model to represent the number range facet. 
 * Allows users to create a number based range and apply it to the search.
 * @param {object} model - The object used to populate the facet.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 */
var FacetRangeSliderVM = function(model, facetsVM) {

    var self = this;

    model.MinValue = (parseInt(model.MinValue) > 1900) ? model.MinValue : new Date().getFullYear(); // Explicitly set the min date if date is not provided. This will be updated if breadcrumbs exist.
    var facetBreadCumbPresent = facetsVM.getFacetsFromSearch()[model.Key];
    if (facetBreadCumbPresent) {
        var breadCrumbYears = decodeURIComponent(facetBreadCumbPresent.values).split("::");
        if (breadCrumbYears.length === 2) { // Only set facet years if Min and Max values have been parsed.
            model.MinValue = breadCrumbYears[0];
            model.MaxValue = breadCrumbYears[1];
        }
    }

   //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-range-slider", facetsVM);
    var year = (new Date()).getFullYear();
    var yearRange = (model.YearRange || "::").split("::", 2);
    yearRange = _.map(yearRange, function (v) { return +v });
    yearRange[0] = Math.max(yearRange[0], year + (model.RangeMinLimit === null ? -100 : +model.RangeMinLimit));
    yearRange[1] = Math.min(yearRange[1] || year + (+model.RangeMaxLimit), year + (+model.RangeMaxLimit));

    self.defaultMinMaxValues = [yearRange[0], yearRange[1]];

    self.minMaxvalues = ko.observableArray([model.MinValue || self.defaultMinMaxValues[0], model.MaxValue || self.defaultMinMaxValues[1]]);
    self.minValue = ko.observable(yearRange[0]);
    self.maxValue = ko.observable(yearRange[1]);
    self.fromTitle = ko.observable(model.FromTitle || "From");
    self.toTitle = ko.observable(model.ToTitle || "To");

    self.lowerValue = ko.computed(function () { return self.minMaxvalues()[0] });
    self.upperValue = ko.computed(function () { return self.minMaxvalues()[1] });
    self.lowerPosition = ko.computed(function () { return ((self.minMaxvalues()[0] - self.minValue()) * 100 / (self.maxValue() - self.minValue())) + '%' });
    self.upperPosition = ko.computed(function () { return ((self.minMaxvalues()[1] - self.minValue()) * 100 / (self.maxValue() - self.minValue())) + '%' });

    self.originalValue = self.getFacetValue();

    self.minMaxvalues.subscribe(function () {
        self.updateApplyButton();
    }, this);
};

/**
 * Inheritance
 */
FacetRangeSliderVM.prototype = Object.create(FacetItemVM.prototype);
FacetRangeSliderVM.prototype.constructor = FacetRangeSliderVM;

/**
* Clears the values
*/
FacetRangeSliderVM.prototype.clearValues = function () {
    var self = this;

    self.selectedLowerValue(0);
    self.selectedUpperValue(0);
    self.updateApplyButton();
};

/**
 * Determines whether the facet value is valid or not. e.g. the lower value is less than the upper value.
 * @returns {bolean} - Whether or not the values are valid.
 */
FacetRangeSliderVM.prototype.isValid = function() {
    var self = this;

    var validStart = !self.minMaxvalues()[0] || !self.minValue() || (self.minMaxvalues()[0] && self.minMaxvalues()[0] >= self.minValue());
    var validEnd = !self.minMaxvalues()[1] || !self.maxValue() || self.minMaxvalues()[1] && self.minMaxvalues()[1] <= self.maxValue();
    var maxIsBigger = !(self.minMaxvalues()[0] && self.minMaxvalues()[1]) || (new Date(self.minMaxvalues()[0]) <= new Date(self.minMaxvalues()[1]));

    return validStart && validEnd && maxIsBigger;
};

/*
 * Checks if value is selected and enables the apply button
 */
FacetRangeSliderVM.prototype.updateApplyButton = function () {
    var self = this;

    self.value = self.getFacetValue();
    self.isSelected(false);
    if (self.originalValue !== self.value && self.isValid()) {
        self.isSelected(true);
    }
    self.facetsVM.registerSelected(self);
};

/**
 * Calculate the facet value to applu to the search.
 * @returns {string} - The formated range as a string. 
 */
FacetRangeSliderVM.prototype.getFacetValue = function() {
    var self = this;
    var lowerValue = self.minMaxvalues()[0] || self.minValue() || "";
    var upperValue = self.minMaxvalues()[1] || self.maxValue() || "";

    var value = lowerValue + self.facetsVM.operator.range + upperValue;
    return value;
};

/**
 * Applies the facet and value to the search object.
 */
FacetRangeSliderVM.prototype.applyFacet = function() {
    var self = this;
    if (self.isValid()) {
        self.facetsVM.applyFacet(self.indexer, self.getFacetValue(), true);
    }
};

/**
 * Apply applied and selected value to originalValue.
 */
FacetRangeSliderVM.prototype.onApplyFilter = function () {
    this.originalValue = this.getFacetValue();
};