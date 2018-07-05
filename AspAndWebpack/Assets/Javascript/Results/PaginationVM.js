/**
 * A view model to handle the grid's pagination. Will apply a query value when a page is changed.
 * @param {Search} search - The class used for handling search related funcitons. 
 */
var PaginationVM = function (search) {
    var self = this;
    self.search = search;
    self.totalPages = ko.observable(1);
    self.totalResults = ko.observable(0);
    self.pageIndex = ko.observable(0);
    self.displayOnPage = ko.observable(0);
    self.resultsBeginIndex = ko.observable(0);
    self.resultsOnPage = ko.observable(0);
    self.resultsEndIndex = ko.observable(0);
    self.searchTime = ko.observable(0);
    self.queryParseTime = ko.observable(0);
    self.renderTime = ko.observable(0);
    self.PagesScrolled = ko.observable(1);
    self.paginationStyle = ko.observable("scroll");
    self.nextPrevToggle = ko.observable(false);
    self.scrollerToggle = ko.observable(true);
    self.newSearchText = ko.observable();

    self.addSearchFilter = function () {

        var searchQuery = self.newSearchText() || $(this).val();

        self.search.setQueryValue(self.search.queryProperty.search, searchQuery);
        self.search.setQueryValue(self.search.queryProperty.page, 1);
        self.search.updateResults();
    };

    self.shouldShowNextPrev = ko.computed(function () {
        if (self.paginationStyle() !== "nextprev") {
            return false;
        };
        if (self.totalPages() < 2) {
            return false;
        };
        if ($(window).width() < 1000) {
            return false;
        };
        return self.nextPrevToggle();
    });

    self.shouldInfiniteScroll = ko.computed(function () {
        if (self.pageIndex() >= self.totalPages()) {
            return false;
        };
        if (self.totalResults() < 1) {
            return false;
        };
        if (self.shouldShowNextPrev()) {
            return false;
        };
        return true;
    });

    self.ShowViewMore = ko.computed(function () {
        if (!self.shouldInfiniteScroll()) {
            return false;
        };
        if (self.totalPages() < 2) {
            return false;
        };
        if (self.pageIndex() >= self.totalPages()) {
            return false;
        };
        if (self.PagesScrolled() < 2 || self.PagesScrolled() % 3 !== 0) {
            return false;
        };
        if (!self.scrollerToggle()) {
            return false;
        };
        return true;
    });

    //If the page is an advanced search page, then don't show the results at the beginning unless a search term is defined.
    var ignoreUpdatesFrom = self.search.equalsQueryValue(self.search.queryProperty.pageType, "advanced", false, true)
        && !self.search.hasQueryValues([self.search.queryProperty.search, self.search.queryProperty.facet]) ? [self.search.updateRequestSender.pageLoad] : [];

    search.registerFinishedCallback(function (result, updateRequestSender) {
        self.totalPages(result.MetaData.PageTotal);
        self.totalResults(parseInt(result.MetaData.ResultsTotal));
        self.displayOnPage(result.MetaData.DisplayOnPage);
        self.resultsOnPage(result.MetaData.ResultsOnPage);
        self.resultsEndIndex(result.MetaData.ResultsEndIndex);
        self.paginationStyle(result.MetaData.PaginationStyle);
        self.pageIndex(result.MetaData.PageIndex);
        self.resultsBeginIndex(result.MetaData.ResultsBeginIndex);

        if (updateRequestSender !== "scroller") {
            self.PagesScrolled(1);
        }

        self.nextPrevToggle(true);
        self.scrollerToggle(true);
    }, ignoreUpdatesFrom);

    self.currentPage = ko.computed(function () {
        return self.pageIndex() > 1 ? self.pageIndex() : 1;
    });

    self.numResults = ko.computed(function () {
        return self.resultsOnPage() > 0 ? self.resultsOnPage() : 30;
    });

    self.maxPage = ko.computed(function () {
        return self.totalPages();
    });

    $(window).scroll(function () {
        if ($(window).height() + $(window).scrollTop() > (self.getDocumentHeight() - 100)) {
            self.tryScrollPage();
        }
    });
};

/**
 * Changes the page of results displayed on the page.
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.changePage = function (item, event) {
    var self = this;

    var numItem = event.target;
    var numberToShift = parseInt(numItem.getAttribute("data-grid-shift"), 10);
    var newPage = self.currentPage() + numberToShift;

    self.search.setQueryValue(self.search.queryProperty.page, newPage);
    self.search.updateResults(self.search.updateRequestSender.pagination);

};

/**
 * Changes the page of results to the first page.
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.moveFirst = function (item, event) {
    var self = this;

    if (self.currentPage() > 1) {
        self.search.setQueryValue(self.search.queryProperty.page, 1);
        self.search.updateResults(self.search.updateRequestSender.pagination);
    }
};


/**
 * Changes the results page to the next page
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.moveNext = function (item, event) {
    var self = this;

    if (self.currentPage() < self.maxPage()) {
        self.search.setQueryValue(self.search.queryProperty.page, parseInt(self.currentPage(), 10) + 1);
        self.search.updateResults(self.search.updateRequestSender.pagination);
    }
};

/**
 * Changes the results page to the next page
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.movePrevious = function (item, event) {
    var self = this;

    if (self.currentPage() > 1) {
        self.search.setQueryValue(self.search.queryProperty.page, parseInt(self.currentPage(), 10) - 1);
        self.search.updateResults(self.search.updateRequestSender.pagination);
    }
};


/**
 * Changes the results page to the next page
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.moveLast = function (item, event) {
    var self = this;

    if (self.currentPage() < self.maxPage()) {
        self.search.setQueryValue(self.search.queryProperty.page, self.maxPage());
        self.search.updateResults(self.search.updateRequestSender.pagination);
    }
};

/**
 * Will cause an infinite scroll load if that is appropriate
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.tryScrollPage = function (item, event) {
    var self = this;

    if (self.shouldInfiniteScroll() && self.PagesScrolled() % 3 !== 0 && self.scrollerToggle()) {
        //stop scroll event triggering while query is running
        self.scrollerToggle(false);

        var test = self.PagesScrolled();
        self.search.setQueryValue(self.search.queryProperty.page, parseInt(self.currentPage(), 10) + 1);
        self.search.updateResults(self.search.updateRequestSender.scroller);
        self.PagesScrolled(self.PagesScrolled() + 1);
    }
};

/**
 * Will always cause an infinte scroll load - for button event.
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.forceScrollPage = function (item, event) {
    var self = this;
    //stop scroll event triggering while query is running
    self.scrollerToggle(false);

    self.search.setQueryValue(self.search.queryProperty.page, parseInt(self.currentPage(), 10) + 1);
    self.search.updateResults(self.search.updateRequestSender.scroller);
    self.PagesScrolled(self.PagesScrolled() + 1);
};

/**
 * Changes the number of results displayed on the page.
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
PaginationVM.prototype.changeNumber = function (item, event) {
    var self = this;

    var numItem = event.target;
    var numberToShow = numItem.getAttribute("data-grid-num");

    self.search.setQueryValue(self.search.queryProperty.number, numberToShow);
    self.search.setQueryValue(self.search.queryProperty.page, 1);
    self.search.updateResults(self.search.updateRequestSender.numberOfResults);
};

/**
 * Determines the height of the current page.
 * @returns {double} 
 */
PaginationVM.prototype.getDocumentHeight = function () {
    return Math.max(
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
        Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    );
}
