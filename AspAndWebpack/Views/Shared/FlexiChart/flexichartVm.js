
/** the vm to hold a chart and its config data so we can have lots of them **/
var flexiChartVm = function (parent, chart, x, y, g,  xCount, gCount, chartType) {
    var self = this;

    self.chart = chart;
    self.x = ko.observable(x);
    self.y = ko.observable(y);
    self.g = ko.observable(g);
    self.active = ko.observable(false);
    self.frozen = ko.observable(false);
    self.xCount = xCount;
    self.gCount = gCount;
    self.chartType = chartType;

    self.ExportChart = function (type) {

        type = type.toUpperCase();

        var fileType = {
            PDF: 'application/pdf',
            JPEG: 'image/jpeg',
            JPG: 'image/jpeg',
            PNG: 'image/png',
            SVG: 'image/svg+xml'
        };

        var chart = $('#' + self.chart.chartdivId).highcharts();

        chart.exportChart({
            type: fileType[type] || 'image/png',
            filename: 'IHS-Chart'
        });
    }
   
    self.chartDataTable = ko.observable(true);
    self.exportDataTable = function () {
        ;//alert('exportDataTable');
    }
    self.exportDataTable = function () {
        var url = '/MarketsForecast/Download/MarkUp/MarketsForecastSummary/xlsx';
        var dataTable = $('#' + self.chart.chartdivId + 'DataTable').html().replace(/&amp;/gi, "&");
        window.post(url, {
            markup: dataTable
        });
    }

    self.chartFullscreen = ko.observable(false);
    self.chartFullscreen.subscribe(function (fullscreen) {
        if (!fullscreen) {
            $('#' + self.chart.chartdivId).height(380);
            //$('#' + self.chart.chartdivId).highcharts().reflow();
        }
        window.setTimeout(function () {
            $('#' + self.chart.chartdivId).highcharts().reflow();
        }, 150);

    });

    self.editChartTitle = ko.observable(false);
    self.editChartTitle.subscribe(function (edit) {
        return;
        if (!edit) {
            var titleEdit = $('.chart-edit-title').addClass('hidden').find('input');
            var subtitleEdit = $('.chart-edit-subtitle').addClass('hidden').find('input');
            $('#' + self.chartdivId).highcharts().setTitle({
                text: titleEdit.val()
            }, {
                text: subtitleEdit.val()
            });
            return;
        }
        function setupEdit(edit, addClass, topOffset) {
            var chartTitle = $('.highcharts-' + edit);
            var container;
            var pos = {};

            if (!chartTitle.length) {
                container = $('#JMFHiChartContainer');
                pos = {
                    top: container.offset().top + 50 + topOffset * 2.5,
                    left: container.offset().left + container.width() / 2 - 100,
                    width: 200
                };
            } else {
                pos = {
                    top: chartTitle.position().top - 6 + topOffset,
                    left: chartTitle.position().left - 13,
                    width: Math.max(chartTitle.width() + 26 + 50, 200),
                    height: chartTitle.height() + 10
                };
            }
            var titleEdit = $('.chart-edit-' + edit);
            if (!titleEdit.length) {
                titleEdit = $('<div class="hidden absolute input-group chart-edit-' + edit + '"><input class="form-control" /><span class="input-group-btn"><button class="btn btn-primary" data-bind="click: editChartTitle.bind($data,false)"><i class="icon-ok"></i></button></span></div>').appendTo('body');
                if (addClass)
                    titleEdit.addClass(addClass);
                ko.applyBindings(self, titleEdit[0]);
            }
            var titleInput = titleEdit.find('input');
            titleEdit.css(pos).removeClass('hidden');
            titleInput.css({
                'font-size': chartTitle.css('font-size')
            }).val(chartTitle.text()).focus();
            return titleInput;
        }
        setupEdit('title', 'input-group-lg', -11).focus();
        setupEdit('subtitle', 'input-group-sm', 11);
    });

    self.PrintChart = function () {
        var chart = $('#' + self.chart.chartdivId).highcharts();
        chart.print();
    }
    self.queryRemove = ko.observable(false);
    self.remove = function () {
        parent.removeSubChartVm(self);
    }
    self.edit = function () {
        parent.editChart(self);
    }

    self.refineVisible = ko.observable(false);
    self.XFilterValue = ko.observable("United Kingdom...");
    self.GFilterValue = ko.observable("Awarded Opportunity...");
    self.RefineNextXValue = ko.observable(self.x());
    self.RefineNextGValue = ko.observable(self.g());
    self.SelectedChartItems = ko.observableArray([]);

    self.AddToList = function (XorG) {

        if (XorG == "x") {
            if (self.XFilterValue() == "All Other X") {
                ShowInfo("Sorry, you cannot filter on 'All Other X'", 5000);
                return;
            }
            if (!_.find(self.SelectedChartItems(), function (item) { return item.value == self.XFilterValue(); })) {
                self.SelectedChartItems.push({ value: self.XFilterValue(), key: self.x() });
            }
        }
        else {
            if (self.GFilterValue() == "All Other") {
                ShowInfo("Sorry, you cannot filter on 'All Other'", 5000);
                return;
            }

            if (!_.find(self.SelectedChartItems(), function (item) { return item.value == self.GFilterValue(); })) {
                self.SelectedChartItems.push({ value: self.GFilterValue(), key: self.g() });
            }
        }
    }

    self.removeSelectedChartItem = function (item) {
        self.SelectedChartItems.remove(
        _.find(self.SelectedChartItems(), { value: item.value, key: item.key })
       );
    }

    self.RefineChart = function (AddOrRemove) {
        var ex = AddOrRemove == "Remove" ? '!!' : '';
        var stopsearch = true;

        _.each(_.initial(self.SelectedChartItems()), function (it) {
            vm.facetsVM.applyFacet(it.key + ex, it.value, false, null, stopsearch);
        });

        stopsearch = false;
        var last = _.last(self.SelectedChartItems());
        vm.facetsVM.applyFacet(last.key + ex, last.value, false, null, stopsearch);

        self.SelectedChartItems.removeAll();
        parent.persistSubCharts();
        //}
        //else
        //{
        //    var current = self.g + ex;
        //  self.g = self.RefineNextGValue();
        //    parent.persistSubCharts();
        //    vm.facetsVM.applyFacet(current, self.GFilterValue(), false, null, false);


        //}
        self.refineVisible(false);

        //alert(XorG + ' - ' + AddOrRemove);
        //self.resultsVM.facetsVM.applyFacet(ixr, value, false, null, false);
    }
}


/** SET UP THE EXAMPLE CHART **/
/******************************/
/******************************/
/******************************/
/******************************/
var demochartJson = {
    chart: {
        type: 'column'
    },
    title: {
        text: 'IHS Markit'
    },
    xAxis: {
        title: {
            text: 'X AXIS NAME'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Y Axis Title'
        },

    },
    legend: {
        align: 'center'
    },
    tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
        }
    },
    series: [{
        name: 'Group  #1',
        data: [5, 3, 4, 7]
    }, {
        name: 'Group  #2',
        data: [2, 2, 3, 2]
    }, {
        name: 'Group  #3',
        data: [3, 4, 4, 2]
    }],
    colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
};
