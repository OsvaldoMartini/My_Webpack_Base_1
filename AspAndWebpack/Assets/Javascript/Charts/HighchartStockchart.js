window.HighchartStockchart = function (options) {
    options = options || {};
    this.options = options;
}

if (typeof WidgetBase === 'function') {
    window.HighchartStockchart.prototype = new WidgetBase();
}

window.HighchartStockchart.prototype.build = function () {
    new Highcharts.Chart(this.options);
}

window.HighchartStockchart.prototype.onWidgetExpand = function () {
    alert('bigger');
};

window.HighchartStockchart.prototype.onWidgetMinify = function () {
    alert('smaller');
};