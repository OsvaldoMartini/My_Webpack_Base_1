/**
 * A view model to handle the grid's column sorts. Will apply a query value when a sort is selected.
 * @param {Search} search - The class used for handling search related functions.
 */
var SortVM = function (search) {
    var self = this;

    // Used to identify if the knockout subscribe (onChange) event has been wired up.
    var isSortChangedEventSubscribed = false;

    self.search = search;
    self.sortOptionsDisplayList = ko.observableArray([]);
    self.relevancy = ko.observable(false);
    self.sortDetails = ko.observable([]);
    self.sortLive = ko.observable(false);
    self.selectedSort = ko.observable("");
    self.sortOptions = ko.observableArray([]);

    //If the page is an advanced search page, then don't show the results at the beginning unless a search term is defined.
    var ignoreUpdatesFrom = self.search.equalsQueryValue(self.search.queryProperty.pageType, "advanced", false, true)
        && !self.search.hasQueryValues([self.search.queryProperty.search, self.search.queryProperty.facet]) ? [self.search.updateRequestSender.pageLoad] : [];

    search.registerStartCallback(function () {
        self.sortLive(false);
    }, ignoreUpdatesFrom);

    search.registerFinishedCallback(function (result) {
        if (result.MetaData.SortDetails) {
            self.sortLive(true);
            self.relevancy(result.MetaData.SortDetails.AllowRelevancy);
            self.sortDetails(result.MetaData.SortDetails.SortableColumns);

            self.populateSortArray();
            var selectedSort = result.MetaData.SortDetails.SortedColumn;
            if (selectedSort) {
                var col = self.sortOptions()
                    .filter(function (i) {
                        return i.sortval === selectedSort.Key;
                    });
                if (col.length > 0) {
                    self.selectedSort(col[0].display);
                }
            } else if (self.relevancy() && self.search.hasQueryValue(self.search.queryProperty.search)) {
                self.selectedSort("Relevancy");
            }

            if (!isSortChangedEventSubscribed) {
                self.selectedSort.subscribe(self.onSelectedSortChanged);
                isSortChangedEventSubscribed = true;
            }
        }
    }, ignoreUpdatesFrom);

    self.onSelectedSortChanged = function (sortval) {
        if (!sortval) return;
        var lookup = self.sortOptions();

        var queryRow = lookup.filter(function (i) {
            return i.display === sortval;
        });

        var currentSortValue = self.search.getQueryValue(self.search.queryProperty.sort);
        var newSortValue = queryRow[0].sortval;

        if (currentSortValue !== newSortValue) {
            self.search.setQueryValue(self.search.queryProperty.sort, newSortValue);
            self.search.setQueryValue(self.search.queryProperty.page, 1);
            self.search.updateResults(self.search.updateRequestSender.sort);
        }
    };
};

/**
* Repopulates the sorts using the returned search results.
* @param {event} event - The UI changed event.
*/
SortVM.prototype.populateSortArray = function () {
    var self = this;

    var sortArray = [];
    var sortLookup = [];

    var oldSort = self.selectedSort();
    if (self.relevancy()) {
        sortArray.push("Relevancy");
        sortLookup.push({ display: "Relevancy", sortval: null });
    }

    self.sortDetails().forEach(function (columnSort) {
        if (!columnSort.Column.hidden && columnSort.Column.is_displayed) {
            var direction = columnSort.SortDirection === 1 ? columnSort.Column.ascending_text : columnSort.Column.descending_text;
            var arrayRow = columnSort.DisplayKey + " (" + direction + ")";
            var lookupRow = { display: columnSort.DisplayKey + " (" + direction + ")", sortval: columnSort.Key };
            sortArray.push(arrayRow);
            sortLookup.push(lookupRow);
        }
    });

    self.sortOptions(sortLookup);
    self.sortOptionsDisplayList(sortArray);
};

SortVM.prototype.setSort = function (idx, dir) {
    var self = this;
    var lookup = self.sortOptions();
    var key = idx + '|' + dir;
    var sortKey = lookup.filter(function (i) {
        return i.sortval && i.sortval.toLowerCase() === key.toLowerCase();
    });
    if (!sortKey.length) return;
    self.selectedSort(sortKey[0].display);
};