var LinkListWidgetExportableVM = function (containerId, links) {
    var self = this;

    self.containerId = containerId;
    self.$container = $("#" + containerId);

    self.exportFormat = ko.observable("word");
    self.exportCategory = "MAINSEARCH"; //use the url friendly category key.
    self.exportFilename = "IHS Janes";

    for (var i = 0; i < links.length; i++) {
        var p = links[i];
        p.isSelected = ko.observable(p.isSelected);
    }

    self.links = ko.observableArray(links || []);

    self.exportableLinks = ko.computed(function () {
        return self.links().filter(function (p) {
            return p.isExportable && p.isAuthorised;
        });
    });

    self.isAllSelected = ko.computed(function () {
        var selectedLinks = self.exportableLinks().filter(function (p) {
            return p.isSelected();
        });

        return selectedLinks.length === self.exportableLinks().length;
    });

    self.anyChosen = ko.computed(function () {
        var selectedLinks = self.exportableLinks().filter(function (p) {
            return p.isSelected();
        });

        return selectedLinks.length > 0;
    });

};

//Inherit from WidgetBase
if (typeof WidgetBase === 'function') {
    LinkListWidgetExportableVM.prototype = new WidgetBase();
}

LinkListWidgetExportableVM.prototype.showExportForm = function (options) {
    var self = this;
    self.exportCategory = options.exportCategory || "MAINSEARCH";
    self.exportFilename = options.exportFilename || "IHS Janes";
    self.from = options.from || "";
    var form = self.$container.find(".export-form").html();
    window.showPopup("Export", form, self);
};

LinkListWidgetExportableVM.prototype.showExportFormAll = function (exportCategory, exportFileName, from) {
    var self = this;

    var links = self.exportableLinks();

    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.isSelected(true);
    }

    self.showExportForm({
        exportCategory: exportCategory,
        exportFilename: exportFileName,
        from: from
    });
};

LinkListWidgetExportableVM.prototype.submitExportRequest = function () {
    var self = this;
    window.Export.exportRecords({
        ids: self.exportableLinks().filter(function (p) { return p.isSelected(); }).map(function (p) { return p.id }),
        category: self.exportCategory,
        exportFormat: self.exportFormat(),
        saveAsFilename: self.exportFilename,
        from: self.from
    });
};

LinkListWidgetExportableVM.prototype.selectAll = function (item, event) {
    var self = this;

    var isChecked = $(event.target).is(':checked');

    ko.utils.arrayForEach(self.exportableLinks(), function (p) {
        p.isSelected(isChecked);
    });

    return true;
};