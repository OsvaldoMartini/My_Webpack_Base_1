var chartVM = function (chartId, modalId, toggleLegend, controller, options) {
    var self = this;
    self.chart = $("#" + chartId);
    self.chartId = chartId;
    self.modalId = modalId;
    self.chartData = {};
    self.toggleLegend = !!toggleLegend;
    self.controller = controller;
    self.showLegendToggle = ko.observable(true);
    self.options = options || {};
};

if (typeof WidgetBase === 'function') {
    chartVM.prototype = new WidgetBase();
}

chartVM.prototype.onWidgetExpand = function (container) {
    this.redrawChart();
    $(container).find(".hide-on-maximize").hide();
    $(container).find(".show-on-maximize").show();
};

chartVM.prototype.onWidgetMinify = function (container) {
    this.redrawChart();
    $(container).find(".hide-on-maximize").show();
    $(container).find(".show-on-maximize").hide();
};

chartVM.prototype.onDashboardResize = function () {
    this.redrawChart();
};

chartVM.prototype.onWidgetResize = function () {
    this.redrawChart();
};

chartVM.prototype.chartInit = function (data) {
    var self = this;
    self.chartData = data;
    if (data == null || data === undefined || data.length === 0) {
        self.loadNoDataMessage();
    } else {
        if (self.toggleLegend) {
            if (!data.legend) {
                data.legend = {};
            }
            data.legend.align = 'center';
            data.legend.adjustChartSize = true;
            data.legend.verticalAlign = "bottom";
        }

        new CMPHiChart(data);
        var chartDivDT = ".chartDivDataTable";
        if (data.target_div_id && data.target_div_id != null) {
            chartDiv = "." + data.target_div_id;
            chartDivDT = "." + data.target_div_id + "DataTable";
        }

        if ($(chartDivDT).length > 0) {
            $(chartDivDT).html(data.htmlDataTable);
        }

        if (data.legend)
        {
            self.showLegendToggle(data.legend.enabled !== false);
        }

        if (self.toggleLegend) {
            self.doToggleLegend(false);
        }

        if (self.onChartLoaded) {
            self.onChartLoaded();
        }

        var mainSearch = getMainSearch(self.chartData);
        self.changeLink(mainSearch);

        if(self.options.hideTitle){
            var chart = self.chart.highcharts();
            self.options.hideTitle = {
                title: chart.title.textStr,
                subtitle: (chart.subtitle || {}).textStr
            };
            self.resetForExport();
        }
    }
};

/**
 * Tries to retrieve an error message if the server call fails.
 */
chartVM.prototype.loadNoDataMessage = function () {
    var self = this;
    $.ajax({
        url: "/" + self.controller + "/NoData",
        method: "GET",
        async: true,
        cache: true
    })
    .done(function (data) {
        self.chart.parent().html(data);
    })
    .fail(function () {
        self.chart.parent().html("<div class=\"alert alert-danger text-center\">There is no data for this widget...</div>");
    });
};

chartVM.prototype.doToggleLegend = function (show) {
    var chart = this.chart.highcharts();
    var legend = chart.legend;

    if (!legend.group) {
        return;
    }

    var doShow = !legend.display;
    if (show === true || show === false) {
        doShow = show;
    }

    if (doShow) {
        legend.group.show();
        legend.display = true;
        legend.options.enabled = true;
    } else {
        legend.group.hide();
        legend.display = false;
        legend.options.enabled = false;
    }
    chart.chartHeight += legend.legendHeight * (-1 + 2 * legend.display);
    chart.marginBottom += legend.legendHeight * (-1 + 2 * legend.display);;
    chart.container.style.height = chart.container.firstChild.style.height = chart.chartHeight + 'px';

    chart.container.firstChild.setAttribute('height', chart.chartHeight);

    translateY = legend.group.attr('translateY') + legend.legendHeight * (-1 + 2 * legend.display);
    legend.group.attr('translateY', translateY);
    if (legend.group.alignAttr != undefined) {
        legend.group.alignAttr.translateY = translateY;
    }

    legend.positionCheckboxes();
};

chartVM.prototype.redrawChart = function () {
    var chart = this.chart.highcharts();
    if (chart) chart.reflow();
};

/**
 * Performs changes to the chart based on settings in options.
 * @param {bool} before A value indicating whether the is for before an export.
 */
chartVM.prototype.resetForExport = function (before) {
    var self = this;
    if (self.options.hideTitle) {
        var chart = self.chart.highcharts();
        if (before) {
            chart.setTitle({ text: self.options.hideTitle.title }, { text: self.options.hideTitle.subtitle });
        } else {
            chart.setTitle({ text: '' });
        }
    }
};

chartVM.prototype.exportChart = function (data) {
    var self = this;
    self.resetForExport(true);
    var chart = self.chart.highcharts();

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

    self.resetForExport();
};

chartVM.prototype.printChart = function () {
    var self = this;
    self.resetForExport(true);

    var chart = self.chart.highcharts();
    chart.print();
    self.resetForExport(false);

};

