/**
 * A view model to represent the number range facet. Allows users to create a number based range and apply it to the search.
 * @param {object} model - The object used to populate the facet.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 */
var FacetNumberRangeVM = function(model, facetsVM) {

    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-range-number", facetsVM);

    self.minValue = ko.observable(model.RangeMinLimit);
    self.maxValue = ko.observable(model.RangeMaxLimit);
    self.fromTitle = ko.observable(model.FromTitle || "From");
    self.toTitle = ko.observable(model.ToTitle || "To");

    self.quickPicks = self.mapModelToQuickPicks(model.QuickPicks);
    self.selectedPick = ko.observable();

    self.quickPicksOnChange = function () {
        self.clearValues();

        if (self.selectedPick().from != null) {
            self.selectedLowerValue(self.selectedPick().from);
        }
        if (self.selectedPick().to != null) {
            self.selectedUpperValue(self.selectedPick().to);
        }
    };

    var maxValue = model.MaxValue;
    if (maxValue === "max") {
        maxValue = "";
    }

    var minValue = model.MinValue;
    if (minValue === "min") {
        minValue = "";
    }

    self.selectedLowerValue = ko.observable(minValue).extend({ numeric: { min: self.minValue(), max: self.maxValue() } });
    self.selectedUpperValue = ko.observable(maxValue).extend({ numeric: { min: self.minValue(), max: self.maxValue() } });
    self.originalValue = self.getFacetValue();

    self.selectedLowerValue.subscribe(function () {
        self.updateApplyButton();
    }, this);

    self.selectedUpperValue.subscribe(function () {
        self.updateApplyButton();
    }, this);
};

/**
 * Inheritance
 */
FacetNumberRangeVM.prototype = Object.create(FacetItemVM.prototype);
FacetNumberRangeVM.prototype.constructor = FacetNumberRangeVM;

/**
* Clearss the values
*/
FacetNumberRangeVM.prototype.clearValues = function () {
    var self = this;

    self.selectedLowerValue(0);
    self.selectedUpperValue(0);
    self.updateApplyButton();
};

/**
 * Determines whether the facet value is valid or not. e.g. the lower value is less than the upper value.
 * @returns {bolean} - Whether or not the values are valid.
 */
FacetNumberRangeVM.prototype.isValid = function() {
    var self = this;

    var validStart = !self.selectedLowerValue() || !self.minValue() || (self.selectedLowerValue() && self.selectedLowerValue() >= self.minValue());
    var validEnd = !self.selectedUpperValue() || !self.maxValue() || self.selectedUpperValue() && self.selectedUpperValue() <= self.maxValue();
    var maxIsBigger = !(self.selectedLowerValue() && self.selectedUpperValue()) || (new Date(self.selectedLowerValue()) <= new Date(self.selectedUpperValue()));

    return validStart && validEnd && maxIsBigger;
};

/*
 * Checks if value is selected and enables the apply button
 */
FacetNumberRangeVM.prototype.updateApplyButton = function () {
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
FacetNumberRangeVM.prototype.getFacetValue = function() {
    var self = this;
    var lowerValue = self.selectedLowerValue() || self.minValue() || "";
    var upperValue = self.selectedUpperValue() || self.maxValue() || "";

    var value = lowerValue + self.facetsVM.operator.range + upperValue;
    return value;
};

/**
 * Applies the facet and value to the search object.
 */
FacetNumberRangeVM.prototype.applyFacet = function() {
    var self = this;
    if (self.isValid()) {
        self.facetsVM.applyFacet(self.indexer, self.getFacetValue(), true);
    }
};


/**
* Converts a model to an array of FacetRangeQuickPickVM
*/
FacetNumberRangeVM.prototype.mapModelToQuickPicks = function (modelQuickPicks) {
    var self = this;
    var result = [];

    for (var i = 0; i < modelQuickPicks.length; i++) {
        result.push(new FacetRangeQuickPickVM(modelQuickPicks[i].Title, modelQuickPicks[i].From, modelQuickPicks[i].To));
    }

    return result;
};