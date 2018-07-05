/**
 * A view model to handle the grid's filter tabs. Will apply a query value when a tab is clicked.
 * @param {Search} search - The class used for handling search related functions. 
 */
var FilterTabsVM = function (search) {

    var self = this;
    self.search = search;
    self.currentFilterTab = ko.observable(self.search.getQueryValue(self.search.queryProperty.tab));

    //If the page is an advanced search page, then don't show the results at the beginning unless a search term is defined.
    var visible = !self.search.equalsQueryValue(self.search.queryProperty.pageType, "advanced", false, true)
        || self.search.hasQueryValues([self.search.queryProperty.search, self.search.queryProperty.facet]);

    if (!visible) {
        search.registerFinishedCallback(function() {
            self.isVisible(true);
        }, [self.search.updateRequestSender.pageLoad]);
    }

    self.isVisible = ko.observable(visible);
};

/**
 * Applies a specific tab filter to the search.
 * @param {object} tabKey - The key of the tab which was clicked.
 */
FilterTabsVM.prototype.applyTabFilter = function (tabKey) {

    var self = this;

    self.currentFilterTab(tabKey);

    self.search.setQueryValue(self.search.queryProperty.tab, tabKey);
    self.search.setQueryValue(self.search.queryProperty.page, 1);
    self.search.updateResults(self.search.updateRequestSender.filterTab);
};
