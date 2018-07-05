
var OilChart = function () {
    var self = this;

    self.Populate = function () {
        var chartDiv = $('#oilChart');
        if (chartDiv.length > 0) {

            var loadLogo = function () {
                var _this = this;
                var $svg = $(this.renderer.box);
                if ($svg.find(".chartLogo").length) { return; }

                var isPrinting = $svg.find('.highcharts-title').length > 0;

                if (isPrinting) {
                    $svg.find('.highcharts-tracker').remove();
                }
            };

            chartDiv.highcharts('StockChart', {
                chart: {
                    zoomType: 'xy',
                    events: {
                        load: loadLogo
                    }
                },
                rangeSelector: {
                    selected: 0,
                    inputEnabled: false,
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]

                },
                legend: {
                    enabled: true,
                    y: -5
                },
                xAxis: {
                    tickInterval: 24 * 3600 * 1000,
                    type: "datetime",
                    showLastLabel: false
                },
                yAxis: {
                    labels: { format: '{value:,.0f}' },
                    title: { text: 'US$' },
                    floor: 0
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>US${point.y}</b><br/>',
                    valueDecimals: 2
                },
                credits: {
                    text: 'Oil price data copyright of IHS Markit, all rights reserved. Unauthorised reproduction prohibited. If null value is displayed, please wait for actualisation.',
                    href: '',
                    position: {
                        align: 'center'
                    },
                    style: {
                        fontSize: '8pt',
                        cursor: 'auto'
                    }
                },
                series: oilChartSeries,
                exporting: {
                    chartOptions: {
                        title: {
                            text: 'Oil Price'
                        },
                        rangeSelector: { enabled: false }
                    }
                }
            });
        }
    }
};

if (typeof WidgetBase === 'function') {
    OilChart.prototype = new WidgetBase();
}

OilChart.prototype.onWidgetLoaded = function () {
    var self = this;
    self.Populate();
}