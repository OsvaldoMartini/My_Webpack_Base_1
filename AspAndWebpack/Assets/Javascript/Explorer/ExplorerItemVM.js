window.Explorer = window.Explorer || {};

/**
 * A view model to represent an individual item within the explorer tree. 
 * More details about it are discovered upon instantiation.
 * @param {string} recordId - The ID of the record that the node represents.
 * @param {string} name - The friendly name of the item. This will be displayed as the title.
 */
Explorer.ExplorerItemVM = function (recordId, name) {

    // PROPERTIES
    var self = this;
    self.recordId = recordId;
    self.name = name;

    // BINDABLE PROPERTIES
    self.title = ko.observable(name);
    self.detailsHtml = ko.observable("<div class='loading' />");
    self.newsHtml = ko.observable("");
    self.isVisible = ko.observable((self.recordId && self.name) ? true : false);

    // REZISE PROPERTITES
    self.isFullScreen = ko.observable(false);

    if (self.recordId && self.name) {
        self.populate();
    }
};

/**
 * Retrieve and populate the content.
 */
Explorer.ExplorerItemVM.prototype.populate = function () {
    var self = this;

    showCustomPopup({
        title: self.name,
        contentUrl: "../getExplorerItemContent",
        contentUrlData: {
            uid: self.recordId,
            name: self.name
        },
        draggableOptions: {
            handle: ".modal-header"
        },
        expandable: {

        },
        modalOptions: {
            backdrop: false
        }
    });

    //self.getDetails(function(result) {
    //    self.detailsHtml(result);
    //});
};

/**
 * Retrieve the details about the item.
 * @param {Function} callback - A function that will be called once the operation has completed.
 */
Explorer.ExplorerItemVM.prototype.getDetails = function (callback) {
    var self = this;
    $.get("../getExplorerItemContent?uid=" + self.recordId + "&name=" + self.name)
        .done(function (result) {
            callback(result);
        });
};

Explorer.ExplorerItemVM.prototype.resizeExplorerItem = function () {
    var self = this;

    var isFullScreen = self.isFullScreen();
    self.isFullScreen(!isFullScreen);
};