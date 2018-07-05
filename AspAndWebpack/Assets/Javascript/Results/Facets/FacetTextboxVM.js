/**
 * A view model to represent the textobx node. Used search on a particular attribute.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetTextboxVM = function (model, facetsVM, parentPanel) {

    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-textbox", facetsVM);

    self.placeholderText = model.PlaceHolder;
    self.filters = ko.observableArray(model.Filters.map(function (f) { return new FacetTextboxFilterVM(f); }) || []);
    self.selectedItems = ko.computed(function () {
        return self.filters().filter(function (f) {
            return f.isSelected();
        }).map(function (f) {
            return f.value;
        });
    });

    if (model.Filters.length) {
        self.queryKey = 'q';
    }

    self.textValue = ko.observable('');
    self.isExpanded = ko.observable(false);
    self.expand = function () {
        self.isExpanded(!self.isExpanded());
    };

    self.isActive = ko.observable(false);
    self.isLoading = ko.observable(false);
    self.parentPanel = parentPanel;
    self.isExcluding = ko.observable(parentPanel.isExcluding());

    self.textValue.subscribe(function () {
        self.updateApplyButton();
    });
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

        if (self.queryKey == 'q') {
            self.search.setQueryValue(self.queryKey, self.value);

            return;
        }

        self.facetsVM.applyFacet(self.indexer + exclude, keyToUse, true);
    };

    self.updateApplyButton();
};

/**
 * Inheritance
 */
FacetTextboxVM.prototype = Object.create(FacetItemVM.prototype);
FacetTextboxVM.prototype.constructor = FacetTextboxVM;


/*
 * Checks if value is selected and enables the apply button
 */
FacetTextboxVM.prototype.updateApplyButton = function () {
    var self = this;

    self.value = self.getFacetValue();
    self.isSelected(false);
    if (self.textValue().length && (self.selectedItems().length || !self.filters().length)) {
        self.isSelected(true);
    }

    self.facetsVM.registerSelected(self);
};

/**
 * Calculate the value to apply to the query string. This will include any upper or lower ranges.
 * @returns {string} - The value to apply to the query string.
 */
FacetTextboxVM.prototype.getFacetValue = function () {
    var self = this;
    self.dynamicIndex = '';
    if (self.selectedItems().length != self.filters().length && self.selectedItems().length > 0) {
        self.dynamicIndex = self.selectedItems().join('|');
    }

    return self.textValue();// self.selectedItems().join(self.facetsVM.operator.or);
};

FacetTextboxVM.prototype.onApplyFilter = function () {
    var self = this;
    self.textValue('');
    self.filters().forEach(function (f) { f.isSelected(true); });
}

/**
 * A view model to represent the Textbox filters.
 * @param {string} attribute - The attribute to use to filter with.
 * @param {string} value - The value to filter on.
 * @param {string} title - The title to display.
 * @param {bool} isSelected - A value indicating whether the filter is selected.
 */
var FacetTextboxFilterVM = function (attribute, value, title, isSelected) {
    var self = this;

    if (typeof attribute === 'object' && attribute.Attribute) {
        isSelected = attribute.Selected;
        title = attribute.Title;
        value = attribute.Value;
        attribute = attribute.Attribute;
    }

    self.attribute = attribute;
    self.value = value;
    self.title = title;
    self.isSelected = ko.observable(!!isSelected);
};