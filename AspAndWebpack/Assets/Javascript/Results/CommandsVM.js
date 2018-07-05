/**
 * A view model to handle the grid's commands. This includes saving searches, creating rss feeds etc.
 * @param {Search} search - The class used for handling search related functions. 
 * @param {Function} selectedRecordsFn - A function used to retrieve the selected records within the results.
 *  Knockout observables are also functions.
 * */
var CommandsVM = function (search, options) {
    var self = this;

    self.options = $.extend({
        category: undefined,
        commandsType: undefined,
        selectedRecordsFn: function () { return [] },
        urlPrefix: ""
    }, options);

    self.search = search;
    self.getSelectedRecords = self.options.selectedRecordsFn;
    self.totalRecords = 0;
    self.notifyOnCompleteFunctions = [];
    self.recordsToCompile = [];
    self.recordsToExport = [];
    self.linkedRecordsToExport = [];
    self.GetVisibleMarkers = self.options.getVisibleMarkers;

    //If the page is an advanced search page, then don't show the results at the beginning unless a search term is defined.
    var ignoreUpdatesFrom = [];
    if (self.search != null) {
        ignoreUpdatesFrom = self.search.equalsQueryValue(self.search.queryProperty.pageType, "advanced", false, true) && !self.search.hasQueryValues([self.search.queryProperty.search, self.search.queryProperty.facet]) ? [self.search.updateRequestSender.pageLoad] : [];

        search.registerFinishedCallback(function (result) {
            self.totalRecords = result.MetaData.ResultsTotal;
        }, ignoreUpdatesFrom);
    }

    if (self.options.selectedRecordsFn != null && self.options.selectedRecordsFn !== undefined) {
        self.selectedRecords = ko.computed(function () {
            return self.getSelectedRecords();
        }, ignoreUpdatesFrom);
    }
}
    ;
/**
 * Save the search so it can be accessed later.
 */
CommandsVM.prototype.saveSearch = function (defaultName, searchIdToClone) {
    var self = this;
    self.loadPopup("Save Search", self.options.urlPrefix + "GridSaveSearch/SaveSearchForm", {
        isRss: false,
        defaultName: defaultName,
        idToClone: searchIdToClone
    }, self, function (form) {
    });
}
    ;
CommandsVM.prototype.submitSaveSearchRequest = function (formId, isRss) {
    var self = this;
    formId = '#' + formId;
    var $form = $(formId);

    var searchIdToCopy = $form.find("#hidSearchId").val();

    var isNewSave = $form.find('#radioNewSave').is(':checked');
    var data = {
        SearchQuery: self.search.calculateQueryString(),
        Description: $form.find("#taNewSearchDescription").val(),
        EmailFrequency: $form.find("#selEmailFrequency").val(),
        IsRss: isRss,
        IdToClone: searchIdToCopy
    }
    if (isNewSave) {
        data.Name = $form.find("#inpNewSavedSearch").val();
    } else {
        var $dropdown = $form.find("#selExistingSearches").find(":selected");
        data.ID = $dropdown.val();
        data.Name = $dropdown.text();
    }
    self.showLoadingPopup("Save Search");
    $.ajax({
        url: self.options.urlPrefix + "GridSaveSearch/Save",
        method: "POST",
        data: data,
        async: true
    }).done(function (data) {
        showPopup("Save Search", data);
        $('body').trigger('searchSaved');
    }).fail(function () {
        showPopup("Save Search", "Something has gone wrong!");
    });
};

/**
 * Compile all of the results, or just the ones selected.
 * @param {bool} compileAll - Whether or not to compile all records, or just the selected ones.
 * @param {string} historyId - A id of a history item to compile.
 */
CommandsVM.prototype.compileResults = function (compileAll, historyId) {

    var self = this;
    var w = window.open();

    if (historyId == null) {
        var numRecords = self.selectedRecords().length;

        if (self.options.commandsType === 'map') {
            numRecords = self.getSelectedRecords();
            self.recordsToCompile = [];
        }
        //If the user has not selected any records to compile, then compile all results for that search.
        else if (numRecords === 0 || compileAll) {
            numRecords = self.totalRecords;
            self.recordsToCompile = [];
        } else {
            self.recordsToCompile = self.selectedRecords();
        }
    }

    var categoryUrl = window.location.pathname.substring(1, window.location.pathname.lastIndexOf("/"));
    var message = "Compiling....Please wait.";
    var qm = ShowInfo(message);
    var query = self.search == null ? "" : self.search.calculateQueryString();

    $.ajax({
        url: "/" + categoryUrl + "/RegisterCompile",
        method: "POST",
        data: {
            HistoryId: historyId,
            CompileIds: self.recordsToCompile,
            SearchCategory: categoryUrl,
            SearchQuery: query
        },
        traditional: true,
        async: true,
        cache: false
    })
        .done(function (data) {
            if (data !== "" && data !== -1) {
                w.document.location = "/" + categoryUrl + "/Compile/" + data + "?from=Register"
                w.focus();
            }
            else {
                showPopup("Compile", "Something has gone wrong getting data!");
            }
        })
        .fail(function () {
            showPopup("Compile", "Something has gone wrong!");
        });

    $(':focus').blur();
    qm.hide();

    return false;
};

