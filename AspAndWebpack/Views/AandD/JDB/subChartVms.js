/** Collection of charts to store and draw when the search changes etc**/
var SubChartsVM = function (parent) {
    var self = this;
    self.charts = ko.observableArray([]);
    self.search = parent.search;
    self.parent = parent;
    self.addChartPanelVisible = ko.observable(false);
    self.currentLens = ko.observable({ name: "Defence" });
    self.UpdatingChart = ko.observable();
    self.cookieId = 'IHS_jDBSubCharts_4_5';
    //flag indicates if we are editing a given chart or adding new.

    // Default the chart to column aot pie or area
    self.chartType = ko.observable("Column");
    self.showChartTypeChooser = ko.observable(true);

    self.ClearCharts = function () {
        self.charts.removeAll();
        self.persistSubCharts();
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "Clear Charts"); //4 click, 1 info.

    }

    self.editMode = ko.observable(false);
    self.chartTitle = ko.observable();
    self.chartSubTitle = ko.observable();

    self.AddChartWithDetails = function (xVal, yVal, groupVal, lens) {
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "AddChartWithDetails:x=" + xVal + ", y=" + yVal + ", g=" + groupVal ); //4 click, 1 info.
        if (!parent.viewChart())
            return;
        self.XValue(xVal);
        self.YValue(yVal);
        self.GroupValue(groupVal);
        self.xCount(12);
        self.gCount(12);
        self.chartType("Column");
        self.AddChart({ lens: lens });
    }
   
    self.AddChart = function (cfg) {
        CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, "AddChart:x="); //4 click, 1 info.
        var searchQuery = window.location.search.substring(1) + window.location.hash;
        var containerId = "SubChartsContainer";
        var queryString = "";
        var id = "JDBChartConfigArea";
        var newchart = new cmpChartVM(containerId, queryString, self.search, id, id, "JTICONLINEEVENTS");
        var subChartvm = undefined;

        if (self.UpdatingChart() != undefined) {
            subChartvm = self.UpdatingChart();
          
            //udpate the chart to reflect the choices made on the modal
            subChartvm.x(self.XValue());
            subChartvm.y(self.YValue());
            subChartvm.g(self.GroupValue());
            subChartvm.chartType = self.chartType();
            subChartvm.XValues = self.XValues;
            subChartvm.YValues = self.YValues;
            subChartvm.GroupValues = self.GroupValues;
            subChartvm.xCount = self.xCount();
            subChartvm.gCount = self.gCount();

            // Chart Title/Subtitle
            subChartvm.chart.cmpHiChart.chartobject.title.text = cfg.chartTitle();
            subChartvm.chart.cmpHiChart.chartobject.subtitle.text = cfg.chartSubTitle();

            var ix = self.charts.indexOf(subChartvm);
            self.charts()[ix] = subChartvm
        } else {
            subChartvm = new subChartVm(self, newchart, self.XValue(), self.YValue(), self.GroupValue(), (cfg?cfg.lens:undefined), self.xCount(), self.gCount(), self.chartType());
            //add new
            subChartvm.XValues = self.XValues;
            subChartvm.YValues = self.YValues;
            subChartvm.GroupValues = self.GroupValues;
            self.charts.unshift(subChartvm);
        }

        if (subChartvm.lens == self.currentLens().name)
        if (! cfg.dontUpdate)
        self.updateInternal(subChartvm);
        self.addChartPanelVisible(false);
        self.arrangeCharts();

        self.UpdatingChart(undefined);

        var d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        self.persistSubCharts();
    }

    //the number of charts visible for current lens
    self.visibleChartsCount = ko.computed(function () {
        return _.filter(self.charts(), function (cht) { return cht.lens == self.currentLens().name;}).length;
    });
   
    self.visibleCharts = ko.computed(function () {
        return _.filter(self.charts(), function (cht) { return cht.lens == self.currentLens().name; });
    });

    /** no charts found so default to all charts **/
    self.AddAllDefaultCharts = function () {
        self.ShowDefaultCharts("Force");
        self.ShowDefaultCharts("Activity");
    }

    self.ShowDefaultCharts = function (lens) {
        switch (lens || self.currentLens().name)
        {
            case "Defence":
                self.AddChartWithDetails("TIMELINE", "PROGRAM", "NOTHING", "Defence");
                break;
            case "Location":
                self.AddChartWithDetails("STD_REGION", "PROGRAM", "NOTHING", "Location");
                break;
            case "System":
                self.AddChartWithDetails("SYSTEM_LENS_CHILD", "PROGRAM", "NOTHING", "System");
                break;
            case "Opportunity":
                self.AddChartWithDetails("PLANNING_PHASE", "PROGRAM", "NOTHING", "Opportunity");
                break;
            case "Subsystem":
                self.AddChartWithDetails("META_SYSTEM_TYPE", "PROGRAM", "NOTHING", "Subsystem");
                break;
            case "Company":
                self.AddChartWithDetails("STD_SUPPLIER", "PROGRAM", "NOTHING", "Company");
                break;
        }
    }

    self.SetupCharts = function()
    {
        var chartsFromConfig = self.GetSubChartsConfig();
        if (chartsFromConfig == null || chartsFromConfig.length ==0)
        {
            self.AddAllDefaultCharts();
            //self.SetupCharts();
            return;
        }
        self.charts.removeAll();
        _.each(chartsFromConfig, function (t, i) {
              self.XValue(t.x);
              self.YValue(t.y);
              self.GroupValue(t.g);
              self.gCount(t.gCount);
              self.xCount(t.xCount);
              t.dontUpdate = t.lens != "Defence";
              self.chartType(t.chartType);
              self.AddChart(t);
        });
    }

    self.persistSubCharts = function () {
        var chartString = self.getSubChartsString();
        Cookies.createCookie(self.cookieId, self.getSubChartsString(), 30);
    }
    ;

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
                chartType : t.chartType
            });
        }, chartsLightArray);
        var final = JSON.stringify(chartsLightArray);
        return final;
    }
    ;

    $(document).one('ChartLoadedEvent', function () {
        _.delay(function() { self.arrangeCharts();}, 1000);
    });

    self.arrangeCharts = function () {
        if(self.visibleCharts().length == 0)
        {
            return; 
        }
        else if (self.visibleCharts().length % 2 == 0) {

            _.each(self.visibleCharts(), function (c) {
                $('#' + c.chart.chartdivId + 'wrapper').removeClass("width-100");
                var x = $('#' + c.chart.chartdivId).highcharts();
                if (x) x.reflow();
            });
        }
        else {
            var id = self.visibleCharts()[self.visibleCharts().length - 1].chart.chartdivId;
            $('#' + id + 'wrapper').addClass("width-100");
            var x = $('#' + id).highcharts();
            if (x) x.reflow();
        }
       
        //if we have an odd number of subcharts then the oldest should be 100% width
        //if (self.visibleCharts().length % 2 != 0) {
        //    var id = self.visibleCharts()[self.visibleCharts().length - 1].chart.chartdivId;
        //    $('#' + id + 'wrapper').addClass("width-100");
        //    var x = $('#' + id).highcharts();
        //    //$('#' + id + 'wrapper > div > div').css('width', '100%');
        //    $('#' + id + 'wrapper > div').css('width', '100%');
        //    if (x)
        //        x.reflow();
        //} else {
        //    if (self.visibleCharts().length > 0) {
        //        var id = self.visibleCharts()[self.visibleCharts().length - 1].chart.chartdivId;
        //        $('#' + id + 'wrapper').removeClass("width-100");
        //        var x = $('#' + id).highcharts();
        //        if (x)
        //            x.reflow();
        //    }
        //}
    }
    self.updateCharts = function () {
        var searchQuery = window.location.search.substring(1) + window.location.hash;

        var length = self.charts().length;
        _.each(self.charts(), function (element) {
            if (element.lens == self.currentLens().name && ! element.frozen())
            self.updateInternal(element);
        });

        self.HideChartRefineModals();
        // call the chart vm to do the update.
    }

    self.HideChartRefineModals = function () {
        _.map(self.charts(), function (cht) {
            cht.refineVisible(false);
        });
    }

    self.updateInternal = function (element) {
        var self = this;
 
        var flexChartMetaData = '&CHART_METADATA(X_eq_' + element.x() + '**Y_eq_' + element.y() + '**GROUPBY_eq_' + (element.chartType == "Pie" ? "NOTHING" : element.g());
        if (parent.PGo_On()) {
            flexChartMetaData += "**RemovePGO";
        }

        if (parent.Inflate()) {
            flexChartMetaData += "**UseDeflated";
        }

        flexChartMetaData += "**Currency_" + ((parent.Currency() || {}).key || "USD");

        flexChartMetaData += '**XCount=' + element.xCount + '**GCount=' + element.gCount +  "**CHARTTYPE_eq_" + element.chartType + ')';

        // Update the parent values as these get used for the chart title in the controller.
        parent.DefenceSegment({
            key: element.g(),
            text: "Function"
        });

        parent.ForecastType({
            key: element.y(),
            text: "TESTING"
        });

        var url = "/DefenceBudgets/GetChart2";
        if (element.x() === "TIMELINE") {
	        url = "/DefenceBudgets/GetChart";
        }

        var breadcrumbstring = parent.getBreadcrumbString();

        element.chart.UpdateChart(flexChartMetaData, breadcrumbstring, url, function () {
            var chart = $('#' + element.chart.chartdivId).highcharts();

            var currencyText = vm.gridChartVM.Currency();
            if (currencyText) {
                $('#' + element.chart.chartdivId + 'DataTable th.currencyHeader').html(vm.gridChartVM.Currency().text);
                $('#' + element.chart.chartdivId + 'DataTable .currencyHeaderNote')
                    .html("(All data in " + vm.gridChartVM.Currency().text + " M)");
            }

            var _format = "{value:,.0f}M";

            if (element.y() === "FT_PRODUCTION_UNITS")
                _format = "";

            if(chart)
                chart.yAxis[0].update({stacked:true,
                            labels: {
                               // align: 'left',
                                 format: _format
                                // format: '{value:}M'
                            }
                });


            var also = $('#' +element.chart.chartdivId + '.highcharts-container').parent();
            var width;
            $('#' + element.chart.chartdivId).resizable({
                ghost: true,
                handles: 's',
                grid: [1, 1],
                stop: function (event, ui) {
                    also.height(ui.size.height - 60);
                    ui.element.width(width);
                    //self.updateInternal(element);
                    $('#' + element.chart.chartdivId).highcharts().reflow();
                },
                start: function (e, ui) {
                    width = ui.size.width;
                }
            });


        });

       
    }

    // The list of numbers people can choose when selecting the number of x axi.
    self.showXGCountsInModal = ko.observable(true);
    self.xCount = ko.observable();
    self.xCounts = ko.observableArray(_.range(1, 15, 1).concat(_.range(15, 100, 5)));
    // The list of numbers people can choose when selecting the number of x axi.
    self.gCount = ko.observable();
    self.gCounts = ko.observableArray(_.range(1, 15, 1).concat(_.range(15, 100, 5)));

    self.OpenCountsInModal = ko.observable(false);
   
    self.addChartPanelVisible.subscribe(function () {
        self.drawDemoChart();
    });

    self.XValue = ko.observable();

    self.XValue.subscribe(function () {
        var xVal = self.XValue();
        self.showXGCountsInModal(xVal != "TIMELINE");
        self.showChartTypeChooser(xVal != "TIMELINE")
        self.CheckForInvalidAxisCombos();
        self.drawDemoChart();
    })

    /**
    ** Make sure if we have subsystem values in the chart axi, we dont allow units as the y value.
    **/
    self.CheckForInvalidAxisCombos = function () {
        if (self.XValue() == "SUBSYSTEM_SUPPLIER" || self.XValue() == "SUBSYSTEM_TYPE" || self.GroupValue() == "SUBSYSTEM_SUPPLIER" || self.GroupValue() == "SUBSYSTEM_TYPE") {
            if (self.YValue() == "FT_PRODUCTION_UNITS") {
                self.YValue("FT_TOTAL_PROGRAM");
                ShowInfo("Sorry, production units are not available for subsystem charts. We have changed the forecast back to Total Program.", 3000);
            }
        }

        // if we have set timeline in x , make sure we have something in G. "nothing" is not permitted.
        if (self.XValue() == "TIMELINE")
        {
            if (self.GroupValue() == "NOTHING") {
                self.GroupValue("FUNCTIONALSEGMENT");
            }
        }
    }

    self.XValues = ko.observableArray([{
        key: "TIMELINE",
        text: "Years"
    }
    //},  {
    //    key: "DEFENCE_ATTR1",
    //    text: "Business Sector"
    //},
, {
    key: "DEFENCE",
    text: "Defence"
}
,
    {
        key: "META_SYSTEM_TYPE",
        text: "Main System"
    },
     {
         key: "FUNCTIONALSEGMENT",
         text: "Function"
     }, {
         key: "FORCESTRUCTURE",
         text: "Force Structure"
     }
, {
    key: "PLATFORMSPECIFIC",
    text: "Platform Specific"
}, {
    key: "PLATFORMTYPE",
    text: "Platform Type"
}
, {
    key: "PLATFORMFAMILYNAME",
    text: "Platform Family"
}, {
    key: "STD_COUNTRY",
    text: "Country"
},
    {
        key: "SYSTEM_LENS_PARENT",
        text: "System"
    },
    {
        key: "SYSTEM_LENS_CHILD",
        text: "System Type"
    },
     {
         key: "SYSTEM_LENS_VALUE",
         text: "System Detail"
     },
    {
        key: "STD_REGION",
        text: "Region"
    }, {
        key: "STD_SUPPLIER",
        text: "Supplier"
    }, {
        key: "ITEMLIFECYCLEDESC",
        text: "Life Cycle Position"
    }, {
        key: "EXECUTION_PHASE",
        text: "Execution Phase"
    }, {
        key: "PLANNING_PHASE",
        text: "Planning Phase"
    }, {
        key: "USERORGGEN",
        text: "User Org Gen"
    }, {
        key: "GOVERNMENT_PRIME",
        text: "Govt Prime"
    }, {
        key: "MANNED_UNMANNED",
        text: "Manned Unmanned"
    }, {
        key: "PARENT_DEFENCE",
        text: "Technology"
    }, {
        key: "ITEMPATH",
        text: "Item Path"
    }, {
        key: "PRODUCTIONTYPE",
        text: "Production Type"
    }, {
        key: "CTY_FINAL_ASSEMBLY",
        text: "Final Assembly Country"
    }, {
        key: "FMS",
        text: "Foreign Military Sale"
    }, {
        key: "SUBSYSTEM_SUPPLIER",
        text: "Subsystem Supplier"
    }, {
        key: "SUBSYSTEM_TYPE",
        text: "Subsystem Type"
    }
    ])

    self.GroupValue = ko.observable();
    self.GroupValues = ko.observableArray(self.XValues.slice(1));
    //add a 'nothing' to the group by
    self.GroupValues.unshift({
        key: "NOTHING",
        text: "No grouping"
    });

   

    self.YValue = ko.observable();
    self.YValues = ko.observableArray([{
        text: "Total Program",
        key: "FT_TOTAL_PROGRAM"
    }, {
        key: "FT_R_AND_D",
        text: "R&D Only"
    }, {
        key: "FT_PRODUCTION",
        text: "Production Only"
    }, {
        key: "FT_SLS",
        text: "SLS Only"
    }, {
        key: "FT_SERVICES",
        text: "Services Only"
    }, {
        key: "FT_PRODUCTION_UNITS",
        text: "Production Units"
    }, {
        key: "FT_R_AND_D_AND_PRODUCTION",
        text: "R&D + Production"
    }, {
        key: "FT_TOTAL_PROGRAM_NO_SERVICES",
        text: "Total Program w/o Services"
    }, {
        key: "FT_TOTAL_PROGRAM_NO_SLS",
        text: "Total Program w/o SLS"
    }
    ])

    self.editChart = function (subChartVm) {
        self.editMode(true);
        self.YValue(subChartVm.y());
        self.XValue(subChartVm.x());
        self.GroupValue(subChartVm.g());
        self.UpdatingChart(subChartVm);
        self.gCount(subChartVm.gCount);
        self.xCount(subChartVm.xCount);
        self.chartType(subChartVm.chartType);

        if (subChartVm.chart.cmpHiChart !== undefined) {
            self.chartTitle(subChartVm.chart.cmpHiChart.chartobject.title.text || "");
            self.chartSubTitle(subChartVm.chart.cmpHiChart.chartobject.subtitle.text || "");
        } else {
            // This is sometimes required if the user tries to edit a chart before it has finished loading.
            self.editMode(false);
        }
    }

    self.addChartToBeta = function (subChartVm) {
        self.UpdatingChart(undefined);
        $('#buttonChartAxisChooserModal')[0].click();
    }

    self.removeSubChartVm = function (subChartVm) {
        self.charts.remove(subChartVm);
        self.arrangeCharts();
        self.persistSubCharts();
    }

    self.drawDemoChartThrottled = function () {
        if (!parent.GuidedBeta)
            return;

        demochartJson.xAxis.title.text = (_.find(self.XValues(), function (t) {
            return t.key == self.XValue()
        }) || { text: "STD_COUNTRY" }).text;

        demochartJson.yAxis.title.text = (_.find(self.YValues(), function (t) {
            return t.key == self.YValue()
        }) || { text: "PROGRAM0" }).text;

        var groupedText = (_.find(self.GroupValues(), function (t) {
            return t.key == self.GroupValue()
        }) || { text: "NOTHING" }).text;

        

        //IF year chart then change to area else columns
        if (self.XValue() == "TIMELINE") {
            demochartJson.chart.type = "area";
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
            var chartType = self.chartType().toLowerCase();
            demochartJson.chart.type = chartType;
            // make sure we have the correct number of series and groupings based on the selections made in the advanced section
            demochartJson.series = [];
            var gCount = self.gCount();
            if (chartType == "pie")
                gCount = 1;

            for (var i = 0; i < _.min([gCount, 8]) ; i++)
            {
                var xData = [];
                for (var x = 0; x < _.min([self.xCount(),8]) ; x++)
                {
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

    self.runOnce = _.once(function () {
        self.XValue.subscribe(function () {
            self.drawDemoChart();
        });
        self.xCount.subscribe(function () {
            self.drawDemoChart();
        });
        self.gCount.subscribe(function () {
            self.drawDemoChart();
        });
        self.YValue.subscribe(function () {
            self.drawDemoChart();
            self.CheckForInvalidAxisCombos();
        });
        self.GroupValue.subscribe(function () {
            self.drawDemoChart();
            self.CheckForInvalidAxisCombos();
        });
        self.chartType.subscribe(function () {
            self.drawDemoChart();
            self.CheckForInvalidAxisCombos();
        });


        self.drawDemoChart();

        self.LoadAnySubChartsFromStorage();
    })

    /** load the current config for this user, which tab is selected and what charts are on it **/
    self.GetSubChartsConfig = function () {
        var cookieValue = Cookies.readCookie(self.cookieId);
        var c = JSON.parse(cookieValue);
        return c;

    }

     
    self.LoadAnySubChartsFromStorage = function () {
        return;
       
    }
    _.delay(self.runOnce, 500);
}

$(document).on("mouseover", ".chartDiv", function (event) {

    var subChartVm = _.find(vm.gridChartVM.subCharts.charts(), function (cht) {
        return cht.chart.chartdivId == this.id;
            },this);
    if (subChartVm) {
        subChartVm.active(true);
  }
});
$(document).on("mouseout", ".chartDiv", function (event) {

    var subChartVm = _.find(vm.gridChartVM.subCharts.charts(), function (cht) {
        return cht.chart.chartdivId == this.id;
    }, this);
    if (subChartVm) {
        subChartVm.active(false);

    }
});
