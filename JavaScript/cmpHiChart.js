/**

Ajax Data enabled javascript Chart control

Min required for usage

CMPHighChart.Run(cmpHighChartConfig);

**/

//array of chart objects - currently only 1 big but will be n for a given page in the future
var chartsOnPage = [];
var useRetroColours = false;
var IgnoreSessionSearchChangedEvent = false; //normally this is false

$(document)
    .ready(function() {
        if (!IgnoreSessionSearchChangedEvent) {
            $(document).bind('SessionSearchIndexerChangedEvent', function(e) { ReloadCharts(false); });
            $(document).bind('SessionSearchChangedEvent', function (e) { ReloadCharts(true); });
            Highcharts.setOptions({
                chart: {
                    events: {
                        beforePrint: function () {
                            var chart = (this.chart) ? this.chart : this;
                            this.logo = AddLogo(chart);
                        },
                        afterPrint: function () {
                            if (this.logo) this.logo.destroy();
                        }
                    }
                },
                exporting: {
                    chartOptions: {
                        chart: {
                            events: {
                                load: function () {
                                    AddLogo(this);
                                }
                            }
                        }
                    }
                }
            });
            var beforePrint = function(){
                var visible = $('body').children().filter(':visible');
                if (visible.length == 1 && visible.is('.highcharts-container')) {
                    var footer = $('.footer-copyright').first().clone();
                    $('body').append(footer);
                    window.setTimeout(function () { footer.remove(); }, 1E3);
                }
            };
            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function (mql) {
                    if (mql.matches) {
                        beforePrint();
                    };
                });
            }
            window.onbeforeprint = beforePrint;
        }
    });

function CMPHiChart(Chartobject) {
    chartsOnPage.push(this);
    this.ContainerName = '';
    this.chartobject = Chartobject;

    this.UpdateChart(true);
    $(document).trigger('ChartLoadedEvent');
}

CMPHiChart.prototype.UpdateChart = function(triggerEvent) {
    $(document).trigger('ChartUpdatingEvent');

    if (this.chartobject != undefined) {
        //clone the object for ui - so we done get circular later on when stringyfying again
        var localChartObject = JSON.parse(JSON.stringify(this.chartobject));

        // the below stops the credits area hyperlinking to highcharts.com
        if (localChartObject.credits && !localChartObject.credits.href)
            localChartObject.credits.href = '';

        // This copies in any events created outside this class, lost in the stringify.
        var events = this.chartobject.chart.events;
        for (var event in events) {
            if (events.hasOwnProperty(event)) {
                localChartObject.chart.events[event] = events[event];
            }
        }

        localChartObject.chart.events.click = function(event) {
            //just do nothign at this point in time but keep this handler, otherwise the control throws an error
            //event
            //this
        }

        // hook up the click events for the chart - 3 flavours supported so far
        if (localChartObject.plotOptions != null &&
            localChartObject.plotOptions.series != null &&
            localChartObject.plotOptions.series.events != null) {
            localChartObject.plotOptions.series.events.click = function(event) {
                ChartSeriesClick(event.point, event);
            }
        }

        if (localChartObject.plotOptions != null &&
            localChartObject.plotOptions.column != null &&
            localChartObject.plotOptions.column.events != null) {
            localChartObject.plotOptions.column.events.click = function(event) {
                ChartSeriesClick(event.point, event);
            }
        }

        if (localChartObject.plotOptions != null &&
            localChartObject.plotOptions.pie != null &&
            localChartObject.plotOptions.pie.events != null) {
            localChartObject.plotOptions.pie.events.click = function(event) {
                ChartSeriesClick(event.point, event);
            }
        }

        var chartDiv = "#chartDiv";
        var chartDivDT = "#chartDivDataTable";
        if (localChartObject.target_div_id && localChartObject.target_div_id != null) {
            chartDiv = "#" + localChartObject.target_div_id;
            chartDivDT = "#" + localChartObject.target_div_id + "DataTable";
        }

        if (!localChartObject.colors || localChartObject.colors.length == 0) {
            if (useRetroColours) {
                localChartObject.colors = [
                    "#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF", "#400000", "#404000", "#004000",
                    "#000040", "#400040", "#800000", "#808000", "#008000", "#008080", "#800080"
                ];
            } else {
                localChartObject.colors = [
                    "#a2caec", "#ecee9a", "#ffdd7f", "#d8dcdb", "#f7bfad", "#2a78a8", "#bed158", "#FCB94D", "#a1abb2",
                    "#e98756", "#103c68", "#96bc33", "#f7941d", "#3a4e58", "#f04e23", "#0097D1"
                ];
            }
        }
        
        if ($(chartDivDT).length > 0) {
            $(chartDivDT).html(localChartObject.htmlDataTable);
        }

        if (localChartObject.use_hi_stocks) {
            $(chartDiv).highcharts('StockChart', localChartObject);
        } else {
            try {
                $(chartDiv).highcharts(localChartObject);
            } catch (e) {
                console.log(e.toString());
            }
        }

        if (triggerEvent) {
            $(document).trigger('ChartLoadedEvent');
        }
    }
}

