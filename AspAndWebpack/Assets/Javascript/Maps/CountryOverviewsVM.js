var CountryOverviewsVM = function (options) {

    var self = this;

    self.options = $.extend({}, {
        modalId: undefined
    }, options);

    self.countries = ko.observableArray([]);
    self.selectedCountry = ko.observable();

    self.countryProfileHtml = ko.observable("");
    self.countryRiskHtml = ko.observable("");
    self.countryInventoriesHtml = ko.observable("");
    self.countryRiskVM = ko.observable();
    self.flagClass = ko.computed(function () {
        var country = self.selectedCountry();
        return country !== undefined && country !== null && country.Iso3166A2Code ?
            "flag-icon flag-icon-" + country.Iso3166A2Code.toLowerCase() : "hidden";
    });

    self.selectedCountry.subscribe(function (country) {

        if (country !== undefined && country !== null) {
            self.loadCountryOverview(country);
        } else {
            closePopup(self.options.modalId);
        }
    });

    self.exportUrl = ko.computed(function () {
        var pos = Object.keys(window.Enum.RestDataVersion).length || 0;
        var apiVersion = Object.keys(window.Enum.RestDataVersion)[pos - 1] || "V1";
        return "/api/" + apiVersion + "/Inventories/items/";
    });
    self.maxItems = ko.computed(function () {
        return 300;
    });
    self.exportCsv = ko.computed(function () {
        var country = (self.selectedCountry()) ? self.selectedCountry().Name : "";
        return self.exportUrl() + "csv?f=OperatorCountry(" + country + ")%3Cand%3EEnvironment(Land||air)&num=" + self.maxItems();
    });
    self.exportExcel = ko.computed(function () {
        var country = (self.selectedCountry()) ? self.selectedCountry().Name : "";
        return self.exportUrl() + "xlsx?f=OperatorCountry(" + country + ")%3Cand%3EEnvironment(Land||air)&num=" + self.maxItems();
    });

    window.PostOffice.receive("NewCountryRisk", function (countryRisk) {
        self.countryRiskVM(countryRisk);
    });

    self.tab = ko.observable('');

    window.PostOffice.receive("CountryOverview", function (args) {
        if (!Array.isArray(args)) args = [args];

        var countrySearch = args[0];
        var tab = args[1] || '';

        var country = self.countries().filter(function (country) {
            return country.Name == countrySearch || country.DisplayName == countrySearch || (country.Synonyms || []).indexOf(countrySearch) > -1;
        });
        if (!country.length) {
            return;
        }

        self.selectedCountry(country[0]);
        if (tab) self.tab(tab);
    });

    self.populateCountries();
};

CountryOverviewsVM.prototype.populateCountries = function () {
    var self = this;

    $.get("Country/GetCountries", function (data) {
        data.sort(function (a, b) {
            var aName = a.DisplayName || a.Name;
            var bName = b.DisplayName || b.Name;
            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
        });

        self.countries(data);
    });
};

CountryOverviewsVM.prototype.loadCountryOverview = function (country) {
    var self = this;

    showCustomPopup({
        modalId: self.options.modalId,
        title: "Country Overview",
        contentUrl: "Country/Overview",
        contentUrlData: { country: country.Id },
        viewModel: self,
        modalOptions: {
            backdrop: false
        },
        draggableOptions: {
            handle: ".modal-header",
            stop: function (e) {
                $(e.target).css({
                    bottom: 'auto', right: 'auto'
                });
            }
        },
        closeCallback: function () {
            // Set select option to default value
            $("#mapToolbar select.chosenselect").val($("#mapToolbar select.chosenselect option:first").val());
            $("#mapToolbar select.chosenselect").trigger('chosen:updated');
        },
        openCallback: function () {
            // Make sure that the modal is being rendered on screen... IE11 issue (DE98558)
            $("#" + self.options.modalId).css({ top: "25%", right: "50%" });

            $(document).off('focusin.modal');
        }
    });

    self.loadCountryProfile(country);
    self.loadCountryRisk(country);
    self.loadCountryInventories(country);
};

CountryOverviewsVM.prototype.loadCountryProfile = function (country) {
    var self = this;

    self.countryProfileHtml("");
    $.get("Country/Profile", { country: country.Id }, function (data) {
        self.countryProfileHtml(data);
    });
};

CountryOverviewsVM.prototype.loadCountryRisk = function (country) {
    var self = this;

    self.countryRiskHtml("");
    self.countryRiskVM(undefined);
    $.get("Country/Risk", { country: country.Id }, function (data) {
        self.countryRiskHtml(data);
    });
};

CountryOverviewsVM.prototype.loadCountryInventories = function (country) {
    var self = this;

    self.countryInventoriesHtml("");
    $.get("Country/Inventories", { country: country.Id }, function (data) {
        self.countryInventoriesHtml(data);
    });
};