var CountryRisk = function() {

    var self = this;

    self.chart = null;

    self.options = {
        chart: {
            renderTo: 'countryRiskChart',
            type: 'line'
        },
        title: { text: null },
        xAxis: {
            type: 'datetime',
            title: { text: 'Date' }
        },
        yAxis: {
            title: { text: 'Risk Rating' }
        },
        exporting: { enabled: false },
        series: null,
        credits: false
    };
};

//Inherit from WidgetBase
if (typeof WidgetBase === 'function') {
    CountryRisk.prototype = new WidgetBase();
}

CountryRisk.prototype.populateChart = function (data) {
    var self = this;
    if (data !== undefined) {
        self.options.series = data;
    }
    self.chart = new Highcharts.Chart(self.options);
};

CountryRisk.prototype.onDashboardResize = function () {
};

CountryRisk.prototype.exportChart = function (data) {
    var chart = this.chart;

    var exportType = data.exportType || data;

    exportType = exportType.toUpperCase();

    var fileType = {
        PDF: 'application/pdf',
        JPEG: 'image/jpeg',
        JPG: 'image/jpeg',
        PNG: 'image/png',
        SVG: 'image/svg+xml'
    };

    chart.exportChart({
        type: fileType[exportType] || 'image/png',
        filename: 'chart'
    });

};

CountryRisk.prototype.printChart = function () {
    var chart = this.chart;
    chart.print();
};