function ReloadChart(_CHARTOBJECT) {
    // before we send, we need to ensure we remove the series data
    // and remove as much as possible from the chart object so that we don't blow query string limits
    try {
        _CHARTOBJECT.chartobject.series = null;
        _CHARTOBJECT.chartobject.htmlDataTable = null;
        _CHARTOBJECT.chartobject.yAxis = null;
        _CHARTOBJECT.chartobject.xAxis = null;
        _CHARTOBJECT.chartobject.colors = null;
        _CHARTOBJECT.chartobject.legend = null;
        _CHARTOBJECT.chartobject.plotOptions = null;
    } catch (e) { ;
    }

    if (undefined != _CHARTOBJECT.chartobject) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: urlToSearchPanelService + "GetChart",
            data: { "chartConfigJson": JSON.stringify(_CHARTOBJECT.chartobject) },
            cache: false,
            success: function(response) {
                try {
                    //alert('response.d=' + response.d);
                    _CHARTOBJECT.chartobject = JSON.parse(response.d);
                    _CHARTOBJECT.UpdateChart(true);
                } catch (e) {
                    ShowError('GetChart failed in success, error message = ' + e.toString());
                }
            },
            error: function(xhr, status, error) {
                ShowError(error);
            }
        });
    }
}

//update any charts with the given config chart id to a new one -
// used to change the desired chart at runtime
// requires reload chart to be run after this is set for it to work - (this is usual behaviour for the chart)
function ChangeChartTargetGridConfigChartAreaId(target_div_id, newId) {
    //alert('about to update from ' + currentId + ' to ' + newId + '. ChartsOnPage.Length = ' + chartsOnPage.length);
    for (var i in chartsOnPage) {
        //alert(chartsOnPage[i].chartobject.target_grid_config_chart_area_id);
        if (chartsOnPage[i].chartobject != null &&
            chartsOnPage[i].chartobject.target_div_id != null &&
            chartsOnPage[i].chartobject.target_div_id == target_div_id) {
            chartsOnPage[i].chartobject.target_grid_config_chart_area_id = newId;
        }
    }
}

function UseHiStock(target_div_id, on) {
    for (var i in chartsOnPage) {
        if (chartsOnPage[i].chartobject != null &&
            chartsOnPage[i].chartobject.target_div_id != null &&
            chartsOnPage[i].chartobject.target_div_id == target_div_id) {
            chartsOnPage[i].chartobject.use_hi_stocks = on;
        }
    }
}

function ReloadCharts(searchConstraintsChanged) {
    //downdata the crumb
    $('#ctl00_masterBreadcrumb span,#ctl00_masterBreadcrumb a').attr('style', 'color:#909090   !important;');
    $('.highcharts-container').css('opacity', 0.33);

    $("#chartDiv")
        .prepend("<div class=\"LoadingAnim\" style=\"margin-top:" +
            Math.floor($("#chartDiv").height() / 2 - 32) +
            "px;\"></div>");

    for (var i in chartsOnPage) {
        ReloadChart(chartsOnPage[i]);
    }

    UpdateBreadcrumb(searchConstraintsChanged);
}

function UpdateBreadcrumb(searchConstraintsChanged) {
    if (searchConstraintsChanged && $('#ctl00_masterBreadcrumb').length > 0) {
        // retrieve the crumb
        $.ajax({
            type: "GET",
            contentType: "text",
            url: '/breadcrumbonlypage.aspx',
            cache: false,
            success: function(response) {
                var breadcrumbMarkup = $(response).find('#ctl00_masterBreadcrumb').first();
                $('#ctl00_masterBreadcrumb').html(breadcrumbMarkup);
                $('#ctl00_masterBreadcrumb').show();
                $(document).trigger('CrumbLoadedEvent');
                $(document).trigger('ChartCompleteEvent');
            },
            error: function(xhr, status, error) {
                ShowError(error);
            }
        });
    } else {
        $(document).trigger('ChartCompleteEvent');
    }
}

function ToggleDataTable(element) {
    ToggleDataTable(element, false);
}

