/**
 * A view model to represent the date range node. Used to apply a date range to the search.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 */
var FacetDateRangeVM = function(model, facetsVM) {

    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-range-date", facetsVM);

    self.minValue = ko.observable(model.RangeMinLimit);
    self.maxValue = ko.observable(model.RangeMaxLimit);
    self.fromTitle = ko.observable(model.FromTitle || "From");
    self.toTitle = ko.observable(model.ToTitle || "To");
    self.yearRange = ko.observable(model.YearRange || "c-50:c+0");
    self.quickPicks = self.mapModelToQuickPicks(model.QuickPicks);
    self.selectedPick = ko.observable();

    var availableDates = Object.keys(model.AvailableOptions).map(function (opt) {
        return { date: new Date(opt), num: model.AvailableOptions[opt] };
    });

    self.availableDates = ko.observable(availableDates);


    self.quickPicksOnChange = function () {
        self.clearValues();

        if (self.selectedPick().from != null) {
            self.selectedLowerValue(self.selectedPick().from);
        }
        if (self.selectedPick().to != null) {
            self.selectedUpperValue(self.selectedPick().to);
        }
    };

    self.isActive = ko.observable(false);

    var maxValue = model.MaxValue;
    if (maxValue === "max") {
        maxValue = "";
    }
    
    var minValue = model.MinValue;
    if (minValue === "min") {
        minValue = "";
    }

    self.selectedLowerValue = ko.observable(minValue);
    self.selectedUpperValue = ko.observable(maxValue);

    self.originalValue = self.getFacetValue();
    self.value = self.originalValue;

    self.selectedLowerValue.subscribe(function() {
        self.updateApplyButton();
    }, this);

    self.selectedUpperValue.subscribe(function() {
        self.updateApplyButton();
    }, this);

    self.beforeShowDay = ko.computed(function(){
        if(self.availableDates().length === 0) {
            return null;
        }

        return function(date){
            return [!!self.availableDates().filter(function(d){ return d.date.valueOf() == date.valueOf(); }).length];
        };
    });
};

/**
 * Inheritance
 */
FacetDateRangeVM.prototype = Object.create(FacetItemVM.prototype);
FacetDateRangeVM.prototype.constructor = FacetDateRangeVM;

/*
 * Checks if value is selected and enables the apply button
 */
FacetDateRangeVM.prototype.updateApplyButton = function() {
    var self = this;

    self.value = self.getFacetValue();
    self.isSelected(false);
    if (self.originalValue !== self.value && self.isValid()) {
        self.isSelected(true);
    }
    self.facetsVM.registerSelected(self);
};

/**
* Clearss the values
*/
FacetDateRangeVM.prototype.clearValues = function () {
    var self = this;

    self.selectedLowerValue(null);
    self.selectedUpperValue(null);
    self.updateApplyButton();
};

/**
 * Deletes the lower value.
 */
FacetDateRangeVM.prototype.clearLowerValue = function() {
    var self = this;

    self.selectedLowerValue(null);
};

/**
 * Deletes the upper value.
 */
FacetDateRangeVM.prototype.clearUpperValue = function() {
    var self = this;

    self.selectedUpperValue(null);
};

/**
 * Determines whether the value inserted by the user are valid to use. e.g. checking the lower value does not exceed the macimum value etc.
 * @returns {boolean} - Whether or not the value is valid.
 */
FacetDateRangeVM.prototype.isValid = function() {
    var self = this;

    var validStart = !self.selectedLowerValue() || !self.minValue() || (self.selectedLowerValue() && self.selectedLowerValue() >= self.minValue());
    var validEnd = !self.selectedUpperValue() || !self.maxValue() || self.selectedUpperValue() && self.selectedUpperValue() <= self.maxValue();
    var maxIsBigger = !(self.selectedLowerValue() && self.selectedUpperValue()) || (new Date(self.selectedLowerValue()) <= new Date(self.selectedUpperValue()));

    return validStart && validEnd && maxIsBigger;
};

/**
 * Calculate the value to apply to the query string. This will include any upper or lower ranges.
 * @returns {string} - The value to apply to the query string.
 */
FacetDateRangeVM.prototype.getFacetValue = function() {
    var self = this;
    var lowerValue = self.selectedLowerValue() || self.minValue() || "";
    var upperValue = self.selectedUpperValue() || self.maxValue() || "";

    if (lowerValue instanceof Date) {
        lowerValue = self.processDate(lowerValue);
    }

    if (upperValue instanceof Date) {
        upperValue = self.processDate(upperValue);
    }

    if (lowerValue || upperValue) {
        var value = lowerValue + self.facetsVM.operator.range + upperValue;
        return value;
    }
    return "";
};

/**
 * Conberts a date into the 2016-01-31 format.
 * @param {date} date - The date to process.
 * @returns {string} - A formatted date string.
 */
FacetDateRangeVM.prototype.processDate = function(date) {
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();

    var value = year + "-" + month + "-" + day;
    return value;
}

/**
 * Applies the facet to the url.
 */
FacetDateRangeVM.prototype.applyFacet = function() {
    var self = this;
    if (self.isValid()) {
        self.facetsVM.applyFacet(self.indexer, self.getFacetValue(), true);
    }
};

/**
* Converts a model to an array of FacetRangeQuickPickVM
*/
FacetDateRangeVM.prototype.mapModelToQuickPicks = function (modelQuickPicks) {
    var self = this;
    var result = [];

    for (var i = 0; i < modelQuickPicks.length; i++) {
        result.push(new FacetRangeQuickPickVM(modelQuickPicks[i].Title, modelQuickPicks[i].From, modelQuickPicks[i].To));
    }

    return result;
};