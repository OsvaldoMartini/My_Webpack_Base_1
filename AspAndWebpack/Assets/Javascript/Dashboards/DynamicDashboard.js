
var dynamicDashboardSetup = function (Dashboard) {
    Dashboard.dashboardVM.setupSubjectChange(true);

    $.getJSON("/TerrorismInsurgencyCentre/GetCountries").done(function (data) {
        var countries = [new CountryVM()];
        for (var country in data) {
            if (data.hasOwnProperty(country)) {
                countries.push(new CountryVM(data[country].Key, data[country].Value, Dashboard.dashboardVM.commands.baseUrl));
            }
        }
        Dashboard.dashboardVM.subjectList(countries);
    });
};

var CountryVM = function (country, code, linkFormat) {
    var self = this;
    self.name = country || '';
    self.link = (linkFormat || '').replace(/\{0\}/, country);
    self.code = code;
    self.subject = code ? country : '';
    self.icon = code ? "flag-icon-" + code.toLowerCase() : '';

};
CountryVM.prototype.toString = function () { return this.name; };
