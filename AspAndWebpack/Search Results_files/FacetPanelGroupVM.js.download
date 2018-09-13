/**
 * A view model to represent a facet panel group. e.g. the container for the highest level of a Taxonomy tree.
 * @param {object} model - The model used to populate the facet panel.
 * @param {FacetsVM} facetsVM - The view model containing the functionality for all facets.
 */
var FacetPanelGroupVM = function (model, facetsVM) {
    var self = this;
    self.id = model.Id;
    self.title = model.Title;
    self.padLocked = model.Padlocked;
    self.selected = ko.observable(false);
    self.facets = ko.observableArray(facetsVM || []);
    self.isVisible = ko.computed(function () {
        return self.facets().filter(function(f) { return f.isVisible(); }).length > 0;
    });
}

//  Used in FacetsPanel.cshtml - hides all the non selected body panels
//  so we only see the currently selected pills data.
function FacetPanelGroupTabHeaderClicked(data)
{
    $('.facetTabBody').hide(); // Hide all body divs.
    $('#facetPanel_' + data.id).removeClass("hidden"); // added hidden class to all non-first tabs on load to save page height.
    $('#facetPanel_' + data.id).show(); // Show the clicked body div.
    $('.facetsContainer select').trigger('chosen:updated'); 
    data.selected(true);
}
     
// debug util
ko.bindingHandlers.dump = {
    init: function (element, valueAccessor, allBindingsAccessor, viewmodel, bindingContext) {
        var context = valueAccessor();
        var allBindings = allBindingsAccessor();
        var pre = document.createElement('pre');

       document.body.appendChild(pre);

        var dumpJSON = ko.computed({
            read: function () {
                return ko.toJSON(context, null, 2);
            }
        ,
            disposeWhenNodeIsRemoved: element
        })

        ko.applyBindingsToNode(pre, { text: dumpJSON });
    }
}