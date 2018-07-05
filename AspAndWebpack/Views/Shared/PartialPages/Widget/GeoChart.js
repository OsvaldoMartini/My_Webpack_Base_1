


var GeoMap = function (geoMapDiv, selectEvent) {
    var self = this;
    self.geoMapDiv = geoMapDiv;
    self.timePeriod = 0;
    self.selectedRegion = 'world';

    if (selectEvent != undefined) {
        self.selectEvent = selectEvent;
    }

    var loader = new DynamicLoader();
    loader.loadScript("https://www.gstatic.com/charts/loader.js")
        .success(function () {
            var selfReassigned = self;
            try {
                google.charts.load(
                'current',
                {
                    'packages': ['table', 'map', 'corechart'],
                    callback: function () {
                        var self = selfReassigned;
                        self.initialise();
                    }
                });
            } catch (error) {
                self.onError(error);
            }
            
        })
        .fail(function (data) {
            self.onError(data);
        });
};


if (typeof WidgetBase === 'function') {
    GeoMap.prototype = new WidgetBase();
}

GeoMap.prototype.onDashboardResize = function() {
    if ($('#' + this.geoMapDiv).length)
        this.PopulateGeoMap(this.selectedRegion);
};

GeoMap.prototype.initialise = function () {
    var self = this;

    $(".geoMapRegionSelect", '#' + self.geoMapDiv)
        .change(function () {
            self.PopulateGeoMap($(this).val());
        });

    $(".geoMapPubPeriod", '#' + self.geoMapDiv)
        .change(function () {
            self.loadMap($(this).val(), $(".geoMapRegionSelect", '#' + self.geoMapDiv).val());
        });

    self.loadMap(0);
}

/// fetches the geomap data and converts it to a googe DataTable
GeoMap.prototype.loadMap = function(timePeriod, selectedRegion) {
    var self = this;

    $.ajax("/Janes/GeoMap",
        {
            data: { period: timePeriod },
            timeout: 20000
        })
        .done(function(data) {
            self.timePeriod = timePeriod;
            self.dataTable = self.ParseChartData(data);
            self.PopulateGeoMap(selectedRegion || "world");
            $('#' + self.geoMapDiv + ' .geomapLoading').hide();
        })
        .fail(function(jqXhr, textStatus) {
            $('#' + self.geoMapDiv + ' .geochart').html("Currently unable to fetch geomap");
            $('#' + self.geoMapDiv + ' .geomapLoading').hide();
        });
};

GeoMap.prototype.PopulateGeoMap = function(selectedRegion) {
    var self = this;
    self.selectedRegion = selectedRegion;

    var geoDiv = $('#' + self.geoMapDiv + ' .geochart');

    var chartHeight = geoDiv.height();
    if (chartHeight === 0) {
        chartHeight = 300;
    }

    var options = {
        displayMode: 'region',
        backgroundColor: { fill: '#FEFEFE' },
        width: geoDiv.width(),
        height: chartHeight,
        colorAxis: { colors: ['#7AADFF', '#1A3EA7'] },
        region: selectedRegion
    };

    try {
        var chart = new google.visualization.GeoChart(geoDiv[0]);

        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem && self.selectEvent != undefined) {
                var topping = self.dataTable.getValue(selectedItem.row, 0);
                self.selectEvent(topping, self.timePeriod);
            }
        }

        google.visualization.events.addListener(chart, 'select', selectHandler);
        if (self.dataTable) {
            chart.draw(self.dataTable, options);
        }
        
    } catch (error) {
        self.onError(error);
    }
    
};

GeoMap.prototype.ParseChartData = function (data) {
    try {
        var chartDataTable = new google.visualization.DataTable();
        chartDataTable.addColumn('string', 'Location');
        chartDataTable.addColumn('number', 'Count');

        var dataRows = data.split("|");

        for (var i = 0; i < dataRows.length; i++) {
            var dataColumn = dataRows[i].split("=");

            if (dataColumn[0] != null && dataColumn[0] != "") {
                chartDataTable.addRow([dataColumn[0], Number(dataColumn[1])]);
            }
        }

        return chartDataTable;

    } catch (error) {
        self.onError(error);
    }
    return null;
};

/**
 * Handles the error, supresses the widget and Logs (if enabled)
 * @param {} error  
 */
GeoMap.prototype.onError = function (error) {
    var self = this;
    try {
        if (typeof CMP.Utils.ErrorLogging !== "undefined") {
            CMP.Utils.ErrorLogging.logError("Problem with GeoChart " + error, "GeoChart.js");
        }
        $("#" + self.geoMapDiv).closest(".widget").hide();
    } catch (error) {
       // ignore
    }
};