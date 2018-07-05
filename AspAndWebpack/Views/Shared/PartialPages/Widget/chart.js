var chartVM = function (chartId, modalId) {

  var self = this;
  self.chart = $("#" + chartId);
  self.chartId = chartId;
  self.modalId = modalId;
  self.chartData = {};
}

if (typeof WidgetBase === 'function') {
  chartVM.prototype = new WidgetBase();

}

chartVM.prototype.onWidgetExpand = function () {
  this.redrawChart();
  $(".hide-on-maximize").hide();
  $(".show-on-maximize").show();
}

chartVM.prototype.onWidgetMinify = function () {
  this.redrawChart();
  $(".hide-on-maximize").show();
  $(".show-on-maximize").hide();
}

chartVM.prototype.onDashboardResize = function () {
  this.redrawChart();
}

chartVM.prototype.chartInit = function (data) {
  this.chartData = data;
  data.colors = ["#d8dcdb", "#a2caec", "#103C68", "#96bc33", "#ecee9a", "#ffdd7f", "#f7bfad", "#2a78a8", "#bed158", "#FCB94D", "#a1abb2", "#e98756", "#f7941d", "#3a4e58", "#f04e23", "#0097D1"]
  data.chart.type = 'column';
  data.yAxis[0] = {
    title: {
      text: data.yAxis[0].title.text
    }
  };
  data.navigation = {
    buttonOptions: {
      enabled: false
    }
  };
  data.plotOptions = {
    series: {
      marker: {
        enabled: false
      },
      stacking: 'normal'
    }
  };
  data.credits.enabled = false;
  data.exporting.enabled = false;

  new CMPHiChart(data);
  var chartDivDT = ".chartDivDataTable";
  if (data.target_div_id && data.target_div_id != null) {
    chartDiv = "." + data.target_div_id;
    chartDivDT = "." + data.target_div_id + "DataTable";
  }

  if ($(chartDivDT).length > 0) {
    $(chartDivDT).html(data.htmlDataTable);
  }
};


chartVM.prototype.toggleLegend = function () {
  var chart = this.chart.highcharts();
  var legend = chart.legend;
  if (legend.display) {
    legend.group.hide();
    legend.display = false;
  } else {
    legend.group.show();
    legend.display = true;
  }
}


chartVM.prototype.redrawChart = function () {
  var chart = this.chart.highcharts();
  chart.reflow();
}

chartVM.prototype.exportChart = function (data) {
  var chart = this.chart.highcharts();

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
}

chartVM.prototype.printChart = function () {
  var chart = this.chart.highcharts();
  chart.print();
}



chartVM.prototype.UpdateChart = function (type, idx) {
  var self = this;

  // before we send, we need to ensure we remove the series data
  // and remove as much as possible from the chart object so that we don't blow query string limits
  try {
    self.chartData.series = null;
    self.chartData.htmlDataTable = null;
    self.chartData.yAxis = null;
    self.chartData.xAxis = null;
    self.chartData.colors = null;
    self.chartData.legend = null;
    self.chartData.plotOptions = null;
  }
  catch (e) {; }
  var typeObj = {};
  if (type instanceof Object) {
    typeObj = type;
    idx = typeObj.value;
    type = typeObj.type;
  }

  if (type !== null) {
    self.chartData.search[type] = {};
    if (idx !== null) {
      self.chartData.search[type].Value = idx;
    }
  }

  if (typeObj.type2) {
    self.chartData.search[typeObj.type2] = {};
    if (typeObj.value2 !== null) {
      self.chartData.search[typeObj.type2].Value = typeObj.value2;
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
    chartDataJson: JSON.stringify(self.chartData)
  };
  $.ajax({
    url: "/BudgetsChart/ChangeChart",
    method: "POST",
    data: data
  }).done(function (data) {
    self.chart.highcharts().hideLoading();
    self.chartData = JSON.parse(data);
    new CMPHiChart(self.chartData);
  })
  .fail(function () {
    console.log(arguments);
  });
  self.chart.highcharts().showLoading();
}