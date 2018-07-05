var flexiChartVM = function (search, resultsVM) {
    var self = this;
    self.search = search;
    self.resultsVM = resultsVM;
  
    self.charts = ko.observableArray([]);
    self.addChartPanelVisible = ko.observable(false);
    self.axisKeys = resultsVM.options.flexiChartKeys.permitted_keys; //from the razor view.
    self.defaultCharts = resultsVM.options.flexiChartKeys.default_chart;
    self.flexiChartModelName = resultsVM.options.flexiChartModelName;
    self.isBeta = resultsVM.options.isBeta;

    self.viewChart = ko.observable(true);
    self.OpenCountsInModal = ko.observable(false);
    self.YValues = ko.observableArray([]);
    self.XValues = ko.observableArray([])
    self.GroupValues = ko.observableArray([]);

    self.GroupValue = ko.observable();
    self.XValue = ko.observable();
    self.YValue = ko.observable();
    self.GroupValue = ko.observable();
    self.xCount = ko.observable(10);
    self.gCount = ko.observable(10);

    self.xCounts = ko.observableArray(_.range(1, 15, 1).concat(_.range(15, 100, 5)));
    self.gCounts = ko.observableArray(_.range(1, 15, 1).concat(_.range(15, 100, 5)));

    self.XValue.subscribe(function () { self.valueChanged(); });
    self.YValue.subscribe(function () { self.valueChanged(); });
    self.GroupValue.subscribe(function () { self.valueChanged(); });

    self.xCount.subscribe(function () { self.valueChanged(); });
    self.gCount.subscribe(function () { self.valueChanged(); });

    // this will respond to a click in the side panel of pre-canned charts.
    self.addPreCannedChart = function (x,y,g,filters) {
        self.charts.removeAll();

        if (filters)
        {
            self.applyPreCannedFilter(filters);
            self.search.registerFinishedCallback(function (result, event) {

                //TODO:push this into the search object with an id.
                self.search.finishedCallbacks.pop();

                add();
            });
        } else {
            add();
        }

        function add() {
            self.XValue(x);
            self.YValue(y);
            self.GroupValue(g);
            self.AddChart({ dontUpdate: false });
        }
        
    }
    self.applyPreCannedFilter = function (filters) {
        _.each(filters, function (filter, index) {
            vm.facetsVM.applyFacet(filter.key, filter.value, filter.clearExisting, null, index + 1 < filters.length);
        });

    }

    self.valueChanged = function () {
        self.showXGCountsInModal(self.XValue() != "TIMELINE");
        self.drawDemoChart();
    }

    self.showXGCountsInModal = ko.observable(true);

    self.chartType = ko.observable("Column");
    self.showChartTypeChooser = ko.observable(true);

    self.start = function () {
        self.setupAxisKeys();
        var alwaysDrawDemoChart = true;
        self.drawDemoChart(alwaysDrawDemoChart);
    }
    self.setupAxisKeys = function () {
        _.each(self.axisKeys.y, function (y) { self.YValues.push({ key: y.key, text: y.title }) });
        _.each(self.axisKeys.x, function (x) { self.XValues.push({ key: x.key, text: x.title }) });
        _.each(self.axisKeys.g, function (g) { self.GroupValues.push({ key: g.key, text: g.title }) });
    }
    self.updateInternal = function (element) {
        var self = this;

        var flexChartMetaData = '&CHART_METADATA(X_eq_' + element.x() + '**Y_eq_' + element.y() + '**GROUPBY_eq_' + 
            (element.chartType == "Pie" ? "NOTHING" :  element.g());
        flexChartMetaData += '**XCount=' + element.xCount + '**GCount=' + element.gCount + "**CHARTTYPE_eq_" + element.chartType + ')';

        var url = "GetFlexiChart";

        var breadcrumbstring = self.getBreadcrumbString();

        element.chart.UpdateChart(flexChartMetaData, breadcrumbstring, url, function () {
            var chart = $('#' + element.chart.chartdivId).highcharts();

            var _format = "{value:,.0f}";

            //if (element.y() == "FT_PRODUCTION_UNITS")
            //    _format = "";

            if (chart)
                chart.yAxis[0].update({
                    labels: {
                        // align: 'left',
                        format: _format
                        // format: '{value:}M'
                    }
                });
        });
    }
    self.editChart = function (subChartVm) {
        self.YValue(subChartVm.y());
        self.XValue(subChartVm.x());
        self.GroupValue(subChartVm.g());
        self.UpdatingChart(subChartVm);
        self.gCount(subChartVm.gCount);
        self.xCount(subChartVm.xCount);
        self.chartType(subChartVm.chartType);
    }

    self.drawDemoChartThrottled = function () {

        demochartJson.xAxis.title.text = (_.find(self.XValues(), function (t) {
            return t.key == self.XValue()
        }) || { text: "STD_COUNTRY" }).text;

        demochartJson.yAxis.title.text = (_.find(self.YValues(), function (t) {
            return t.key == self.YValue()
        }) || { text: "PROGRAM0" }).text;

        var groupedText = (_.find(self.GroupValues(), function (t) {
            return t.key == self.GroupValue()
        }) || { text: "NOTHING" }).text;

        //randomize the colours
        demochartJson.colors = [];
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));
        demochartJson.colors.push('#' + Math.random().toString(16).substr(-6));

        //IF year chart then change to area else columns
        if (self.XValue() == "TIMELINE") {
            demochartJson.chart.type = "area";
            demochartJson.plotOptions.area = {}; demochartJson.plotOptions.area.stacking = 'normal';
            demochartJson.series = [{
                name: 'Group  #1',
                data: [5, 3, 4, 7]
            }, {
                name: 'Group  #2',
                data: [2, 2, 3, 2]
            }, {
                name: 'Group  #3',
                data: [3, 4, 4, 2]
            }];

            demochartJson.series[0].data = _.map(demochartJson.series[0].data, function (n) {
                return Math.random() * 1000
            });
            demochartJson.series[1].data = _.map(demochartJson.series[1].data, function (n) {
                return Math.random() * 1000
            });
            demochartJson.series[2].data = _.map(demochartJson.series[2].data, function (n) {
                return Math.random() * 1000
            });

            // update the groupings to read the correct literals
            if (groupedText == "No grouping") {
                demochartJson.legend.enabled = false;
            } else {
                demochartJson.legend.enabled = true;
                demochartJson.series[0].name = groupedText + " #1";
                demochartJson.series[1].name = groupedText + " #2";
                demochartJson.series[2].name = groupedText + " #3";
            }
        }
        else {
            demochartJson.chart.type = "column";
            demochartJson.plotOptions.area = {};

            // make sure we have the correct number of series and groupings based on the selections made in the advanced section
            demochartJson.series = [];
            for (var i = 0; i < _.min([self.gCount(), 20]) ; i++) {
                var xData = [];
                for (var x = 0; x < _.min([self.xCount(), 20]) ; x++) {
                    xData.push(Math.random() * 1000);
                }

                demochartJson.series.push({
                    name: 'Group  #' + i,
                    data: xData
                })

                if (groupedText == "No grouping") {
                    demochartJson.legend.enabled = false;
                } else {
                    demochartJson.legend.enabled = true;
                    demochartJson.series[i].name = groupedText + " #" + i;
                }
            }
        }

        $('#demoChart').highcharts(demochartJson);
        _.delay(function () {
            $('#demoChart').highcharts().reflow();
        }, 20);
    }
    self.drawDemoChart = _.throttle(self.drawDemoChartThrottled, 500);
   
    self.GetSubChartsConfig = function () {
        var cookieValue = Cookies.readCookie(self.flexiChartModelName);
        var c = JSON.parse(cookieValue);
        return c;
    }

    self.SetupDefaultChartsOnce = _.once(function () {
       
        var chartsFromConfig = self.GetSubChartsConfig();
        if (chartsFromConfig == null || chartsFromConfig.length == 0) {
            _.each(self.defaultCharts, function (defaultChart) {
                self.XValue(defaultChart.x.attribute.key);
                self.YValue(defaultChart.y.attribute.key);
                self.GroupValue(defaultChart.g.attribute.key);
                self.AddChart({ dontUpdate: false });
            });
            return;
        }

        self.charts.removeAll();
        _.each(chartsFromConfig, function (t) {
            self.XValue(t.x);
            self.YValue(t.y);
            self.GroupValue(t.g);
            self.gCount(t.gCount);
            self.xCount(t.xCount);
            self.chartType(t.chartType);
            t.dontUpdate = false;
            self.AddChart(t);
        });
    })

    self.removeInitialDontSearchHintOnce = _.once(function () {
        window.vm.search.setQueryValue("SD", null);
        window.vm.search.updateHash();
    });


    self.UpdatingChart = ko.observable();

    self.getBreadcrumbString = function () {
        var crumbstring = "";
        for (var i = 0; i < vm.facetsVM.breadcrumbs().length; i++) {
            crumbstring += vm.facetsVM.breadcrumbs()[i].displayText() + " ";
    }
        return crumbstring;
    }

    self.search.registerFinishedCallback(function (result, event) {
        self.updateCharts();
        self.SetupDefaultChartsOnce();
        self.removeInitialDontSearchHintOnce();
    });

    self.updateCharts = function () {
        _.each(self.charts(), function (cht) { if (!cht.frozen()) self.updateInternal(cht); });;
    }

    $(document).bind('keypress', function (event) {
        if (event.which === 65 && event.shiftKey) {
            self.UpdatingChart(undefined);
            $('#buttonChartAxisChooserModal')[0].click();
        } else if (event.which === 86 && event.shiftKey) {
            vm.facetsVM.showFacetsModal();
        }
        else if (event.which === 69 && event.shiftKey) {
            var subChartVm = _.find(self.charts(), function (cht) {
                return cht.active();
        });
            if (subChartVm) {// shift e
                subChartVm.edit();
                /**  $('#' + subChartVm.chartdivId + '_edit').clEEick();**/
                $('#addChartChooseAttributesDiv').modal();
        }
        }
        else if (event.which === 68 && event.shiftKey) {
            //shift d
            var subChartVm = _.find(self.charts(), function (cht) {
                return cht.active();
        });

            if (subChartVm) {
                subChartVm.remove();
        }
        }
        else if (event.which === 70 && event.shiftKey) {
            //shift d
            var subChartVm = _.find(self.charts(), function (cht) {
                return cht.active();
        });

            if (subChartVm) {
                subChartVm.frozen(!subChartVm.frozen());
        }
    }
        //else alert(event.which)
    });

    self.AddChart = function (cfg) {
        var searchQuery = window.location.search.substring(1) + window.location.hash;
        var containerId = "SubChartsContainer";
        var queryString = "";
        var id = "JDSFChartConfigArea";
        var newchart = new cmpChartVM(containerId, queryString, self.search, id, id, "JTICONLINEEVENTS");
        var subChartvm = undefined;

        if (self.UpdatingChart() != undefined) {
            subChartvm = self.UpdatingChart();

            //udpate the chart to reflect the choices made on the modal
            subChartvm.x(self.XValue());
            subChartvm.y(self.YValue());
            subChartvm.g(self.GroupValue());
            subChartvm.XValues = self.XValues;
            subChartvm.YValues = self.YValues;
            subChartvm.GroupValues = self.GroupValues;
            subChartvm.xCount = self.xCount();
            subChartvm.gCount = self.gCount();
            subChartvm.chartType = self.chartType();

            var ix = self.charts.indexOf(subChartvm);
            self.charts()[ix] = subChartvm
        } else {
            subChartvm = new flexiChartVm(self, newchart, self.XValue(), self.YValue(), self.GroupValue(),  self.xCount(), self.gCount(), self.chartType());
            //add new
            subChartvm.XValues = self.XValues;
            subChartvm.YValues = self.YValues;
            subChartvm.GroupValues = self.GroupValues;
            self.charts.unshift(subChartvm);
    }

        if (!cfg.dontUpdate)
            self.updateInternal(subChartvm);
        self.addChartPanelVisible(false);
        self.arrangeCharts();

        self.UpdatingChart(undefined);

        var d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        self.persistSubCharts();
    }
    self.removeSubChartVm = function (subChartVm) {
        self.charts.remove(subChartVm);
        self.arrangeCharts();
        self.persistSubCharts();
    }

        ///Show two columns when > 1 chart?
    self.twoColumns = true;
    self.arrangeCharts = function () {

        if (self.twoColumns) {

            //if we have an odd number of subcharts then the oldest should be 100% width
            if (self.charts().length % 2 != 0) {
                var id = self.charts()[self.charts().length - 1].chart.chartdivId;
                $('#' + id + 'wrapper').addClass("width-100");
                var x = $('#' + id).highcharts();
                if (x)
                    x.reflow();
            } else {
                if (self.charts().length > 0) {
                    var id = self.charts()[self.charts().length - 1].chart.chartdivId;
                    $('#' + id + 'wrapper').removeClass("width-100");
                    var x = $('#' + id).highcharts();
                    if (x)
                        x.reflow();
            }
        }
        }
        else {
            _.each(self.charts(), function (cht) {

                $('#' + cht.chart.chartdivId + 'wrapper').addClass("width-100");
        });
    }
    }

    self.persistSubCharts = function () {
        var chartString = self.getSubChartsString();
        Cookies.createCookie(self.flexiChartModelName, self.getSubChartsString(), 30);
    }

    self.getSubChartsString = function () {
        var x = JSON.stringify(self.charts());
        var chartsLightArray = [];
        _.each(self.charts(), function (t) {
            chartsLightArray.push({
                    x: t.x(),
                    y: t.y(),
                    g: t.g(),
                    lens: t.lens,
                    xCount: t.xCount,
                    gCount: t.gCount,
                    chartType: t.chartType
        });
        }, chartsLightArray);
        var final = JSON.stringify(chartsLightArray);
        return final;
    }

    self.start();
};



$(document).on("mouseover", ".chartDiv", function (event) {

    var subChartVm = _.find(vm.flexChartVM.charts(), function (cht) {
        return cht.chart.chartdivId == this.id;
    }, this);
    if (subChartVm) {
        subChartVm.active(true);
    }
});
$(document).on("mouseout", ".chartDiv", function (event) {

    var subChartVm = _.find(vm.flexChartVM.charts(), function (cht) {
        return cht.chart.chartdivId == this.id;
    }, this);
    if (subChartVm) {
        subChartVm.active(false);
        // subChartVm.refineVisible(false)

    }
});
