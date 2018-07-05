/**
 * A view model to represent the date node. Used to apply a date to the search.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 */
var FacetDateVM = function (model, facetsVM) {

    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-date", facetsVM);

    self.minValue = ko.observable(model.MinValue);
    self.maxValue = ko.observable(model.MaxValue);
    self.yearRange = ko.observable(model.YearRange || "c-50:c+0");
    var availableDates = Object.keys(model.AvailableOptions).map(function (opt) {
        return {
            date: new Date(opt),
            num: model.AvailableOptions[opt] 
        };
    });
    var facetObj = facetsVM.getFacetsFromSearch()[model.Key];
    var defaultValue = null;
    if (facetObj && facetObj.values.length) {
        defaultValue = facetObj.values[0];
    }
    self.selectedValue = ko.observable(defaultValue);

    self.availableDates = ko.observableArray(availableDates);

    self.lastValue = ko.computed(function (){
        return self.availableDates().reduce(function (date, d) {
            if (!date || d.date > date) {
                return d.date;
            }

            return date;
        }, null);
    });
    self.firstValue = ko.computed(function (){
        return self.availableDates().reduce(function (date, d) {
            if (!date || d.date < date) {
                return d.date;
            }

            return date;
        }, null);
    });
    self.isActive = ko.observable(false);
    self.originalValue = self.getFacetValue();

    var defaultValue = self.originalValue || (!self.availableDates().length
        ? ""
        : self.availableDates().sort(function (a, b) {
            return b.date - a.date;
        })[0].date);

    self.value = self.originalValue;
    
    self.selectedValue(defaultValue);
    self.selectedValue.subscribe(function () {
        self.updateApplyButton();
    }, self);

    self.beforeShowDay = ko.computed(function () {
        if (self.availableDates().length === 0) {
            return null;
        }

        return function (date) {
            return [!!self.availableDates().filter(function (d) { 
                return d.date.valueOf() === date.valueOf();
            }).length];
        };
    });
};

/**
 * Inheritance
 */
FacetDateVM.prototype = Object.create(FacetItemVM.prototype);
FacetDateVM.prototype.constructor = FacetDateVM;

/*
 * Checks if value is selected and enables the apply button
 */
FacetDateVM.prototype.updateApplyButton = function () {
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
FacetDateVM.prototype.clearValue = function () {
    var self = this;

    self.selectedValue(null);
    self.updateApplyButton();
};

/**
 * Determines whether the value inserted by the user are valid to use. e.g. checking the lower value does not exceed the macimum value etc.
 * @returns {boolean} - Whether or not the value is valid.
 */
FacetDateVM.prototype.isValid = function () {
    var self = this;
    var valid = !self.selectedValue() || !self.minValue() || !self.maxValue() || (self.selectedValue() > self.minValue() && self.selectedValue() < self.maxValue());
    return valid;
};

/**
 * Calculate the value to apply to the query string. This will include any upper or lower ranges.
 * @returns {string} - The value to apply to the query string.
 */
FacetDateVM.prototype.getFacetValue = function () {
    var self = this;
    var value = self.selectedValue() || self.maxValue() || "";

    if (value instanceof Date) {
        value = self.processDate(value);
    }

    return value;
};

/**
 * Converts a date into the 2016-01-31 format.
 * @param {date} date - The date to process.
 * @returns {string} - A formatted date string.
 */
FacetDateVM.prototype.processDate = function (date) {
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();

    var value = year + "-" + month + "-" + day;
    return value;
}

/**
 * Applies the facet to the url.
 */
FacetDateVM.prototype.applyFacet = function () {
    var self = this;
    if (self.isValid()) {
        self.facetsVM.applyFacet(self.indexer, self.getFacetValue(), true);
    }
};