/**
 * Export all of the results, or just the ones selected.
 * @param {bool} exportAll - Whether or not to export all records, or just the selected ones.
 */
CommandsVM.prototype.exportResults = function (exportAll) {

    var self = this;
    var numRecords = self.selectedRecords().length;

    if (self.options.commandsType === 'map') {
        numRecords = self.getSelectedRecords();
        self.recordsToExport = [];
    }

    if (self.options.commandsType === "mapHidden") {
        numRecords = self.getSelectedRecords();
        self.linkedRecordsToExport = self.GetVisibleMarkers();
    }
    //If the user has not selected any records to export, then export all results for that search.
    else if (numRecords === 0 || exportAll) {
        numRecords = self.totalRecords;
        self.recordsToExport = [];
    } else {
        self.recordsToExport = self.selectedRecords();
    }

    var url = "FileExport/ExportResultsForm";

    if (self.options.category) {
        url = "/" + self.options.category + "/" + url;
    }

    self.loadPopup("Export", url, {
        numberOfItems: numRecords
    }, self);
};

/**
 * Process and validate the export request form. Then submit the request.
 * @param {string} formId - The identification name for the form.
 */
CommandsVM.prototype.submitExportRequest = function (formId) {
    var self = this;
    formId = "#" + formId;

    function getCheckedRadioValue(name) {
        var elements = document.getElementsByName(name);
        for (var i = 0, len = elements.length; i < len; ++i)
            if (elements[i].checked)
                return elements[i].value;
        return null;
    };

    var exportFormat = $("#selExportFormat", formId).val();
    var exportMethod = getCheckedRadioValue("exportMethodsGroup");
    var filename = $("#inpExportAs", formId).val();

    var url = "FileExport/ExportRecords";
    var downloadUrl = "Download/Generated/{id}";

    if (self.options.category) {
        url = "/" + self.options.category + "/" + url;
        downloadUrl = "/" + self.options.category + "/" + downloadUrl;
    }

    Export.exportRecords({
        ids: self.recordsToExport,
        linkIds: self.linkedRecordsToExport,
        url: url,
        downloadUrl: downloadUrl,
        exportMethod: exportMethod,
        exportFormat: exportFormat,
        saveAsFilename: filename,
        searchQuery: self.search.calculateQueryString(),

        done: function () {
            for (var i = 0; i < self.notifyOnCompleteFunctions.length; i++) {
                self.notifyOnCompleteFunctions[i]();
            }
        }
    });
};

/**
 * Create an RSS feed for the current search.
 */
CommandsVM.prototype.saveRssFeed = function () {
    var self = this;
    self.loadPopup("RSS",
        self.options.urlPrefix + "GridSaveSearch/SaveSearchForm",
        {
            isRss: true
        },
        self,
        function (form) {
        });
};
/**
 * Launch a popup on the page populated with the given url.
 * @param {string} title - The title to appear in the popup.
 * @param {string} url - The url used to fetch the content of the popup.
 * @param {object} data - The parameters to send to the url.
 * @param {object} viewModel - A view model to apply to the popup. 
 * @param {Function} closeCallback - A function that will be called once the popup has been closed by any means [Optional].
 */
CommandsVM.prototype.loadPopup = function (title, url, data, viewModel, closeCallback) {
    var self = this;
    closeCallback = closeCallback || function () { };
    data = data || {};
    self.showLoadingPopup(title);
    $.ajax({
        url: url,
        method: "GET",
        data: data,
        async: true
    })
        .done(function (data) {
            showPopup(title,
                data,
                viewModel,
                function (modalBody) {
                    closeCallback(modalBody);
                });
        })
        .fail(function () {
            showPopup(title, "Something has gone wrong!");
        });
};
/**
 * Displays a loading animation in a popup.
 * @param {string} title - The title to display.
 */
CommandsVM.prototype.showLoadingPopup = function (title) {
    showPopup(title, "<div style='height:100px'><span class='loading' /></div>");
};
