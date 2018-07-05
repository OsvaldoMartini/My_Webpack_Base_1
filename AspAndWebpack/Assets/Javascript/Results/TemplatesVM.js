/**
 * A view model to handle the grid's templates. Will not apply a query value when a template is selected as it is handled by user settings.
 * @param {Search} search - The class used for handling search related funcitons. 
 */
var TemplatesVM = function (search) {
    var self = this;

    self.search = search;
    self.template = ko.observable(0);

    //If the page is an advanced search page, then don't show the results at the beginning unless a search term is defined.
    var ignoreUpdatesFrom = self.search.equalsQueryValue(self.search.queryProperty.pageType, "advanced", false, true)
        && !self.search.hasQueryValues([self.search.queryProperty.search, self.search.queryProperty.facet]) ? [self.search.updateRequestSender.pageLoad] : [];

    search.registerFinishedCallback(function(result) {
        self.template(result.ResultsView.ResultsViewName);
    }, ignoreUpdatesFrom);
};

/**
 * Applies a specific template to the search results grid. e.g. Grid, Story, Thumbnail etc.
 * @param {object} item - The item that is bound to the UI element.
 * @param {event} event - The UI click event.
 */
TemplatesVM.prototype.applyTemplate = function (item, event) {
    var self = this;

    var template = event.target;
    var templateName = template.getAttribute("data-grid-template");
    var url = "search/ChangeTemplate?templateName=" + templateName;

    $.get(url, function () {
        self.search.setQueryValue(self.search.queryProperty.page, 1);
        self.search.updateResults(self.search.updateRequestSender.template);
    });
};

/**
 * Launches a page allowing the user to manipulate their custom views.
 */
TemplatesVM.prototype.editCustomView = function() {

    var self = this;

    self.showLoadingPopup("Custom View");

    $.ajax({
        url: "CustomView/Form",
        method: "GET",
        async: true
    }).done(function(data) {
        showPopup("Custom View", data, self, function() {
            self.search.updateResults();
        });
    }).fail(function() {
        showPopup("Custom View", "Something has gone wrong!");
    });
};

/**
 * Displays a loading animation in a popup.
 * @param {string} title - The title to display.
 */
TemplatesVM.prototype.showLoadingPopup = function (title) {
    showPopup(title, "<div style='height:100px'><span class='loading' /></div>");
};
