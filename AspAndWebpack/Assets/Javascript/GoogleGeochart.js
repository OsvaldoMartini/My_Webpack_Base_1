var googleGeochart = null;
var googleGeochartData = null;
var divGoogleGeochartControl = null;
var googleChartConfig = null;
var googleGeochartDataColumnName = null;
// flag to let something else draw the chart
var override_drawGoogleGeoChart = false;

var regionArray = [ 
    "World_world",
    "Africa_002",
    "Northern Africa_015",
    "Western Africa_011",
    "Middle Africa_017",
    "Eastern Africa_014",
    "Southern Africa_018",
    "Americas_019",
    "Northern America_021",
    "Caribbean_029",
    "Central America_013",
    "South America_005",
    "Asia_142",
    "Central Asia_143",
    "Eastern Asia_030",
    "Southern Asia_034",
    "South-Eastern Asia_035",
    "Western Asia_145",
    "Europe_150",
    "Northern Europe_154",
    "Western Europe_155",
    "Eastern Europe_151",
    "Southern Europe_039",
    "Oceania_009",
    "Australia and New Zealand_053",
    "Melanesia_054",
    "Micronesia_057",
    "Polynesia_061",
    "US Only_US"
];

var geoInitialDraw = false;
$(document).ready(function () {
    $(document).bind('ResizeEventCalled',
            function (e) {
                if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 8)) {
                    if (geoInitialDraw) {
                        drawGoogleGeochart();
                    }
                }
            });
});

function drawGoogleGeochart() {
    
    $('#divLoading').show();

    if (override_drawGoogleGeoChart) {
        //alert('something else is drawing the chart as override_drawGoogleGeoChart is set to true');
        return;
    }

    var options = {};
    var colorAxisOptions = {};

    divGoogleGeochartControl = GetObject("divGoogleGeochartControl");

    if (divGoogleGeochartControl != null) {
        googleChartConfig = jQuery.parseJSON(divGoogleGeochartControl.attributes[name = 'configurationJson'].value);
        googleGeochartData = parseChardData(divGoogleGeochartControl.attributes[name = 'data'].value);

        options.keepAspectRatio = true;
        options.backgroundColor = googleChartConfig.background_color;
        options.datalessRegionColor = googleChartConfig.dataless_region_color;


        colorAxisOptions.colors = new Array();
        var axisColors = googleChartConfig.axis_colors.split(",");
        for (i = 0; i < axisColors.length; i++) {
            colorAxisOptions.colors[i] = axisColors[i];
        }

        if (googleChartConfig.reverse_axis_colors) colorAxisOptions.colors.reverse();

        options.colorAxis = colorAxisOptions;

        var tooltipOptions = {};
        var textStyleOptions = {};
        textStyleOptions.fontName = "'Arial'";
        textStyleOptions.fontSize = "16";

        tooltipOptions.textStyle = textStyleOptions;
        options.tooltip = tooltipOptions;

        //Set mode
        var ddlMode = GetObject('ctl00_mainContent_GoogleGeochart_dropDownListMode');
        if (ddlMode != null && ddlMode.value != "") {
            options.displayMode = ddlMode.value;
        }
        else {
            options.displayMode = 'regions';
        }
        
        //Set region
        var ddlRegion = GetObject('ctl00_mainContent_GoogleGeochart_dropDownListRegion');
        if (ddlRegion != null && ddlRegion.value != "") {
            options.region = ddlRegion.value;
        }
        else {
            var regionConfiguraton = regionArray[googleChartConfig.region].split("_");
            options.region = regionConfiguraton[1];
        }

        if (options.region == "US") {
            options.resolution = "provinces";
        }

        if (bowser.msie && parseInt(bowser.version, 10) <= 8) {
            $("div #divGoogleGeochart").css('height', '500px');
        }

        divGoogleGeochart.innerHTML = ""; //empty content first for resize to work correctly
        googleGeochart = new google.visualization.GeoChart(divGoogleGeochart);
        googleGeochart.draw(googleGeochartData, options);
        google.visualization.events.addListener(googleGeochart, 'select', geochartSelectHandler);
        google.visualization.events.addListener(googleGeochart, 'error', geochartErrorHandler);
        google.visualization.events.addListener(googleGeochart, 'ready', geochartReadyHandler);

        geoInitialDraw = true;
    }
}


function geochartErrorHandler(err) {
    $('#'+err.id).remove();

}

function geochartReadyHandler() {
    $('#divLoading').hide();
}


function geochartDoAction() {
    var ddlAction = GetObject('ctl00_mainContent_GoogleGeochart_dropDownListAction');
    CMPPostback('geochartDoAction', ddlAction.value);
}

function geochartSelectHandler() {

    if (googleChartConfig.can_select) {
        var selection = googleGeochart.getSelection();

        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            if (item.row != null && item.column != null) {
                var str = googleGeochartData.getFormattedValue(item.row, item.column);
            } else if (item.row != null) {
                var str = googleGeochartData.getFormattedValue(item.row, 0);
            } else if (item.column != null) {
                var str = googleGeochartData.getFormattedValue(0, item.column);
            }
        }

        CMPPostback('mapclicked', str);
    }
}

function parseChardData(data) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Location');

    if (googleGeochartDataColumnName == null) {
        googleGeochartDataColumnName = 'Value';
    }

    dataTable.addColumn('number', googleGeochartDataColumnName);

    var dataRows = data.split("|");

    for (var i = 0; i < dataRows.length; i++) {

        var dataColumn = dataRows[i].split("=");

        if (dataColumn[0] != null && dataColumn[0] != "") {
            dataTable.addRow([dataColumn[0], Number(dataColumn[1])]);
        }
    }

    return dataTable;
}
