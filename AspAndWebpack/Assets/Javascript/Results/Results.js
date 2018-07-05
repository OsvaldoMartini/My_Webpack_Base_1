﻿/**
 * A function view model to handle changes within a results view.
 * @param {string} containerId - The container which the view model is applied to.
 * @param {string} queryString - The search query string.
 * @param {Object} options - Additional options.
 * @param {ojbect} additionalVM - collection of vms to add to the resultsVM.
 */
var ResultsVM = function (containerId, queryString, options, additionalVm) {

    var self = this;

    var search = new Search({
        queryString: queryString
    });

    self.search = search;
    self.container = document.getElementById(containerId);

    self.gridVM = new GridVM(search);
    self.paginationVM = new PaginationVM(search);
    self.facetsVM = new FacetsVM(search);

    var searchOptions = { redirect: false, allowAdvancedSearch: options.showAdvancedSearch, enableSearchBarAutoComplete: options.enableSearchBarAutoComplete, showSearchBar: options.showSearchBar };

    self.searchBarVM = new SearchBarVM(search, searchOptions);
    self.filterTabsVM = new FilterTabsVM(search);
    self.sortVM = new SortVM(search);
    self.templatesVM = new TemplatesVM(search);
    self.commandsVM = new CommandsVM(search, { selectedRecordsFn: self.gridVM.selectedRecords, commandsType: 'grid' });
    self.rightHandPanelVM = new RightPanelVM(search);
    self.tutorial = new TutorialVM(options.tutorial || {}, search);
    self.options = options;

    for (var vms in additionalVm || {}) {
        if (!additionalVm.hasOwnProperty(vms)) return;
        self[vms] = new additionalVm[vms](search, self);
    }

    ko.applyBindings(self, self.container);

    $(".with-data-bind").each(function () {
        if (ko.dataFor(this)) return;
        ko.applyBindings(self, this);
    });

    search.updateResults(search.updateRequestSender.pageLoad);
};

ResultsVM.prototype.reload = function (queryString) {
    var self = this;

    var search = new Search({
        queryString: queryString
    });

    self.search = search;
    self.gridVM.search = search;
    self.gridVM.registerCallbacks(search, []);
    self.search.updateResults(self.search.updateRequestSender.pageLoad);
};

$('.showCategories').click(function () {
    $('.nav-tabs.nav-responsive').toggle();
});