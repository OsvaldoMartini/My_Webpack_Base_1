/**
 * A function view model to handle changes within a chart view page.
 * @param {string} containerId - The container which the view model is applied to.
 * @param {string} queryString - The search query string.
 */
var ChartPageVM = function (containerId, queryString, divToAddChartsTo, applyBindings) {
    var self = this;
    var search = new Search({
        queryString: queryString
    });

    self.applyBindings = applyBindings || true;
    self.search = search;
    self.divToAddChartsTo = divToAddChartsTo;
    self.charts = ko.observableArray([]);
    var searchOptions = {
        redirect: false,
        allowAdvancedSearch: true
    };
    self.searchBarVM = new SearchBarVM(search, searchOptions);

    //change from the default 'search/getResults?'
    search.updateBaseGetResultsUrl("Chart/getResults?");
    self.container = document.getElementById(containerId);
    //search panel
    self.facetsVM = new FacetsVM(search);
    self.ToggleLegend = function (chart) {
        $('#' + chart.chartdivId + ' .highcharts-legend').toggle();
    };
    self.ToggleDataTable = function (chart) {
        $('#' + chart.chartDataTableDiv).toggleClass("hidden");
    };
    self.PrintChart = function (chart) {
        var c1 = $('#' + chart.chartdivId);
        c1.highcharts().print();
    };

    self.ExportChart = function (type, chartObject) {

        var chart = $('#' + chartObject.chartdivId).highcharts();
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
            filename: 'IHS-Chart'
        });
    };
 
    self.RenameChart = function (chart) {
        var c1 = chart.cmpHiChart;
        var modal = $('#renameChart');
        var textBox = $('input', modal);
        var saveBtn = $('.btn-primary', modal);
        var onClick = function () {
            try {
                var newTitle = textBox.val();
                if (newTitle != "" && newTitle != c1.chartobject.title) {
                    c1.chartobject.title = { text: newTitle, subtitle: c1.chartobject.subtitle };
                    c1.UpdateChart(false);
                }

            } catch (e) {
                ;
            }

            modal.modal('hide');
        };
        saveBtn.off('click');
        saveBtn.on('click', onClick);
        textBox.val(c1.chartobject.title.text);
        modal.on('shown.bs.modal', function () {
            textBox.focus();
        });
        modal.modal({ backdrop: false });
        return;


    };
    self.getBreadcrumbString = function () {
        var crumbstring = "";
        for (var i = 0; i < this.facetsVM.breadcrumbs().length; i++) {
            crumbstring += this.facetsVM.breadcrumbs()[i].displayText() + " ";
        }
        return crumbstring;
    };
    /**
     * Add a 
     * @param {string} id - The id of the dom element.
     * @param {bool} remove - If true, remove from the array.
     */
    self.saveSearch = function () {
        self.commandsVM.saveSearch();
    };
    self.commandsVM = new CommandsVM(search, { commandsType : 'chart' });
    self.addChartToArray = function (id, remove) {
        var searchQuery = window.location.search.substring(1) + window.location.hash;
        if (remove == true) {
            for (var i = 0; i < self.charts().length; i++) {
                if (self.charts()[i].chartAreaId == id) {
                    self.charts.remove(self.charts()[i]);
                    break;
                }
            }
            var chartCount = self.charts().length;
            if (chartCount == 1) {
                self.charts()[0].Reflow();
            }
            return true;
        }
        var newchart = new cmpChartVM(containerId, queryString, search, "chart_" + id, id, "JTICONLINEEVENTS");
        self.charts.push(newchart);

        var chartCount = self.charts().length;
        if (chartCount == 2) {
                self.charts()[0].Reflow();
        }

        newchart.UpdateChart(searchQuery, self.getBreadcrumbString());
        return true;
    };

    self.ExportDataTable = function (tableId) {
        var title = "";

        var markup = $('#' + tableId.chartDataTableDiv + ' table.hichartDataTable').html();
        markup = markup.replace(/&amp;/gi, "&");//remove html & and replace with normal &

        //$('#chartMarkupField').val(title + "<table>" + markup + "</table>");
        if ($('#chartMarkupForm').length == 0) {
            $('body')
               .append('<form id="chartMarkupForm"></form>'); //append a new form element with id mySearch to <body>
            $('#chartMarkupForm')
                .attr("method", "post")
                .attr("target", "_blank")
                .attr("action", "/TerrorismInsurgencyEvents/Download/MarkUp/ChartTableData/xlsx")
                //add in all the needed input elements
                .append('<input type="hidden" name="markup" id="chartMarkupField"  >');

        }
        $('#chartMarkupField').val(title + "<table>" + markup + "</table>");
        //  $('form[name="chartMarkupForm"]').submit();
        $('#chartMarkupForm').submit();
    };


    self.availableChartsVM = new AvailableChartsVM(self.addChartToArray);
    //self.searchBarVM = new SearchBarVM(search);
    //tabs on the top
    self.filterTabsVM = new FilterTabsVM(search);

    self.tutorial = new TutorialVM({
        cookie: "IHS_POPUP_EDCD83EA-9ADE-44DC-8D41-9B2333C313D6",
        name: "ChartTutorial",
        maxPages: $('.startHint').length
    });

    self.startTutorial = function () {
        self.tutorial.start();
    };

    if (applyBindings) {
        ko.applyBindings(self, self.container);
        $(".with-data-bind").each(function () {
                if (ko.dataFor(this)) return;
                ko.applyBindings(self, this);
            });
    } 

    search.updateResults(search.updateRequestSender.pageLoad);
    self.search.registerFinishedCallback(function updatecharts(result, updateRequestSender) {
        //get the hash into teh request
        var searchQuery = window.location.search.substring(1) + window.location.hash;
        //  var facets = self.facetsVM.getFacetsFromSearch();
        //  var facetString = self.facetsVM.encodeFacets(facets);
        for (var i = 0; i < self.charts().length; i++) {
            self.charts()[i].UpdateChart(searchQuery, self.getBreadcrumbString());
        }
    });

    $(document).on('click', '#chartslist', function (e) {
        e.stopPropagation();
    });
};
