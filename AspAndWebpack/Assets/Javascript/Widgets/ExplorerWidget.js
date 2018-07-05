var ExplorerWidgetVM = function (options) {
    var self = this;

    self.options = $.extend({
        category: undefined
    }, options);

    self.isLoading = ko.observable(false);
    self.selectedSubject = ko.observable();
    self.selectedSubjectGroup = ko.observable();
    self.dashboardSubject = null;
    self.subjects = ko.observableArray([]);
    self.selectedSubject.subscribe(self.subjectChanged.bind(self));
    self.selectedSubjectGroup.subscribe(self.subjectGroupChanged.bind(self));
};

if (typeof WidgetBase === 'function') {
    ExplorerWidgetVM.prototype = new WidgetBase();
}

ExplorerWidgetVM.prototype.onWidgetLoaded = function (vm) {
    var self = this;
    self.dashboardSubject = vm.currentItem();
};

ExplorerWidgetVM.prototype.subjectChanged = function (newValue) {
    var self = this;

    if (newValue && newValue.length > 0 && self.options.category) {
        self.isLoading(true);

        location.href = "/" + self.options.category + "/explore/" + newValue;
    }
};

ExplorerWidgetVM.prototype.subjectGroupChanged = function (newValue) {
    var self = this;

    if (newValue && newValue.length > 0 && self.options.category) {
        self.isLoading(true);
        self.loadSubjects(newValue);
    }
};

ExplorerWidgetVM.prototype.goToExplorerPage = function () {
    var self = this;

    self.isLoading(true);
    location.href = "/" + self.options.category + "/search";
};

ExplorerWidgetVM.prototype.loadSubjects = function (group) {
    var self = this;

    if (group) {
        $.get("/" + self.options.category + "/getGroupSubjects?subjectGroup=" + group)
            .done(function (data) {
                self.subjects(data);
                self.isLoading(false);
            }).fail(function (error) { self.isLoading(false); });
    }
};