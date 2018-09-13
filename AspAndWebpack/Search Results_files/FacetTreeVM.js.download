/**
 * A view model to represent a facet tree.
 * @param {object} model - The model used to populate the facet panel.
 * @param {FacetsVM} facetsVM - The view model containing the functionality for all facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetTreeVM = function (model, facetsVM, parentPanel) {
    var self = this;

    //Call the super constructor
    FacetItemVM.call(self, model, "template-facet-tree", facetsVM);
    self.reloadOnSearch = true;

    self.value = model.Value;
    self.displayText = ko.observable(model.Text || "N/A");
    self.isExpanded = ko.observable(false);
    self.count = ko.observable(model.Count || 0);
    self.errorOccured = ko.observable(false);
    self.isLoading = ko.observable(false);
    self.parentPanel = parentPanel;
    self.isExcluding = ko.observable(parentPanel.isExcluding());
    self.disableLabelClick = facetsVM.options.disableLabelClick || false;
    self.viewMore = ko.observable(model.ShowViewMore || false);

    var children = self.processChildren(model.Children);

    self.children = ko.observableArray(children || []);
    self.filteredChildren = ko.observableArray(children || []);

    self.facetLoadedCallbacks = [];

    if (self.facetsVM.checkIfOpened(self.indexer, self.value)) {
        self.expand();
    }
};

/**
 * Inheritance
 */
FacetTreeVM.prototype = Object.create(FacetItemVM.prototype);
FacetTreeVM.prototype.constructor = FacetTreeVM;

FacetTreeVM.prototype.countDescendants = function () {
    var self = this;
    var result = 1;

    self.loopChildren(function (p) {
        result += p.countDescendants();
    });

    return result;
};

FacetTreeVM.prototype.collapse = function () {
    var self = this;

    //if (self.facetsVM.checkIfOpened(self.facetKey, self.value)) {
    self.facetsVM.markAsClosed(self.indexer, self.value);
    self.loopChildren(function (p) {
        if (typeof p.collapse !== "undefined") p.collapse();
    });
    //}
};

/**
 * Loop through the children.
 * @param {Function} callback - The function to run with each child as an argument. 
 */
FacetTreeVM.prototype.loopChildren = function (callback) {
    var self = this;
    var children = self.children();

    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        callback(child);
    }
};

FacetTreeVM.prototype.toggleSelected = function () {
    var self = this;

    var isSelected = self.isSelected();
    isSelected = !isSelected;
    self.isSelected(isSelected);

    self.facetsVM.registerSelected(self);
    self.updateChildrenStatus();

    //Allow knockout to continue through the event tree.
    return true;
};

/**
 * Called when a global apply facets is called.
 */
FacetTreeVM.prototype.onApplyFilter = function () {
    var self = this;
    self.expandTree();
};

/**
 * Apply any facet filter to the tree and its children.
 * @param {string} filterText - The filter that will be applied to the facets.
 * @param {boolean} filterChanged - Whether or not the filter has changed since the last apply.
 * @returns {boolean} - Wether or not the tree is to remain visible after the filter is applied. 
 */
FacetTreeVM.prototype.applyFilter = function (filterText, filterChanged) {

    var self = this;
    var matchedChildren = [];

    var matchesSelf = self.displayText().toLowerCase().indexOf(filterText) > -1;

    var children = self.children();

    self.loopChildren(function (p) {
        if (p.applyFilter(filterText, filterChanged)) {
            matchedChildren.push(p);
        }
    });

    self.filteredChildren(matchedChildren);

    var result = matchesSelf || matchedChildren.length > 0;

    if (filterChanged) {
        self.isExpanded(matchedChildren.length > 0 && filterText.length > 0);
    }

    return result;
};

/**
 * Marks the facet children of the tree to either disabled or not disabled.
 */
FacetTreeVM.prototype.updateChildrenStatus = function () {
    var self = this;

    var isSelected = self.isSelected();

    self.loopChildren(function (p) {
        p.applyProperties({ isInSelectedTree: isSelected }, true);
    });
};

