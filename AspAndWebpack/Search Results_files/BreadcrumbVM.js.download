/**
 * A function to represent an applied facet.
 * @param {object} model - The model used to populate the view model.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 */
var BreadcrumbVM = function(model, facetsVM) {
    var self = this;
    self.facetsVM = facetsVM;
    self.indexer = model.Key;
    self.excluded = model.Inverted;
    self.pendingRemoval = ko.observable(false);
    self.value = model.Value;
    self.displayText = ko.observable(model.Text || "Unknown");
    self.displayExcluded = ko.observable(true);
}
;
/**
 * Remove a breadcrumb from the search and update the results.
 */
BreadcrumbVM.prototype.removeBreadcrumb = function(vm, evt) {
    var self = this;
    if (evt.ctrlKey) {
        self.pendingRemoval(! self.pendingRemoval());
        return;
    }
    var facets = self.facetsVM.getFacetsFromSearch();
    //remove and pendings
    for (var i = 0; i < self.facetsVM.breadcrumbs().length; i++) {
        var crumb = self.facetsVM.breadcrumbs()[i];
        if (crumb.pendingRemoval()) {
            var exclude = '';
            if (crumb.excluded) {
                exclude = '!!';
            }
            self.facetsVM.removeFacet(crumb.indexer + exclude, crumb.value, facets,true);
        }
    }

    //remove the last
    var exclude = '';
    if (self.excluded) {
        exclude = '!!';
    }
    self.facetsVM.removeFacet(self.indexer + exclude, self.value, facets, false);
}
;
