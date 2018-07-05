/**
 * A function view model to handle changes within a results view.
 * @param {string} containerId - The container which the view model is applied to.
 * @param {string} queryString - The search query string.
 */
var GridVM = function (search) {

    var self = this;
    self.search = search;
    self.empty = false;

    self.isAppending = ko.observable(false);
    self.empty = ko.observable(false);
    self.isLoading = ko.observable(false);
    self.selectedRecords = ko.observableArray([]);

    // needed so that you can use the grid without the results js.
    self.sortVM = new SortVM(search);

    self.resultsBodyHtml = ko.observable("");

    self.templateName = ko.observable("");

    //If the page is an advanced search page, then don't show the results at the beginning unless a search term is defined.
    var isAdvancedPage = self.search.equalsQueryValue(self.search.queryProperty.pageType, "advanced", false, true)
        && !self.search.hasQueryValues([self.search.queryProperty.search, self.search.queryProperty.facet]);

    var ignoreUpdatesFrom = isAdvancedPage ? [self.search.updateRequestSender.pageLoad] : [];

    self.showAdvancedSearchMessage = ko.observable(isAdvancedPage);

    self.registerCallbacks(search, ignoreUpdatesFrom);

    self.isLoading.subscribe(self.setDimmerWidth);

    self.fixHeader();

    self.resultsBodyHtml.subscribe(function () { window.setTimeout(self.fixHeader.bind(self)); });

    window.addEventListener('scroll', self.onScroll.bind(self));

    $(window).on('resize', resizeThrottler);

    var resizeTimeout;
    function resizeThrottler() {
        // ignore resize events as long as an actualResizeHandler execution is in the queue
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(function () {
                resizeTimeout = null;
                self.fixHeader();
                // The actualResizeHandler will execute at a rate of 15fps
            }, 66);
        }
    }

};

GridVM.prototype.registerCallbacks = function (search, ignoreUpdatesFrom) {
    var self = this;
    search.registerStartCallback(function (updateRequestSender) {

        if (updateRequestSender === "scroller") {
            self.isAppending(true);
        } else {
            self.isLoading(true);
        }

    }, ignoreUpdatesFrom);

    search.registerFinishedCallback(function (result, updateRequestSender) {

        //if infinite scroller, do not reload whole thing
        if (updateRequestSender === search.updateRequestSender.scroller) {
            self.isAppending(true);
            self.appendToContent(result.ResultsView.View);
            self.isAppending(false);
        } else if (updateRequestSender === search.updateRequestSender.pagination) {
            self.constructResults(result.ResultsView);
            self.isLoading(false);
        } else {
            self.selectedRecords([]);
            self.constructResults(result.ResultsView);
            self.isLoading(false);
        }

        if (self.showAdvancedSearchMessage()) {
            self.showAdvancedSearchMessage(false);
        }

        //Create the image popups for the grid.
        HookupImagePopup("#resultsGrid .thumbnail", "a");

        //Set up bookmark links for each result item.
        $(".bookmark").tipsy({
            gravity: 'sw',
            fade: true
        });

        $(".tooltip").tipsy({ gravity: 'sw', fade: true });
        $(".share").tipsy({ gravity: 'sw', fade: true });

    }, ignoreUpdatesFrom);

    search.registerErrorCallback(function (result, updateRequestSender) {
        self.isLoading(false);
    }, ignoreUpdatesFrom);
};

/**
 * Graphically adds results to the end of the existing results.
 * @param {html} appendResult - The html to append.
 */
GridVM.prototype.appendToContent = function (appendResult) {
    var self = this;

    var originalBody = self.resultsBodyHtml();
    var newBody = originalBody

    if (newBody.indexOf("<!--SCROLL-APPEND-->") > -1)
    {
        newBody = newBody.replace("<!--SCROLL-APPEND-->", appendResult);
    }
    else
    {
        newBody = newBody + appendResult;
    }

    self.resultsBodyHtml(newBody);
}

/**
 * Formats the results into the correct html format.
 * @param {html} resultsView - The results in an html format.
 */
GridVM.prototype.constructResults = function (resultsView) {

    var self = this;

    if (resultsView.ResultsViewName) {
        self.templateName(resultsView.ResultsViewName.toLowerCase());
    } else {
        self.templateName("");
    }

    if (resultsView.View) {
        self.resultsBodyHtml(resultsView.View);
    } else {
        self.resultsBodyHtml("");
    }
};

/**
 * Apply a search term ("q") to the search and update the results.
 * @param {string} searchTerm - The string to apply to the search.
 */
GridVM.prototype.applySearchTerm = function (searchTerm) {
    var self = this;

    self.search.setQueryValue(self.search.queryProperty.search, searchTerm);
    self.search.updateResults();
};