/**
 * Applies a set of properties onto the object. Can also recurse through its children and apply the same properties onto them.
 * @param {object} properties - A dictionary of properties and their values that are to be applied.
 * @param {boolean} recurse - Whether or not to apply the properties to its children.
 */
FacetTreeVM.prototype.applyProperties = function (properties, recurse) {
    var self = this;
    FacetItemVM.prototype.applyProperties.call(this, properties, recurse);

    if (recurse) {
        self.loopChildren(function (p) {
            p.applyProperties(properties, recurse);
        });
    }
};

/**
 * Apply the tree facet and its value to the search.
 */
FacetTreeVM.prototype.applyFacet = function () {
    var self = this;

    var exclude = '';
    if (self.parentPanel != null && self.parentPanel.isExcluding() == true) {
        exclude = '!!';
    }

    self.expandTree();

    self.facetsVM.applyFacet(self.indexer + exclude, self.value);
};

/**
 * Expands the facet tree and discovers its children if required.
 * @param {boolean} openChildren - Whether or not to expand the children once they've loaded.
 */
FacetTreeVM.prototype.expand = function (openChildren) {
    var self = this;

    var isExpanded = self.isExpanded();

    if (self.children().length === 0 && !isExpanded) {
        self.discoverChildren(openChildren);
    } else if (self.children().length > 0 && !isExpanded && openChildren) {
        //Expand the children if possible
        self.loopChildren(function (p) {
            if (typeof p.expandTree === 'function') {
                p.expandTree();
            } else {
                p.isSelected(true);
            }
        });
    }

    if (!isExpanded) { //was not open, now it will be
        self.facetsVM.markAsOpened(self.indexer, self.value);
    } else { //was open, now it will be closed
        //self.facetsVM.markAsClosed(self.indexer, self.value);
        self.collapse();
    }

    self.isExpanded(!isExpanded);
};

/**
 * Find any children facets for this facet tree and process them.
 * @param {boolean} openChildren - Whether or not to expand the children once they've loaded.
 */
FacetTreeVM.prototype.discoverChildren = function (openChildren) {
    var self = this;
    var url = "facets/Expand?";

    if (self.facetsVM.options.categoryUrlKey) {
        url = "/" + self.facetsVM.options.categoryUrlKey + "/" + url;
    }

    var queryString = self.facetsVM.search.calculateQueryString();

    self.isLoading(true);

    $.post(url, { query: queryString, facet: self.indexer, value: self.value }, function (children) {

        self.isLoading(false);
        self.errorOccured(false);
        var childVMs = [];

        for (var i = 0; i < children.Facets.length; i++) {
            var child = children.Facets[i];
            var childVM = self.processChild(child);
            if (childVM) {
                childVM.isInSelectedTree(self.isSelected());

                if (openChildren && typeof childVM.expandTree === "function") {
                    childVM.expandTree();
                } else if (openChildren) {
                    childVM.isSelected(true);
                }

                childVMs.push(childVM);
            }
        }

        self.children(childVMs);

        self.facetLoadedCallbacks.forEach(function (c) {
            c(self);
        });

    }).fail(function () {
        self.errorOccured(true);
    });;
};

/**
 * Process a collection of server models and turn them into facet item view models.
 * @param {object[]} children - A collection of server models.
 * @returns {FacetItemVM[]} - A colleciton of facets items.
 */
FacetTreeVM.prototype.processChildren = function (children) {

    var self = this;

    var result = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var vm = self.processChild(child);
        result.push(vm);
    }

    return result;

};

/**
 * Determine which chld model to create based upon the child's model. 
 * @param {object} child - The server model containing the information about the facet.
 * @returns {FacetItemVM} - A facet item view model or any view model inheriting off of it. 
 */
FacetTreeVM.prototype.processChild = function (child) {

    var self = this;
    var childVM = new (self.facetsVM.childVM(child.FacetType))(child, self.facetsVM, self.parentPanel);

    return childVM;
};

FacetTreeVM.prototype.expandTree = function () {
    var self = this;

    if (!self.isExpanded()) {
        self.isSelected(true);
        self.expand(true);
    }
};