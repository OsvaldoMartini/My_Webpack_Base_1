Highcharts.SparkLine = function (options, callback) {
    var defaultOptions = {
        chart: {
            renderTo: (options.chart && options.chart.renderTo) || this,
            backgroundColor: null,
            borderWidth: 0,
            type: 'area',
            margin: [2, 0, 2, 0],
            height: 30,
            style: {
                overflow: 'visible'
            },
            skipClone: true
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        xAxis: {
            labels: {
                enabled: false
            },
            title: {
                text: null
            },
            startOnTick: false,
            endOnTick: false,
            tickPositions: []
        },
        yAxis: {
            endOnTick: false,
            startOnTick: false,
            labels: {
                enabled: false
            },
            title: {
                text: null
            },
            tickPositions: [0]
        },
        legend: {
            enabled: false
        },
        tooltip: {
            backgroundColor: null,
            borderWidth: 0,
            shadow: false,
            useHTML: true,
            hideDelay: 0,
            shared: true,
            padding: 0,
            positioner: function (w, h, point) {
                return { x: point.plotX - w / 2, y: point.plotY - h };
            }
        },
        plotOptions: {
            series: {
                animation: false,
                lineWidth: 1,
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                marker: {
                    radius: 1,
                    states: {
                        hover: {
                            radius: 2
                        }
                    }
                },
                fillOpacity: 0.25
            },
            column: {
                negativeColor: '#910000',
                borderColor: 'silver'
            }
        },
        exporting: { enabled: false }
    };
    options = Highcharts.merge(defaultOptions, options);

    return new Highcharts.Chart(options, callback);
};

var timeTrendVM = function ($container) {
    var self = this;
    this.$sparklines = $("[data-sparkline]", $container);
    var len = self.$sparklines.length,
    $sparkline,
    stringdata,
    data,
    chart;

    for (i = 0; i < len; i += 1) {
        $sparkline = $(self.$sparklines[i]);
        stringdata = $sparkline.data('sparkline');
        data = $.map(stringdata.split(','), function (val) {
            var parts = val.split(':');
            return parseFloat(parts[1]);
            return { x: parts[0], y: parseFloat(parts[1]) };
        });
        chart = {};
        $sparkline.highcharts('SparkLine', {
            series: [{
                data: data,
                pointStart: 1
            }],
            tooltip: {
                enabled: false
            },
            chart: chart
        });

        //Ensure the sparkline gets recentered when the user changes the window size
        $(window).on("resize", function () {
            $sparkline.highcharts().reflow();
        });
    }
};

//If we can, register the functions super class as the widget base. Allows for specific events to be raised.
//e.g. onDashboardResize, onWidgetExpand, onWidgetMinify, onWidgetRemove
if (typeof WidgetBase === 'function') {
    timeTrendVM.prototype = new WidgetBase();
}

timeTrendVM.prototype.onDashboardResize = function () {
    for (var i = 0; i < self.$sparklines; i++) {
        $sparkline = $($sparklines[i]);
        $sparkline.highcharts().reflow();
    }
};