/**
 * On Click inline filter, pass the filter to the search.
 * @param {bool} include - indicating whether to include or exclude the value
 * @param {Object} self - this object
 * @param {Object} e - event object
 */
GridVM.prototype.inlineFilter = function (include, self, e) {
    var cell = $(e.target).parents('[data-filter]');
    var idx = cell.attr('data-filter').toUpperCase() + (include?'':'!!');
    var val = cell.text().replace(/ +Filter */, '');
    vm.facetsVM.applyFacet(idx, val);
};

/**
 * On hover/focus inline filter, show tooltip, highlight change.
 * @param {bool} show - indicating whether the event is in or out.
 * @param {bool} include - indicating whether to include or exclude the value
 * @param {Object} self - this object
 * @param {Object} e - event object
 */
GridVM.prototype.indicateFilter = function (show, include, self, e) {
    var target = $(e.target);
    var cell = target.parents('[data-filter]');
    var idx = cell.attr('data-filter').toUpperCase();
    var value = cell.text();
    var style = include ? 'success' : 'danger';

    var btnGroup = target.closest('.btn-group').toggleClass('active', show);

    var btn = target.closest('button');
    if (!btn.tipsy(true)) {
        btn.tipsy({ trigger: 'manual', aria: true, fade: true });
    }
    btn.tipsy(show ? 'show' : 'hide');
    $('td[data-filter="' + idx + '"]:contains(' + value + ')').css({ transition: 'background-color 0.3s ease 0.3s' }).toggleClass(style, show);
    if (!show) {
        window.setTimeout(function () { $('td[data-filter="' + idx + '"]:contains(' + value + ')').css({ transition: '' }); btnGroup.css('opacity', ''); }, 600);
    }
    return false;
};

/**
 * When the loading dimmer is shown, ensure it covers the entire data table
 * @param {bool} loading - indicating whether the grid is loading or out.
 */
GridVM.prototype.setDimmerWidth = function (loading) {
    var dimmer = $('.resultsContainer ~ .loading.dimmer');
    if (!dimmer.length) return;

    if (!loading) {
        dimmer.css('width', '');
        return;
    }
    var currentWidth = dimmer.width();
    var width = $('#resultsGrid > table').width() || '';
    if (!width || !dimmer[0].style.setProperty || width < currentWidth) return;

    dimmer[0].style.setProperty('width', width + 'px', 'important');
};

/**
 * Copy the table header and fix it for the scroll.
 */
GridVM.prototype.fixHeader = function () {
    var self = this;
    var $baseTable = $('#resultsGrid > table');
    var $head = $baseTable.children('thead');

    var $table = $('<table class="table"></table>');

    var $dupHead = $head.clone(true, true);

    if (self.$fixedHead && self.$fixedHead.length) {
        self.$fixedHead.remove();
    }

    self.$fixedHead = $table;
    self.fixedPos = $head.offset() || { left: 0 };
    $table.attr('class', $baseTable.attr('class'));

    $table.hide();
    $table.append($dupHead);
    $('body').append($table);
    var $td = $dupHead.find('tr').first().children()
    var $th = $baseTable.find('tr').first().children();
    for (var i = 0; i < $th.length; i++) {
        $td.eq(i).width($th.eq(i).width());
    }

    var top;

    if ($("body").hasClass('skipoptions-show')) {
        // if skip options does appear
        top = 32;
    }
    else {
        // if skip options does not appear
        top = 0;
    }

    $table.css({
        position: 'fixed',
        top: top,
        left: self.fixedPos.left,
        background: 'white',
        width: $head.width(),
        height: $head.height()
    });

    self.onScroll();
};

/**
 * Window scroll event handler. 
 */
GridVM.prototype.onScroll = function () {
    var $resultTable = $('#resultsGrid > table');
    var $head = $resultTable.children('thead');
    var $cell = $resultTable.find("th");

    var offset;

    if ($("body").hasClass('skipoptions-show')) {
        // if skip options does appear
        offset = 32;
    }
    else {
        // if skip options does not appear
        offset = 0;
    }

    if (!this.fixedPos.top || window.pageYOffset < this.fixedPos.top - offset) {
        this.$fixedHead.hide();
        $head.css({ "visibility": "visible" });
        $cell.css({ "border-bottom": "2px solid #ccc" });
        return;
    }
    else {
        $head.css({ "visibility": "hidden" });
        $cell.css({ "border": "none" });
    }

    this.$fixedHead.css({
        transform: 'translateX(-' + window.pageXOffset + 'px)'
    }).show();
};

/**
 * Clear the GUI.
 */
GridVM.prototype.clear = function() {
    var self = this;
    self.resultsBodyHtml("");
};

window._ = window._ || {};
