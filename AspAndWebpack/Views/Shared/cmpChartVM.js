
/**
 * A function view to handle a simple cmp hichart.
 * @param {string} containerId - The container which the view model is applied to.
 * @param {string} search - the search object to use to handle events etc.
 * @param {string} querystring - the querystring object to get the request.
 * @param {string} chartdivId - the targetId of the div to create.
 * @param {string} chartAreaId - the area of the chart config.
 * @param {string} appendQueryString - anything to append to the querystring before the get results request.
 * @param {string} warnThatSeriesAreGrouped - a numeric value to warn users where more series are in the chart and have been grouped
 */
var pendingChartRequests = []; // list of current requests so we can cancel them if required.
var cmpChartVM = function (containerId, querystring, search, chartdivId, chartAreaId, catKey, appendQueryString) {
    var self = this;
    self.search = search;
    self.querystring = querystring;
    self.chartdivId = "chart_div" + new Date().getTime();
    // The wrapper
    self.chartMainDivId = "chart_main_div" + self.chartdivId;
    self.chartDataTableDiv = self.chartdivId + "DataTable";
    self.chartAreaId = chartAreaId;
    self.catKey = catKey;
    self.appendQueryString = appendQueryString;
    self.warnThatSeriesAreGrouped = 0;
};

cmpChartVM.prototype.RegisterUrlReview = function (callback) {
    var self = this;
    self.RegisterUrlReviewCallback = callback;
};

/**
 * Set up a callback for the occaision when an empty chart object is returned.
 * @param {function} callback - the callback function to be executed when an empty chart object is returned.
 */
cmpChartVM.prototype.RegisterChartFail = function (callback) {
    var self = this;
    self.RegisterChartFailCallback = callback;
};


/**
 * Forces the chart to redraw, without re-requesting the data.
 */
cmpChartVM.prototype.Reflow = function () {
    if (self === window) {
        self = this;
    }
    var c1 = $('#' + self.chartdivId);
    c1.highcharts().reflow();
};

/**
    Update the chart via a new call to the server.
*/
cmpChartVM.prototype.UpdateChart = function (searchQuery, breadcrumbstring, baseUrl, completionFunction) {
    var self = this;
    //Get the current url
    var url = (baseUrl || "Chart/GetResults") + "?cid=" + encodeURIComponent(self.chartAreaId) + "&".concat(self.search.calculateQueryString(), searchQuery);

    if (self.RegisterUrlReviewCallback) {
        url = self.RegisterUrlReviewCallback(url);
    }
    //indicate the chart is busy
    $('#' + self.chartdivId).css("opacity", "0.3");
    //get results
    var req = $.get2(url, function (result) {
        $('#' + self.chartdivId).css("opacity", "1");
        if (!result.ChartModel.Data) {
            if (self.RegisterChartFailCallback) {
                self.RegisterChartFailCallback(result);
            }
            return;
        }
        var obj = JSON.parse(result.ChartModel.Data);

        // update the pie to reflect the right data for the new calls getchart2 types
        if (obj.series.length > 0 && obj.series[0].type && obj.series[0].type == "pie") {
            var total = 0;
            if (obj.series[0].data[0].length == 1) {
                _.each(obj.xAxis[0].categories, function (cat, ix) {
                    obj.series[0].data[ix] = { name: cat, y: obj.series[0].data[ix].valueOf()[0] };
                    total += obj.series[0].data[ix].y;
                });

                obj.tooltip = { enabled: true, pointFormat: '<b>{point.y}</b>' };
                obj.plotOptions.allowPointSelect = true;

                var heading = obj.htmlDataTable.match(/<h4>(.*?)<\/h4>/g)[0];
                obj.htmlDataTable = "<table class='hichartDataTableTitle'><tbody><tr><td colspan='3'><h4>" + heading + "</h4></td></tr></tbody></table>";
                obj.htmlDataTable += "<table class='hichartDataTableTitle table '><tbody>";
                obj.htmlDataTable += "<tr class='text-right'><th></th><th class='text-right currencyHeader'>Total</th></tr>";
                _.each(obj.series[0].data, function (s) { obj.htmlDataTable += "<tr class='text-right'><th>" + s.name + "</th><td>" + s.y + "</td></tr>" });
                obj.htmlDataTable += "<tr class='text-right'><th class='currencyHeaderNote'></th><th class='text-right'>" + total.toFixed(2) + "</th></tr>";
                obj.htmlDataTable += "</tbody></table>";


            }

        }

        obj.target_div_id = self.chartdivId;
        if (undefined != breadcrumbstring) {
            obj.subtitle = {
                text: breadcrumbstring
            };
        }
        //if pie, dont bother with the legend
        if (obj.plotOptions != undefined && obj.plotOptions.pie != undefined) {
            obj.legend = {};
            obj.legend.enabled = false;
        }

        //rotate the x axis text if lots of categories
        if (obj.xAxis.length > 0 && obj.xAxis[0].categories != undefined && obj.xAxis[0].categories.length > 6) {
            obj.xAxis[0].labels.rotation = -70;
            obj.xAxis[0].labels.style = {
                fontSize: '10px',
                fontFamily: 'Verdana, sans-serif'
           }
           obj.chart.marginLeft = 10;
        }

        //rotate the x axis text if lots of categories
        if (obj.xAxis.length > 0 && obj.xAxis[0].categories != undefined && obj.xAxis[0].categories.length > 20) {
            obj.xAxis[0].labels.rotation = -90;
            obj.xAxis[0].labels.style = {
                fontSize: '10px',
                fontFamily: 'Verdana, sans-serif'
            }
        }


        //// Below has been commented out as there are now multiple charts.
        //// If a user edits the Y or X axis of a chart, the title will be reset (unless cached).
        //if (self.cmpHiChart != undefined) {
        //    var title = self.cmpHiChart.chartobject.title.text;
        //    var subtitle = self.cmpHiChart.chartobject.subtitle.text;
        //    obj.subtitle.text = subtitle;
        //    obj.title.text = title;
        //}


        self.cmpHiChart = new CMPHiChart(obj);
        if (self.warnThatSeriesAreGrouped > 0) {
            if (obj.series.length > self.warnThatSeriesAreGrouped) {
                if (_.isFunction(self.warnThatSeriesAreGroupedCallback)) {
                    self.warnThatSeriesAreGroupedCallback();
                }
            }
        }
        if (_.isFunction(completionFunction)) {
            completionFunction();
        }
        pendingChartRequests.pop(req);
    });

    pendingChartRequests.push(req);
};