function ToggleDataTable(element, scrollTo) {
    if (scrollTo) {
        // don't toggle just open and move to the table
        $(element).nextAll('.hichartDataTableContainer:first').addClass('on');
        $(element).addClass('on');
        $('html,body').animate({ scrollTop: $(element).offset().top });
    } else {
        var dataTable = $(element).nextAll('.hichartDataTableContainer:first');
        dataTable.toggleClass('on');
        $(element).toggleClass('on');
        var isOffRight = $(dataTable).offset().left + $(dataTable).outerWidth() - $(window).scrollLeft() >
            $(window).width();
        if (isOffRight) {
            dataTable.addClass("offRight")
        }
    }
}

var newChartTitle = "";

function renameChart() {
    $("#dialog-message")
        .dialog({
            dialogClass: "helpIndicatorDialogWrapperJDSF",
            resizable: false,
            draggable: false,
            closeText: "",
            buttons: {
                "Ok": {
                    text: 'OK',
                    "class": 'ihsStandardButton',
                    click: function() {
                        try {
                            var newTitle = $('#inputboxJQDialog').val();
                            if (newTitle != "")
                                UpdateChartTitleToUserPref(newTitle);
                        } catch (e) {
                            ;
                        }
                        $(this).dialog("close");
                    }
                    // Cancel: function () {; }
                }
            }
        });
}

function UpdateChartTitleToUserPref(newChartTitle) {
    PrepareChartTitle(newChartTitle);
}

function PrepareChartTitle(theNewTitle) {
    if (theNewTitle != null)
        setHiChartTitle(chartsOnPage[0], theNewTitle);
}

function AddLogo(chart) {
    
    var logo = chart.renderer.text('Copyright © ' + (new Date()).getFullYear() + ' IHS Markit.', 10, chart.chartHeight - 5)
                    .attr({ style: 'font-size:9px;fill:#909090;' }).add();

    $.post("/" + (chart.options.cmp_categoryUrl || window.location.pathname.substr(1, window.location.pathname.indexOf('/', 1))) + "/AuditDownload",
        {
            title: chart.title ? encodeURIComponent(chart.title.textStr) : "Chart",
            format: "chart",
            categoryName: chart.options ? chart.options.cmp_categoryKey : ""
        });

    return logo;
}

function setHiChartTitle(chart, title) {
    try {
        chart.chartobject.title = { text: title };
        chart.UpdateChart(false);
    } catch (e) {
        cw(e);
    }
}

function setHiChartFooter(chart, txt, ignoreCurrent) {
    try {
        var currentTxt = "";
        if (!ignoreCurrent && chart.chartobject.credits.text != null) {
            var updateIdx = chart.chartobject.credits.text.indexOf("Last Updated");
            currentTxt = chart.chartobject.credits.text.substring(updateIdx);
        }

        chart.chartobject.credits = { text: txt + " " + currentTxt, enabled: true, href: '' };
        chart.chartobject.credits.style = { fontSize: "12px", cursor: "default" };
    } catch (e) {
        cw(e);
    }
}

//two overriding values used in chart heights sometimes - esp fiscal 
var overridingChartHeight = 0;
var overridingChartWidth = 0;

function SingleChartResizing() {
    var chartDiv = $('#chartDiv');
    var chartTabs = $('#chartTabs');
    if (chartDiv.length > 0) {
        //make each chart a little bit bigger
        //chartsOnPage is an array in cmphicharts
        var windowBounds = getUIBounds();
        var width = windowBounds.w;
        var height = windowBounds.h;

        if (chartTabs.length > 0) {
            height = height - $("#chartTabs").offset().top - $("#chartTabs").height() - 60;
        }

        var filtersButton = $("#ctl00_searchPanelContainer .showFilters");
        if (filtersButton.hasClass("show")) {
            width = width - $("#ctl00_searchPanelContainer").width() - 100;
        } else {
            width = width - 100;
        }

        if (overridingChartHeight > 0) {
            height = overridingChartHeight;
        }

        if (overridingChartWidth > 0) {
            width = overridingChartWidth;
        }

        chartDiv.width(width);
        chartDiv.height(height);

        //resize the charts on the page
        $(Highcharts.charts)
            .each(function(i, chart) {
                if (typeof (chart) != "undefined") {
                    try {
                        chart.setSize(width, height);
                    } catch (e) {
                        ShowError(e);
                    }
                }
            });

        setTimeout(NudgeChart, 1000);
    }
}

// no idea why but sometimes the end of the chart gets chopped off after resizing. This makes it redraw to get rid of the issue.
function NudgeChart() {
    $(Highcharts.charts)
        .each(function(i, chart) {
            if (typeof (chart) != "undefined") {
                try {
                    chart.redraw();
                } catch (e) {
                    ShowError(e);
                }
            }
        });
}

//Export buttons

