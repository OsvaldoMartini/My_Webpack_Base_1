
/** the vm to hold a chart and its config data so we can have lots of them **/
var subChartVm = function (parent, chart, x, y, g, lens, xCount, gCount, chartType) {
    var self = this;

    self.chart = chart;
    self.x = ko.observable(x);
    self.y = ko.observable(y);
    self.g = ko.observable(g);
    self.frozen = ko.observable(false);
    self.lens = lens || parent.currentLens().name;
    self.active = ko.observable(false);
    self.undoOperations = ko.observableArray([]);
    self.chartType = chartType;

    self.xCount = xCount;
    self.gCount = gCount;

    self.hideDrillDownText = ko.computed(function () {
        return "All Others";
    });

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

        var message = "fileType:" + type + ", x,y,z=" + self.x() + "-" + self.y() + "-" + self.g();

        CMP.Utils.ActivityLog.log('DefenceBudgets', 8, 1, message);//8 export, 1 info.
    }
    self.chartDataTable = ko.observable(true);
    self.exportDataTable = function () {
        var message = "Datatable Export :  x,y,z=" + self.x() + "-" + self.y() + "-" + self.g() ;

        CMP.Utils.ActivityLog.log('DefenceBudgets', 8, 1,message);//8 export, 1 info.
    }


    /**
    * remove the last filter, and put the chart x value to previous
    **/
    self.undoLastOperation = function () {
        var l = self.undoOperations().length - 1;
        if (l < 0) return;

        var thisUndo = self.undoOperations()[l];
        vm.facetsVM.removeFacet(thisUndo.xIndexer, thisUndo.valueToRemove, null, false);
        self.undoOperations.pop();
        self.x(thisUndo.xIndexer);
    }

    self.exportDataTable = function () {
        var url = '/DefenceBudgets/Download/MarkUp/DefenceBudgetsSummary/xlsx';
        var dataTable = $('#' + self.chart.chartdivId + 'DataTable').html().replace(/&amp;/gi, "&");
        window.post(url, {
            markup: dataTable
        });
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "ExportDataTable."); //4 click, 1 info.
    }
    self.loadCustomDataSheet = function () {
        var newUrl = window.location.href.replace(/DefenceBudgets\/Guided\??/i, "DefenceBudgets/GetCustomDataSheet?").replace("#", "&");
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "loadCustomDataSheet."); //4 click, 1 info.
        window.open(newUrl);
    }

    self.frozen.subscribe(function () {
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "ChartFrozen=" + self.frozen()); //4 click, 1 info.
    })

    self.chartFullscreen = ko.observable(false);
    self.chartFullscreen.subscribe(function (fullscreen) {
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "Chart Fullscreen = "  + self.chartFullscreen()); //4 click, 1 info.
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
                container = $('#JDBHiChartContainer');
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
        CMP.Utils.ActivityLog.log('DefenceBudgets', 9, 1, "Print Chart :  x,y,z=" +self.x() + "-"
            +self.y() + "-" +self.g() + " :: " + window.location.href);//9 print, 1 info.
    }
    self.queryRemove = ko.observable(false);
    self.remove = function () {
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "Remove Chart"); //4 click, 1 info.
        parent.removeSubChartVm(self);
    }

    self.edit = function () {
        parent.editChart(self);
    }

    self.add = function () {
        parent.editMode(false);
    }

    self.refineVisible = ko.observable(false);
    self.XFilterValue = ko.observable("United Kingdom...");
    self.GFilterValue = ko.observable("Awarded Opportunity...");
    self.wantsToFilterOnX = ko.observable(true);
    self.wantsToFilterOnG = ko.observable(true);
    self.RefineNextXValue = ko.observable(self.x());
    self.RefineNextGValue = ko.observable(self.g());
    self.SelectedChartItems = ko.observableArray([]);
    self.TopTenItems = ko.observableArray([]);

    self.wantsToFilterOnX.subscribe(function () {
        self.updateTopTenProgramList();
    })

    self.wantsToFilterOnG.subscribe(function () {
        self.updateTopTenProgramList();
    })

    self.updateTopTenProgramList = _.debounce(function () { self.updateTopTenProgramListImmediate() }, 1000);

    self.updateTopTenProgramListImmediate = function () {
        //Defencebudgets.js > SubchartVMS.js
        self.TopTenItems.removeAll();
        parent.parent.GetTopTenProgramsForSubChart(self);
    }

    self.loadDescription = function (data) {
        data.expanded(!data.expanded());

        if (data.DESCRIPTION != "")
            return;

        $.ajax({
            type: "GET",
            url: "/api/v1/defencebudgets/Items?ixrs=ITEMDESC&f=RECORDID(" + data.ItemID + ")",
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                var newRecord = { expanded: ko.observable(true), ItemID: data.ItemID, ITEMNAME: data.ITEMNAME, DESCRIPTION: msg.data[0].ITEMDESC, STD_SUPPLIER: data.STD_SUPPLIER, SERIESVAL: data.SERIESVAL };
                self.TopTenItems.replace(data, newRecord);
            }
        });

    }
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

    self.RefineChart = function(AddOrRemove)
    {
        var ex = AddOrRemove == "Remove" ? '!!' : '';
        var stopsearch = true;

        var message = "Drilldown To:" + self.RefineNextXValue() + ",From:" + self.x() + ",ClickValue:" + self.XFilterValue();
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, message); //4 = event.click, 1 info.
        self.undoOperations.push({ "xIndexer": self.x(), "valueToRemove": self.XFilterValue() });

        // when the chart reloads, use this as the x axis based on the users choice in the modal

        if (self.wantsToFilterOnX() && self.wantsToFilterOnG() && self.g() != 'NOTHING') {
            vm.facetsVM.applyFacet(self.x().replace("TIMELINE", "YEAR"), self.XFilterValue(), false, null, stopsearch);
            vm.facetsVM.applyFacet(self.g(), self.GFilterValue(), false, null, stopsearch);
        }
        else {
            stopsearch = false;

            if (self.wantsToFilterOnX()){
                vm.facetsVM.applyFacet(self.x().replace("TIMELINE", "YEAR"), self.XFilterValue(), false, null, stopsearch);
            }
            else if (self.wantsToFilterOnG()){
                vm.facetsVM.applyFacet(self.g(), self.GFilterValue(), false, null, stopsearch);
            }

        }

        self.x(self.RefineNextXValue() == "TIMELINE" ? "PLATFORMTYPE" : self.RefineNextXValue());
        vm.facetsVM.applyFacets();
        self.refineVisible(false);
    }

    self.editTitle = function () {
        var chart = $('#' + self.chart.chartdivId).highcharts();
        var $ele = $("#" + self.chart.chartdivId + " .highcharts-title");
        $ele.webuiPopover("destroy");
        var title = chart.title.textStr || "";
        var subtitle = chart.subtitle.textStr || "";
        var content = "<div class='form-group'>" +
            "<label class='control-label' for='" + self.chart.chartdivId + "'>Set Title</label>" +
            "<input class='form-control ' type='text' placeholder='Enter a chart title' id='" + self.chart.chartdivId + "' value='" + title + "'><br/>" +
            "<label class='control-label' for='" + self.chart.chartdivId + "subtitleInput'>Set Subtitle</label>" +
            " <input class='form-control' type='text' placeholder='Enter a chart subtitle (optional)' id='" + self.chart.chartdivId + "subtitleInput' value='" + subtitle + "'>" +
            "</div>";

        $("#" + self.chart.chartdivId + " .highcharts-title").webuiPopover({
            placement: 'auto-top',
            closeable: true,
            animation: 'pop',
            title: 'Edit The Chart Title',
            content: content,
            arrow: false,
            cache: false,
            width: 400,
            dismissable: false,
            onHide: function (e) {
                var $ele = $(e);
                var title = $ele.find("#" + self.chart.chartdivId).val();
                var subtitle = $ele.find("#" + self.chart.chartdivId + "subtitleInput").val();

                var chart = $('#' + self.chart.chartdivId).highcharts();
                chart.setTitle({ text: title })
                chart.setTitle(null, { text: subtitle });
                self.chart.cmpHiChart.chartobject.title.text = title;
                self.chart.cmpHiChart.chartobject.subtitle.text = subtitle;
            }
        }).webuiPopover("show");
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
        text: 'Janes Defence Budgets'
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
        },
        area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
                lineWidth: 1,
                lineColor: '#666666'
            }
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

    colors: ["#a2caec", "#ecee9a", "#ffdd7f", "#d8dcdb", "#f7bfad", "#2a78a8", "#bed158", "#FCB94D", "#a1abb2",
        "#e98756", "#103c68", "#96bc33", "#f7941d", "#3a4e58", "#f04e23", "#0097D1"],
};