chartVM.prototype.ChangeChart = function (typeObj) {
    if (!typeObj) return;
    var self = this;

    // before we send, we need to ensure we remove the series data
    // and remove as much as possible from the chart object so that we don't blow query string limits
    try {
        self.chartData.series = null;
        self.chartData.htmlDataTable = null;
        self.chartData.yAxis = null;
        self.chartData.xAxis = null;
        //self.chartData.colors = null;
        self.chartData.legend = null;
        self.chartData.plotOptions = null;
    } catch (e) {;
    }

    var addTypeValueSearch = function (type, value, toggle, key) {
        var search = {};
        search.Name = type;
        if (value) {
            search.Value = value;
        }
        search.Key = key;

        var found = false;
        for (var i = 0; i < self.chartData.search.length; i++) {
            if (self.chartData.search[i].Name == search.Name) {
                if (toggle) {
                    if (self.chartData.search[i].Value === search.Value) {
                        search.Value = null;
                    }
                }

                self.chartData.search[i] = search;
                found = true;
                break;
            }
        }
        if (!found) {
            self.chartData.search.push(search);
        }
    };

    if (typeObj.type) {
        if ($.isArray(typeObj.type)) {
            for (var i = 0; i < typeObj.type.length; i++) {
                addTypeValueSearch(typeObj.type[i], typeObj.value[i], typeObj.toggle && typeObj.toggle[i]);
            }
        } else {
            addTypeValueSearch(typeObj.type, typeObj.value, typeObj.toggle, typeObj.key);
        }
    }

    if (typeObj.chartType) {
        self.chartData.target_grid_config_chart_area_id = typeObj.chartType;
    }
    if (typeObj.useHiStock !== null) {
        self.chartData.use_hi_stocks = !!typeObj.useHiStock;
    }

    var data = {
        dashboardType: 2,
        chartDataJson: JSON.stringify(self.chartData),
        widgetId: self.widgetId,
        changeData: JSON.stringify(typeObj)
    };
    $.ajax({
        url: "/" + self.controller + "/ChangeChart",
        method: "POST",
        data: data
    }).done(function (data) {
        self.chart.highcharts().hideLoading();
        self.chartData = JSON.parse(data);
        self.chartInit(self.chartData);

        var chart = self.chart.highcharts();
        if (!chart.legend || !chart.legend.group) {
            self.showLegendToggle(false);
        } else {
            self.showLegendToggle(true);
        }
    })
        .fail(function () {
        });
    self.chart.highcharts().showLoading();
};

chartVM.prototype.onChartLoaded = function () {
    var self = this;
    var search = self.chartData.search || [];
    var ProductionUnits = 'Production Units';
    for (var i = 0; i < search.length; i++) {
        if (search[i].Name == "ForecastType" && search[i].Value == "FT_PRODUCTION_UNITS" && self.chartData.yAxis[0].title.text != ProductionUnits) {
            self.chartData.yAxis[0].title = {
                text: ProductionUnits
            };
            self.chartData.yAxis[0].labels = {
                align: "left",
                format: '{value:,.0f}'
            };

            var tempTable = $('<div>').html(self.chartData.htmlDataTable);

            tempTable.find('#hiChartFooter').text(ProductionUnits);
            self.chartData.htmlDataTable = tempTable.html();

            self.chartInit(self.chartData);
            break;
        }
    }
};

chartVM.prototype.onSubjectChange = function (subject) {
    var self = this;

    var newSearch = getMainSearch(self.chartData);
    newSearch.value = subject;

    self.changeLink(newSearch);
    self.ChangeChart(newSearch);
}

var getMainSearch = function (data) {
    var search = data.search;
    var newSearch = { type: 'MainSearch', key: '', value: '' };
    for (var i = 0; i < search.length; i++) {
        if (search[i].Name != "MainSearch") continue;
        newSearch.key = search[i].Key;
        newSearch.value = search[i].Value;
        break;
    }
    if (!newSearch.key && data.cmp_viewName) {
        newSearch.key = data.cmp_viewName;
    }
    return newSearch;
}

chartVM.prototype.changeLink = function (search) {
    var self = this;
    var container = self.chart.parents('.widgetcontent').first();
    var links = $('.widgetfooter a.list-group-item', container);
    links.each(function () {
        var link = $(this);
        changeWidgetFooterLink(link, search.key, search.value);
    });
}


$(function () {
    /**
     * Highcharts plugin for adjustable chart height in response to legend height
     */
    (function (H) {
        H.wrap(H.Legend.prototype, 'render', function (proceed) {
            var chart = this.chart,
                translateY;

            proceed.call(this);

            if (this.options.adjustChartSize && this.options.verticalAlign === 'bottom') {
                if (this.legendHeight + chart.plotHeight + chart.plotTop > chart.chartHeight) {
                    chart.chartHeight += this.legendHeight;
                    chart.marginBottom += this.legendHeight;
                    chart.container.style.height = chart.container.firstChild.style.height = chart.chartHeight + 'px';
                    chart.container.firstChild.setAttribute('height', chart.chartHeight);

                    translateY = this.group.attr('translateY') + this.legendHeight;
                    this.group.attr('translateY', translateY);
                    this.group.alignAttr.translateY = translateY;

                    this.positionCheckboxes();
                }
            }
        });
    })(Highcharts);
});