$(function() {
    var chartsContainer = $('.highcharts-container');
    if (chartsContainer.length > 0) {
        var chart = chartsContainer.highcharts();
        //Print button
        $("#btnPrint")
            .bind('click',
                function(event) {
                    chart.print();
                });
        //export button
        $("#btnExport")
            .bind('click',
                function(event) {
                    if ($(this).attr('attr') == 'pdf') {
                        chart.exportChart({ type: "application/pdf" });
                    } else if ($(this).attr('attr') == 'image') {
                        chart.exportChart({ type: "image/jpeg" });
                    }
                });

        $('#button')
            .click(function() {
                var chart = $('#container').highcharts();
                chart.exportChart({
                    type: 'application/pdf',
                    filename: 'my-pdf'
                });
            });
    }
});

function PrintChart() {
    var chart = $('#chartDiv').highcharts();
    chart.print();
};

function SetAxisTitle(title) {
    var chart = $('#chartDiv').highcharts();
    chart.yAxis[0].setTitle({ text: title });
};

function ExportChart(type, defaultTitle) {
    var chart = $('#chartDiv').highcharts();

    var title = defaultTitle || 'IHS-Market-Forecast-Chart';
    if (title.startsWith("IHS") === false) {
        title = "IHS-" + title;
    }

    type = type.toUpperCase();

    var fileType = {
        PDF: 'application/pdf',
        JPEG: 'image/jpeg',
        JPG: 'image/jpeg',
        PNG: 'image/png',
        SVG: 'image/svg+xml'
    };

    chart.exportChart({
        type: fileType[type] || 'image/png',
        filename: title
    });
};

if (!window.ChartSeriesClick) {
    window.ChartSeriesClick = function() {};
}

/**
 * @license @product.name@ JS v@product.version@ (@product.date@)
 * Plugin for displaying a message when there is no data visible in chart.
 *
 * (c) 2010-2014 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */

(function(H) { // docs
    var seriesTypes = H.seriesTypes,
        chartPrototype = H.Chart.prototype,
        defaultOptions = H.getOptions(),
        extend = H.extend;

    // Add language option
    extend(defaultOptions.lang,
    {
        noData: 'No data to display'
    });

    // Add default display options for message
    defaultOptions.noData = {
        position: {
            x: 0,
            y: 0,
            align: 'center',
            verticalAlign: 'middle'
        },
        attr: {
        
        },
        style: {
            fontWeight: 'normal',
            fontSize: '35px',
            color: '#dddddd'
        }
    };

    /**
     * Define hasData functions for series. These return true if there are data points on this series within the plot area
     */
    function hasDataPie() {
        return !!this.points.length; /* != 0 */
    }

    if (seriesTypes.pie) {
        seriesTypes.pie.prototype.hasData = hasDataPie;
    }

    if (seriesTypes.gauge) {
        seriesTypes.gauge.prototype.hasData = hasDataPie;
    }

    if (seriesTypes.waterfall) {
        seriesTypes.waterfall.prototype.hasData = hasDataPie;
    }

    H.Series.prototype.hasData = function() {
        return this.dataMax !== undefined && this.dataMin !== undefined;
    };

    /**
     * Display a no-data message.
     *
     * @param {String} str An optional message to show in place of the default one
     */
    chartPrototype.showNoData = function(str) {
        var chart = this,
            options = chart.options,
            text = str || options.lang.noData,
            noDataOptions = options.noData;

        if (!chart.noDataLabel) {
            chart.noDataLabel = chart.renderer.label(text, 0, 0, null, null, null, null, null, 'no-data')
                .attr(noDataOptions.attr)
                .css(noDataOptions.style)
                .add();
            chart.noDataLabel.align(extend(chart.noDataLabel.getBBox(), noDataOptions.position), false, 'plotBox');
        }
    };

    /**
     * Hide no-data message
     */
    chartPrototype.hideNoData = function() {
        var chart = this;
        if (chart.noDataLabel) {
            chart.noDataLabel = chart.noDataLabel.destroy();
        }
    };

    /**
     * Returns true if there are data points within the plot area now
     */
    chartPrototype.hasData = function() {
        var chart = this,
            series = chart.series,
            i = series.length;

        while (i--) {
            if (series[i].hasData() && !series[i].options.isInternal) {
                return true;
            }
        }

        return false;
    };

    /**
     * Show no-data message if there is no data in sight. Otherwise, hide it.
     */
    function handleNoData() {
        var chart = this;
        if (chart.hasData()) {
            chart.hideNoData();
        } else {
            chart.showNoData();
        }
    }

    /**
     * Add event listener to handle automatic display of no-data message
     */
    chartPrototype.callbacks.push(function(chart) {
        H.addEvent(chart, 'load', handleNoData);
        H.addEvent(chart, 'redraw', handleNoData);
    });
}(Highcharts));