var jdbGridChartVM = function (search, parent) {
    //set a flag to show all filters in the modal filter box. 
    parent.ShowDataFacetExplorer = true;
    //var jdbGridChartVM = function (options, searchQuery) {
    var self = this;
    setupSettings();
    self.firstGridLoad = true;
    self.search = search;
    self.resultsVM = parent;
    self.GuidedBeta = false;
    parent.options.userSettings = $.extend({}, {
        ApplyJDSFPGo: false,
        EnableInflation: true,
        EnableCommercialAircraftDiscount: true,
        Currency: '',
        ApplyRetroColourPalette: false,
        ApplyChartGrouping: true
    }, parent.options.userSettings);

    // Data
    self.PGo_On = ko.observable(!parent.options.userSettings.ApplyJDSFPGo);
    self.Inflate = ko.observable(parent.options.userSettings.EnableInflation);
    self.DiscountRate = ko.observable(parent.options.userSettings.EnableCommercialAircraftDiscount);
    self.CAGR = false;
    self.DefenceSegment = ko.observable(self.settings.defenceSegments[0]);
    self.ForecastType = ko.observable(self.settings.forecastType[0]);
    self.Currency = ko.observable(_.findWhere(self.settings.currencies, {
        key: parent.options.userSettings.Currency || ''
    }));
    self.ApplyRetroColourPalette = ko.observable(parent.options.userSettings.ApplyRetroColourPalette || false);
    window.useRetroColours = self.ApplyRetroColourPalette();
    self.LimitToTenSeries = ko.observable(parent.options.userSettings.ApplyChartGrouping);
    self.chartWillIgnoreCallbacksCount = 1;
    self.CustomAttributes = ko.observableArray([]);
    self.CustomSegments = ko.observableArray([]);
    self.savedSearchesVM = new SavedSearchesVm();
    self.FacetsSearcher = new FacetsSearcher(self.search);
    // Page View
    self.viewChart = ko.observable(true);
    self.viewGrid = ko.observable(true);

    self.chartFullscreen = ko.observable(false);
    self.chartDataTable = ko.observable(false);
    self.editChartTitle = ko.observable(false);

    self.subCharts = new SubChartsVM(self);
    self.lastSearchDateTime = new Date();

    

    self.currentUnit = ko.observable();
    self.TopTenProgramData = ko.observableArray([]);
    self.RegisterUrlReview = function () {
        var self = this;
        self.search.registerQueryStringExtendCallback(self.GetJDBSpecifcHints);
    }

    // *guided stuff**************************************************************88
    // ********************************************************************88
    // ********************************************************************88
    // ********************************************************************88

    //testing this stuff
    self.chartLoadingColourInterval = null;
    self.startChartLoadingTimer = function () {
        return;

        self.chartLoadingColourInterval = setInterval(function () {
            $(".chartLoading").css("background-color", "rgb(100,100,100)");
        }, 50);

        setTimeout(function () {
            clearInterval(self.chartLoadingColourInterval);
        }, 8000);
    }

    self.startChartLoadingTimer();

    self.ctrlKeyDown = ko.observable(false);
    self.SetupGuidedBeta = function () {
        $(document).bind('keydown', function (event) {

            self.ctrlKeyDown(event.ctrlKey);
        });
        $(document).bind('keyup', function (event) {

            self.ctrlKeyDown(event.ctrlKey);
        });

        $(document).bind('keypress', function (event) {
            if (event.target.type == "text")
                return;

            if (event.which === 67 && event.shiftKey) {
                self.viewChart(!self.viewChart());

                if (!self.viewChart())
                    _.each(pendingChartRequests, function (xhr) {
                        xhr.abort();
                    });
            } else if (event.which === 71 && event.shiftKey) {
                self.viewGrid(!self.viewGrid());
            } else if (event.which === 65 && event.shiftKey) {
                self.subCharts.addChartToBeta();
            } else if (event.which === 86 && event.shiftKey) {
                vm.facetsVM.showFacetsModal();
            }
            else if (event.which === 69 && event.shiftKey) {
                var subChartVm = _.find(vm.gridChartVM.subCharts.charts(), function (cht) {
                    return cht.active();
                });
                if (subChartVm) {// shift e
                    subChartVm.edit();
                    /**  $('#' + subChartVm.chartdivId + '_edit').clEEick();**/
                    $('#addChartChooseAttributesDiv').modal();
                }

            }
            else if (event.which === 68 && event.shiftKey) {
                //shift d
                var subChartVm = _.find(vm.gridChartVM.subCharts.charts(), function (cht) {
                    return cht.active();
                });

                if (subChartVm) {
                    subChartVm.remove();
                }
            }
            else if (event.which === 82 && event.shiftKey) {
                //shift r
                // remove all charts on this lens and remove all the filters
                var lensName = vm.gridChartVM.subCharts.currentLens().name;
                for (var i = vm.gridChartVM.subCharts.charts().length - 1; i >= 0; i--) {
                    var cht = vm.gridChartVM.subCharts.charts()[i];
                    if (cht && cht.lens == lensName) cht.remove();
                }
                //remove all facets
                vm.facetsVM.clearAppliedFacets();

            }
            else if (event.which === 81 && event.shiftKey) {
                //shift q
                self.FacetsSearcher.visible(!self.FacetsSearcher.visible());

            }
            //else alert(event.which)
        });

        self.MarkLensesAsWasOpen = function () {

            //var counter = 0;
            //_.each(self.resultsVM.facetsVM.facetPanels(), function (fp) {
            //    _.extend(fp, {
            //        lastVisibleDateTime: new Date()
            //    });
            //    _.each(fp.facets(), function (f) {
            //        if (counter < 2) {
            //            // flag it for when it comes in focus
            //            _.extend(f, {
            //                wasOpen: true
            //            });
            //        }
            //        counter++;
            //    });
            //    counter = 0;
            //});
        }
        self.subCharts.drawDemoChart();

        var showFirstTab = _.once(function () {
            self.loadingFirstTab = true;
            //remove help links from facets - done in config as well but this is b&b
            //$('.facetsContainer .icon-help-circled').remove();

            self.MarkLensesAsWasOpen();

            self.ChangeLens(self.lenses()[0], self.resultsVM);

            // find out if charts are being shown, if so turn them off for a bit to save multiple events.
            var viewChart = self.viewChart();
            self.viewChart(false);

            _.delay(function () { self.subCharts.SetupCharts(); }, 1000);


            if (viewChart) _.delay(function () {
                self.viewChart(true);
            }, 500);

            // Show the container where the facets go, now they have loaded.
            $('#myTabContent').show();

            //hide the tab headers
            //self.resultsVM.facetsVM.isPanelHeadersVisible(false);

            //unhide the charts container - nb still hidden if charts not being viewed (gridonly)
            _.delay(function () { $('#subchartContainer').removeClass("hidden") }, 2000);

            //show the chartRefinerDiv for the moment
            $('#subchartsContainer').removeClass("hidden");
            self.loadingFirstTab = false;



        });

        self.search.registerFinishedCallback(function () {
            $('#filter').css("opacity", 1);
            showFirstTab();
        });
        self.search.registerStartCallback(function () {
            $('#filter').css("opacity", 0.7);
        });

        var removeClassicFacets = function () {
            _.times(self.resultsVM.facetsVM.facetPanels()[0].facets().length, function () {
                self.resultsVM.facetsVM.facetPanels()[0].facets().pop();
            })
            _.times(self.resultsVM.facetsVM.facetPanels()[1].facets().length, function () {
                self.resultsVM.facetsVM.facetPanels()[1].facets().pop();
            })
        }

        // $(document).bind('FacetsProcessed', showFirstTab);
        //$(document).bind('FacetsProcessed', removeClassicFacets);
        $(document).bind('FacetsProcessed', function () {
            self.lastSearchDateTime = new Date();
            //mark the current selected lens lastSearch date time to now also, so we dont have to reload if we go elsewhere then return instantly.
            _.each(self.resultsVM.facetsVM.facetPanels(), function (fp) {
                if (fp.selected()) {
                    fp.lastVisibleDateTime = new Date();
                }
            });
            // Guided Nav - Ensure that the correct facet panel is displayed once the facets have been processed
            if (self.currentLens) {
                self.ChangeLens(self.currentLens);
            }
        });

    }

    self.lens = function (name, tooltip, cssClass, attribute_hierarchy, disabled) {
        return {
            name: name,
            tooltip: tooltip,
            cssClass: cssClass,
            selected: ko.observable(false),
            attribute_hierarchy: attribute_hierarchy,
            disabled: (disabled == true ? true : false)
        };
    }
    self.availbleChartTypes = ko.observableArray([]);
    self.availbleChartTypes.push({ name: "Activity", tooltip: "Change to a activity based chart", x: "TIMELINE", y:"FT_TOTAL_PROGRAM", g:"DEFENCE" });
    self.availbleChartTypes.push({ name: "Force", tooltip: "Change to a force based chart", x: "TIMELINE", y:"FT_TOTAL_PROGRAM", g:"PLANNING_PHASE" });
    self.changeChartTab = function (chartTab) {
        self.subCharts.ClearCharts();
        self.subCharts.AddChartWithDetails(chartTab.x, "", chartTab.g, null);
    }

    self.lastTabClicked = ko.observable();
    $('#facetsDiv > div > div > ul').click(function (e) { self.lastTabClicked(e.target); });
    $(document).bind('FacetsProcessed', function () {
        if (self.lastTabClicked() != null) {
            var last = self.lastTabClicked();
            $("#facetsDiv > div > div > ul a").filter(function () {
                // Matches exact string   
                return $(this).text() === last.innerText;
            }).first().click();
        }
    });

    self.lenses = ko.observableArray([]);
    self.lenses.push(new self.lens("Activity", "Show filters related to defence-type searching.", "tipsyMe", ["STD_COUNTRY", "FUNCTIONALSEGMENT", "FORCESTRUCTURE", "PLATFORMTYPE", "PLATFORMFAMILYNAME", "PLATFORMSPECIFIC"]));

    self.unselectLens = function (l) {
        l.selected(false);
    }
    // Set the current lens
    self.currentLens = self.lenses[0];

    self.ChangeLens = function (lens) {
        self.currentLens = lens;

        if (!self.loadingFirstTab)
            CMP.Utils.ActivityLog.log('DefenceBudgets', 3, 1, lens.name);//3 lens clicked, 1 info.

        self.subCharts.currentLens(lens);
        self.startChartLoadingTimer();

        // cancel any current chart gets
        _.each(pendingChartRequests, function (xhr) {
            try {
                xhr.abort();
            }
            catch (e) { ; }
        });

        var TabIndex = 0;
        // the index of the tab to click - hence the facets become visible
        _.each(self.lenses(), self.unselectLens);
        lens.selected(true);

        switch (lens.name) {
            case "Activity":
                TabIndex = 1;
                break;
            case "Force":
                TabIndex = 2;
                break;
        }

       
        if (self.viewChart())
            self.subCharts.updateCharts();

        self.subCharts.arrangeCharts();

    }

    // end guided stuff   ****************************************88
    // ********************************************************************88
    // ********************************************************************88
    // ********************************************************************88

    /// Works out what should be passed down the wire to let the provider know about pgo, inflation etc.
    self.GetJDBSpecifcHints = function () {
        var hints = {};
        if (!self.viewGrid())
            hints["SD"] = "dontSearch";
        hints["UnIxr"] = "" + ((self.ForecastType() || {}).key) + ("|CURRENCY_" + (self.Currency() || {}).key) + ("|" + (self.DefenceSegment() || {}).key) + (self.PGo_On() ? "|APPLY_PGO" : "") + (self.currentChartId().indexOf("Pie") !== -1 ? "" : "|TIME_SERIES") + (self.Inflate() ? "|INFLATE" : "") + (self.DiscountRate() ? "|APPLY_COMM_ACFT_DSCT" : "") + (self.CAGR ? "|SHOW_CAGR" : "") + (self.LimitToTenSeries() ? "|GROUP_OTHER_SERIES" : "");
        return hints;
    }
        ;

    self.currentChartId = ko.observable( "JDBChartConfigArea");

    self.startChart = function () {

        _.delay(function () {
            //Update any help links in classic to the new classic help file.
            if (!self.GuidedBeta) {
                var helpLinks = document.querySelectorAll("a[href='/DefenceBudgets/Help']");
                for (i = 0; i < helpLinks.length; ++i) {
                    helpLinks[i].href = "https://cdn.ihs.com/ADS/Help/JDB-Classic_4_06/Default.htm";
                }
            }
        }, 2000);


        self.newchart = new cmpChartVM('', self.search.calculateQueryString(), self.search, "chart_" + self.currentChartId(), self.currentChartId(), "JDB");
        self.newchart.warnThatSeriesAreGrouped = 50;
        self.newchart.warnThatSeriesAreGroupedCallback = function () {
            ShowInfo("Your current chart had too many segments to draw, \r\n We have grouped the smallest together and have given you the \r\n top fifty segments plus 'All Others'. \r\n Add some more search filters to reduce the frequency of this happening. ", 10000);
        }
            ;
        $('#JDBHiChartContainer').prepend("<div id='" + self.newchart.chartdivId + "' class='u-margin-Al'></div>");
        $('#JDBHiChartContainer').after("<div id='" + self.newchart.chartdivId + "DataTable' class='u-margin-Al chartDataTable tispy' tooltip='test'></div>");
        self.newchart.RegisterChartFail(self.showChartError);

        self.update();
        self.search.registerFinishedCallback(function (result, event) {
            if (self.viewChart()) {
                if (self.chartWillIgnoreCallbacksCount > 0 || event == "facetPanel" && self.GuidedBeta) {
                    self.chartWillIgnoreCallbacksCount--;
                } else {
                    self.update();
                    if (self.GuidedBeta)
                        self.subCharts.updateCharts();
                    // self.FacetsSearcher.SearchChanged();
                }
            }

            if (!self.GuidedBeta) {
                showPreviouslySelectedTab();
                //facets trying to update each time we search, need to manage this better in the next release.
                _.times(30, function (n) { _.delay(function (n) { showPreviouslySelectedTab(); }, n * 500); });
            }
        });

        self.search.registerCustomCallback(function (a, data) {
            if (a === "jdbCustomFilters") {
                self.LoadCustomAttributes(data);
            } else if (a === "jdsfCustomSegments") {
                self.LoadCustomSegments(data);
            }
        });

        self.search.registerFinishedCallback(function (results) {
            if (self.firstGridLoad) {
                self.firstGridLoad = false;

                // set to true if we want to default on, on load
                //self.chartDataTable(true);
			}

			var breadcrumbString = self.getBreadcrumbString();

	        var chart = $('#' + self.newchart.chartdivId).highcharts();
            if (chart) {
                chart.setTitle(null, {
                    text: breadcrumbString
                });
			}

	        self.subCharts.updateCharts();
        });
    };

    self.update = _.throttle(function () {
        if (self.chartWillIgnoreCallbacksCount > 0) {
            self.chartWillIgnoreCallbacksCount--;
            return;
        }

        if (self.GuidedBeta)
            return;

        if (self.DefenceSegment().key == "SUBSYSTEM_SUPPLIER" || self.DefenceSegment().key == "SUBSYSTEM_TYPE") {
            // check we have the total program value as this is the only one allowed for subsystems
            if (self.ForecastType().key != self.settings.forecastType[0].key) {
                self.ForecastType(self.settings.forecastType[0]);
                ShowInfo("Sorry, production units are not available for subsystem charts. We have changed the forecast back to Total Program.", 3000);
                return; //return as changing the forcast type will force update again but this the forecast type will be total program
            }
        }

        self.newchart.search = self.search;

        self.newchart.UpdateChart('', self.getBreadcrumbString(), "/DefenceBudgets/GetChart", function () {
            if (self.GuidedBeta)
                return;

            var also = $('.highcharts-container').parent();
            var width;
            $('#JDBHiChartContainer').resizable({
                ghost: true,
                handles: 's',
                grid: [1000000, 1],
                stop: function (event, ui) {
                    also.height(ui.size.height - 60);
                    ui.element.width(width);
                    self.redrawChart();
                },
                start: function (e, ui) {
                    width = ui.size.width;
                }
            });

            var chart = $('#' + self.newchart.chartdivId).highcharts();

            // The breadcrumb string provided is out of date so refresh it.
            var breadcrumbString = self.getBreadcrumbString();
            chart.setTitle(null, {
                text: breadcrumbString
            });

            if (self.ForecastType().key == "FT_PRODUCTION_UNITS") {
                chart.yAxis[0].update({
                    title: {
                        text: 'Production units'
                    },
                    labels: {
                        align: 'left',
                        format: '{value:,.0f}'
                    }
                });
                if (!!~self.currentChartId().indexOf("Pie")) {
                    chart.series[0].update({
                        name: 'Units'
                    });
                    $('.hichartDataTable tr:first-of-type th:last-of-type').text('Units');
                }

                $('#hiChartFooter h4').text("Production Units");
                $(".hichartDataTable td").each(function () {
                    $(this).text($(this).text().replace('.00', ''));
                });
            } else {
                try {
                    var h = _.reduce(self.newchart.cmpHiChart.chartobject.series, function (m, i) {
                        var t = _.reduce(i.data, function (im, ii) {
                            return (ii[1] > im ? ii[1] : im);
                        }, 0);
                        return t > m ? t : m;
                    }, 0);
                    if (h < 3) {
                        var chart = $('#' + self.newchart.chartdivId).highcharts();
                        chart.yAxis[0].update({
                            labels: {
                                align: 'left',
                                format: '{value:,.2f}M'
                            }
                        });
                    }
                } catch (e) {
                    ;
                }
            };

            showPreviouslySelectedTab();

        });

    }, 100, {
            leading: false
        });

    self.updateChartAndGrid = function () {
        self.resultsVM.search.updateResults();
    }
        ;

    self.getBreadcrumbString = function () {
        var crumbstring = "";
		for (var i = 0; i < self.resultsVM.facetsVM.breadcrumbs().length; i++) {
			if (i === 0) {
				crumbstring += self.resultsVM.facetsVM.breadcrumbs()[i].displayText();
			}
			else {
				crumbstring += ", " + self.resultsVM.facetsVM.breadcrumbs()[i].displayText();
			}
        }
        return crumbstring;
    }
        ;

    self.addSubChart = function () {
        self.subCharts.AddChart();
    }

    self.viewChart.subscribe(function (visible) {
        if (self.GuidedBeta) {
            CMP.Utils.ActivityLog.log('DefenceBudgets', 11, 1, "viewChart=" + self.viewChart());//11 = event.changed, 1 info.
            self.updateView(visible, self.viewGrid());
            if (self.viewChart())
                self.subCharts.updateCharts();
        }
        else {
            self.updateView(visible, self.viewGrid());
            if (!visible)
                return;
            self.search.updateResults(self.search.updateRequestSender.options);
        }

    });

    self.viewGrid.subscribe(function (visible) {
        CMP.Utils.ActivityLog.log('DefenceBudgets', 11, 1, "viewGrid=" + self.viewGrid());//11 = event.changed, 1 info.
        self.updateView(self.viewChart(), visible);
        if (!visible)
            return;
        self.chartWillIgnoreCallbacksCount = 1;
        self.search.updateResults(self.search.updateRequestSender.options);
    });

    self.viewGrid.subscribe(function (visible) {
        self.updateView(self.viewChart(), visible);
        if (!visible)
            return;
        self.chartWillIgnoreCallbacksCount = 1;
        self.search.updateResults(self.search.updateRequestSender.options);
    });

    self.chartFullscreen.subscribe(function (fullscreen) {
        if (fullscreen) {
            var con1 = $('#JDBHiChartContainer');
            var height = con1.height() || 400;
            con1.height(height);
            $('.highcharts-container').parent().height(height - 60);
        }
        window.setTimeout(self.redrawChart);
    });

    self.chartDataTable.subscribe(function () {
        $('#' + self.newchart.chartdivId + 'DataTable').toggle();
    });

    self.DefenceSegment.subscribe(self.update);
    self.Currency.subscribe(self.updateChartAndGrid);
    self.ForecastType.subscribe(self.update);

    /**
     * Updates the query value for view.
     */
    self.updateView = function (chart, grid) {
        var view = ((chart ? 'chart' : '') + '|' + (grid ? 'grid' : '')).replace(/^\||\|$/g, '');
        self.search.setQueryValue('view', view);
        self.search.updateHash();
    }
        ;
    self.DiscountRate.subscribe(self.updateChartAndGrid);
    self.Inflate.subscribe(self.updateChartAndGrid);
    self.PGo_On.subscribe(self.updateChartAndGrid);
    self.LimitToTenSeries.subscribe(self.update);
    self.ApplyRetroColourPalette.subscribe(function (useRetro) {
        useRetroColours = useRetro;
    });
    self.ApplyRetroColourPalette.subscribe(self.update);

    self.currentChartId.subscribe(function (chartId) {
        self.newchart.chartAreaId = chartId;
        self.update();
    });

    self.HookupButtons = function () {

        window.ChartSeriesClick = function (point, event) {
            if (self.GuidedBeta) {
                self.ChartSeriesClick(point, event);
            }
            else {
                self.ChartSeriesClick(point, event);
            }
        }

        window.GetTopTenPrograms = function (point, event) {
            self.GetTopTenPrograms(point, event);
        }
        window.loadCustomDataSheet = function () {
            self.loadCustomDataSheet();
        }
        window.seriesValClicked = function (m) {
            var contextMenu = $("#chartContextMenu");
            contextMenu.draggable({
                handle: ".modal-header"
            });

            contextMenu.find("#chartContextTitle").text(m);
            contextMenu.find("#topTenLabel").text(m);
            var dtPos = $('.hichartDataTable').position();
            contextMenu.css({
                left: dtPos.left + 280,
                top: dtPos.top
            });

            contextMenu.fadeIn('fast');
            self.currentSegmentClicked = m;
            self.TopTenProgramData.removeAll();
            self.currentYearClicked = '';
            self.GetTopTenPrograms(null, null);
            return false;
        }
    }
        ;

    self.HookupButtons();
    //hide grid on start
    var views;
    if ((views = (search.getQueryValue('view') || 'chart')) && (views = views.split('|')).length) {
        self.viewGrid(views.indexOf('grid') >= 0);
        self.viewChart(views.indexOf('chart') >= 0);
    }

    self.viewingChartContextMenu = ko.observable(false);

    self.currentSegmentClicked = "";
    self.currentYearClicked = "";

    self.ChartSeriesClick = function (point, event) {

        if (self.GuidedBeta) {
            // 1. get the correct chart, bound to be an easier way to do this.
            var subChartVm = _.find(self.subCharts.charts(), function (cht) {
                return cht.chart.chartdivId == event.target.parentElement.parentElement.parentElement.parentElement.parentElement.id
            });
            if (subChartVm) {
                // show a popup
                // choose either x or g value to refine on or remove

                // scenario 1 - refine on discrete value
                /** var ixr = subChartVm.x;             
              var value = point.category;
              subChartVm.x = subChartVm.g;
              self.resultsVM.facetsVM.applyFacet(ixr, value, false, null, false);
                **/


                subChartVm.XFilterValue(point.category);
                subChartVm.GFilterValue(point.series.name);

                if (event.ctrlKey) {
                    var newXAttribute = point.category;
                    //add a new chart at the top, but step down the hierarchy first
                    _.each(self.lenses(), function (lens) {
                        if (lens.selected()) {
                            // Check the attribute_hierarchy
                            var length = lens.attribute_hierarchy.length;
                            for (var i = 0; i < length; i++) {
                                if (lens.attribute_hierarchy[i] == subChartVm.x()) {

                                    //see if we can go down the hierarchy for this lens.
                                    if (i + 1 < length) {
                                        newXAttribute = lens.attribute_hierarchy[i + 1];

                                        if (1 == 1) {
                                            var message = "Drilldown To:" + newXAttribute + ",From:" + subChartVm.x() + ",ClickValue:" + point.category;
                                            CMP.Utils.ActivityLog.log('DefenceBudgets', 4, 1, message); //4 = event.click, 1 info.
                                            self.resultsVM.facetsVM.applyFacet(subChartVm.x(), point.category, false, null, false);
                                            subChartVm.undoOperations.push({ "xIndexer": subChartVm.x(), "valueToRemove": point.category });
                                            subChartVm.x(newXAttribute);

                                        }
                                        else {
                                            //load into new chart and freeze current
                                            subChartVm.frozen(true);
                                            self.resultsVM.facetsVM.applyFacet(subChartVm.x(), point.category, false, null, false);

                                            // add drill down to new chart
                                            var addChartOnce = _.once(function () { self.subCharts.AddChartWithDetails(newXAttribute, "PROGRAM", "NOTHING", "Activity"); })
                                            self.search.registerFinishedCallback(function (result, event) {
                                                addChartOnce();
                                            });
                                        }

                                    }
                                    break;
                                }
                            }
                        }
                    });
                }

                else {
                    subChartVm.refineVisible(true);
                    subChartVm.TopTenItems.removeAll();
                    self.currentUnit((self.Currency() || {}).key || "");

                    // Ensure the modal shows the current X value in the the drilldown dropdown.    
                    subChartVm.RefineNextXValue(subChartVm.x());

                    // Reset the checked boxes in the modal popup, user can un-check after
                    subChartVm.wantsToFilterOnX(true);
                    subChartVm.wantsToFilterOnG(true);
                    // populate the subchartVms array of top ten programs to show to the user.
                    self.GetTopTenProgramsForSubChart(subChartVm);

                    var contextMenu = $(".ChartRefinerModal");
                    contextMenu.draggable({
                        handle: ".modal-header"
                    });
                }
                return;
            }
        } else {

            self.TopTenProgramData.removeAll();
            self.viewingChartContextMenu(true);
            var contextMenu = $("#chartContextMenu");
            contextMenu.draggable({
                handle: ".modal-header"
            });
            var segmentClicked = "";
            var totalYears = self.currentChartId().indexOf("Pie") > 0;
            if (totalYears) {
                if (point.name != undefined) {
                    segmentClicked = point.name;
                    //pie
                } else {
                    segmentClicked = point.series.name;
                    //column
                }
                self.currentYearClicked = "";
            } else {
                segmentClicked = point.series.name;
                self.currentYearClicked = new Date(point.x).getFullYear();
            }
            if (segmentClicked == "All Others") {
                alert("Unable to drilldown on this series.");
            } else {
                self.currentSegmentClicked = segmentClicked;
                var pos = GetContextMenuPostion(event, contextMenu);
                contextMenu.css({
                    left: pos.x,
                    top: pos.y
                });
                contextMenu.find("#chartContextTitle").text(segmentClicked + ", " + self.currentYearClicked);
                var t = "Top 10 programs";
                if (self.currentYearClicked != "") {
                    t = t + " for " + self.currentYearClicked;
                } else {
                    var crumbs = $('#ctl00_Breadcrumb1_divBreadcrumb span.crumb[id*="_YEAR"]');
                    if (crumbs.length > 0) {
                        t = t + " " + crumbs[0].innerText;
                    } else {
                        var currentYear = new Date().getFullYear();
                        t = t + " " + currentYear + " - " + parseInt(currentYear + 9);
                    }
                }
                contextMenu.find("#topTenLabel").text(t);
                contextMenu.fadeIn(500);
                self.GetTopTenPrograms();
            }
            self.currentSegmentClicked = segmentClicked;
        }

    }
        ;

    self.MergeSearchesVM = function () {
        var self = this;
        self.ShowMergeOptions = ko.observable(true);
        self.alert = function () {
            alert();
        }

        return {
            alert1: function () {
                alert('alerting');
            }
        }
    }
        ;

    self.redrawChart = function () {
        self.newchart.Reflow();
    }
        ;
    self.loadCustomDataSheet = function () {
        var newUrl = window.location.href.replace("DefenceBudgets/Data", "DefenceBudgets/GetCustomDataSheet?").replace("DefenceBudgets/data", "DefenceBudgets/GetCustomDataSheet?")
        newUrl = newUrl.replace("#", "&");
        window.open(newUrl);
    }
    self.GetTopTenProgramsForSubChart = function (targetSubChartVM) {
        /*
        Get the top top programs for the current click on the given target chart
        targetSubChartVM is a new argument to targetting a subchartVm not just the top level modal, so we can have >1 list of top ten items at once.
        */

        // is there a grouping we need to refine on.
        var groupingClickFilter = (targetSubChartVM.g() != "NOTHING" ? targetSubChartVM.g() + "(" + targetSubChartVM.GFilterValue() + ")" : "");
        var xClickFilter = (targetSubChartVM.x() != "" ? targetSubChartVM.x() + "(" + targetSubChartVM.XFilterValue() + ")" : "");

        //special case for X = TIMELINE
        if (xClickFilter != "" && targetSubChartVM.x() == "TIMELINE" && targetSubChartVM.wantsToFilterOnX()) {
            //Warning here be magicness in the maths 
            var convertedToYear = new Date(targetSubChartVM.XFilterValue()).getYear() - 100 + 2000;

            if (convertedToYear > 1970 && convertedToYear < 2100) {
                targetSubChartVM.XFilterValue(convertedToYear);
            }

            xClickFilter = "YEAR(" + targetSubChartVM.XFilterValue() + ")";
        }

        //If either filter are All Other or All Other X we should remove them from the filter.
        if (targetSubChartVM.XFilterValue().toString().startsWith("All Other")) xClickFilter = "";
        if (targetSubChartVM.GFilterValue().startsWith("All Other")) groupingClickFilter = "";

        // if the user has set either wantsToFilterOnX or wantsToFilterOnG to false, then we dont want to filter on this
        // NB if the user has clickec on the chart, we set these to true, once in the top ten modal, the user
        // can un check to change the top ten programs list they are seeing
        if (!targetSubChartVM.wantsToFilterOnG()) groupingClickFilter = "";
        if (!targetSubChartVM.wantsToFilterOnX()) xClickFilter = "";

        var filter = "";
        if (xClickFilter != "") filter += encodeURIComponent(xClickFilter);
        if (groupingClickFilter != "") {
            filter += (filter != "" ? "%3Cand%3E" : "") + encodeURIComponent(groupingClickFilter);
        }

        var _url = "GetTop10Programs?" + self.search.calculateQueryString();

        // add the click details to refine on
        if (filter != '') {
            if (!!~_url.indexOf("f=")) {
                _url = _url.replace("f=", "f=" + filter + "%3Cand%3E");
            } else {
                _url += "&f=" + filter;
            }
        }


        $.get2({
            //type: "GET",
            url: _url,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                var foreCastType = self.ForecastType();
                self.currentUnit((self.Currency() || {}).key || "");
                if (foreCastType.key == 'FT_PRODUCTION_UNITS') {
                    self.currentUnit("Units");
                }
                else {
                    self.currentUnit("USD");
                }
                var jsonObject = CMP.ConvertStringResultToJSONObject(msg);
                targetSubChartVM.TopTenItems.removeAll();
                if (jsonObject && jsonObject[0])
                    for (var i = 0; i < jsonObject[0].length - 1; i++) {
                        var newItem = jsonObject[0][i];
                        newItem.DESCRIPTION = "";
                        newItem.expanded = ko.observable(false);
                        targetSubChartVM.TopTenItems.push(newItem);
                    }
                //$("#chartContextMenu").hide();
                //$("#topTen").fadeIn(500);
            }
        });
    }
        ;

    self.GetTopTenPrograms = function () {
        var dataContainer = $("#topTenData");
        var topTen = $("#topTen");
        topTen.children("#topTenTitle").text(self.currentSegmentClicked);
        var t = "Top 10 programs";
        var yearCrumb = $('#ctl00_Breadcrumb1_divBreadcrumb span.crumb[id*="_YEAR"]');
        var constraintName = "YEAR";
        if (self.currentYearClicked != "") {
            t = t + " for " + self.currentYearClicked;
        } else {
            if (yearCrumb.length > 0) {
                t = t + " " + $(yearCrumb[0]).text();
            } else {
                var currentYear = new Date().getFullYear();
                t = t + " " + currentYear + " - " + parseInt(currentYear + 9);
            }
        }
        topTen.find("#topTenTitle2").text(t);
        var _url = "GetTop10Programs?" + self.search.calculateQueryString().replace("TIMELINE", "YEAR");
        // add the click details to refine on
        if (!!~_url.indexOf("f=") && self.currentSegmentClicked !== "All Others") {
            _url = _url.replace("f=",
                "f=" + self.DefenceSegment().key + "(" + encodeURIComponent(self.currentSegmentClicked) + ")%3Cand%3E");
        } else {
            _url += "&f=" + self.DefenceSegment().key + "(" + encodeURIComponent(self.currentSegmentClicked) + ")";
        }
        if (self.currentYearClicked != null && self.currentYearClicked !== '') {
            _url = _url.replace("f=", "f=YEAR(" + self.currentYearClicked + ")%3Cand%3E");
        }
        //   var searchQuery = window.location.search.substring(1) + window.location.hash;
        $.ajax({
            type: "GET",
            url: _url,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                var foreCastType = self.ForecastType();
                self.currentUnit((self.Currency() || {}).key || "");
                if (foreCastType.key == 'FT_PRODUCTION_UNITS') {
                    self.currentUnit("Units");
                }
                else {
                    self.currentUnit("USD");
                }
                var jsonObject = CMP.ConvertStringResultToJSONObject(msg);
                self.TopTenProgramData.removeAll();
                for (var i = 0; i < jsonObject[0].length - 1; i++) {
                    self.TopTenProgramData.push(jsonObject[0][i]);
                }
                //$("#chartContextMenu").hide();
                //$("#topTen").fadeIn(500);
            }
        });
    }
        ;

    self.DrillDownChart = function () {
        self.resultsVM.facetsVM.applyFacet(self.DefenceSegment().key, self.currentSegmentClicked, false, null, false);
        return false;
    }
        ;

    self.RefineProgramData = function () {
        self.resultsVM.facetsVM.applyFacet(self.DefenceSegment().key, self.currentSegmentClicked, false, null, false);
        self.viewGrid(true);
        window.scrollTo(0, 500);
        $("#chartContextMenu").fadeOut(500);
    }
        ;
    self.LoadCustomSegments = function (data) {
        self.CustomSegments.removeAll();
        _.each(data, function (a) {
            self.CustomSegments.push({
                key: a.FacetKey,
                text: a.Name
            });
        });
    }
    self.LoadCustomAttributes = function (data) {

        self.CustomAttributes.removeAll();
        _.each(data, function (a, b) {
            self.CustomAttributes.push({
                key: a.FacetKey,
                text: a.Name
            });
        });
        if (self.CustomAttributes().length === 0) {
            var customTab = $('#filter > div:nth-child(2) > div > div > ul > li.active');
            if (customTab.css("display") === "block") {
                if (!self.GuidedBeta) {
                    $('#filter > div:nth-child(2) > div > div > ul > li:nth-child(1) > a').click();
                }
            }
        }
        // if the current segment for the chart is custom, we need to ensure it exists in the new list
        // otherwise we may be segmenting on a given custom attribute which is not at all relevant to the current search / Defence.
        if (self.DefenceSegment().key.startsWith("CUSTOM_")) {
            var match = _.find(self.CustomAttributes(), function (customAttribute) {
                return customAttribute.key === self.DefenceSegment().key;
            });
            if (!match) {
                ShowInfo("Reverting chart segment back to 'Function' as '" + self.DefenceSegment().text + "' is no longer valid for this search.", 25000);
                self.DefenceSegment(self.settings.defenceSegments[0]);
            }
        }

    }
        ;

    self.TopTenClicked = function (self, clicked) {
        self.chartWillIgnoreCallbacksCount++;
        var facetKey = self.DefenceSegment().key;
        self.DefenceSegment(clicked);
        self.resultsVM.facetsVM.applyFacet(facetKey, self.currentSegmentClicked, false, null, false);
        $("#chartContextMenu").fadeOut(500);
    }
        ;

    self.PrintChart = function () {
        var self = this;
        var c1 = $('#' + self.newchart.chartdivId);
        c1.highcharts().print();
        CMP.Utils.ActivityLog.log('DefenceBudgets', 9, 1, window.location.href); //9 print, 1 info.
    };



    self.editChartTitle = ko.observable(false);
    self.editChartTitle.subscribe(function (edit) {
        if (!edit) {
            var titleEdit = $('.chart-edit-title').addClass('hidden').find('input');
            var subtitleEdit = $('.chart-edit-subtitle').addClass('hidden').find('input');
            $('#' + self.newchart.chartdivId).highcharts().setTitle({
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

    self.ExportChart = function (type) {
        var self = this;
        var chart = $('#' + self.newchart.chartdivId).highcharts();
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
        CMP.Utils.ActivityLog.log('DefenceBudgets', 8, 1, "fileType:" + fileType);
    }
        ;
    self.exportDataTable = function () {
        var self = this;
        var url = '/DefenceBudgets/Download/MarkUp/DefencesForecastSummary/xlsx';
        var dataTable = $('#' + self.newchart.chartdivId + 'DataTable').html().replace(/&amp;/gi, "&");
        window.post(url, {
            markup: dataTable
        });
    }
        ;

    self.showChartError = function (obj) {
        ShowError("An error has occurred drawing chart.");
    }
        ;

    self.RegisterUrlReview();
    self.startChart();
    self.LoadCustomAttributes();

    (function CreateSettings() {
        window.settings.settings.push(new SettingVM("Defence Budgets"));
        window.settings.settings.push(new SettingVM({
            Title: 'PGo On',
            Value: ko.computed({
                read: function () {
                    return !self.PGo_On();
                },
                write: function (newValue) {
                    self.PGo_On(!newValue);
                }
            }),
            Name: 'ApplyJDSFPGo',
            help: {
                AppKey: "JANES",
                CatKey: "JDB",
                HelpTitle: "PGO",
                ItemId: "PGO",
                GroupId: "JDB"
            }
        }));
        window.settings.settings.push(new SettingVM({
            Title: 'Include Inflation effects',
            Value: self.Inflate,
            Name: 'EnableInflation',
            help: {
                AppKey: "JANES",
                CatKey: "JDB",
                HelpTitle: "INFLATE",
                ItemId: "INFLATE",
                GroupId: "JDB"
            }
        }));
        window.settings.settings.push(new SettingVM({
            Title: 'Discount Rate',
            Value: self.DiscountRate,
            Name: 'EnableCommercialAircraftDiscount',
            Tooltip: 'Applies to Commercial Aircraft to show the 15-33% discount off catalog price.  Does not apply to BizJets and personal aircraft.',
            help: {
                AppKey: "JANES",
                CatKey: "JDB",
                HelpTitle: "DISCOUNT",
                ItemId: "DISCOUNT",
                GroupId: "JDB"
            }
        }));

        window.settings.settings.push(new SettingVM({
            Title: 'Use Old Palette',
            Value: self.ApplyRetroColourPalette,
            Name: 'ApplyRetroColourPalette'
        }));
        window.settings.settings.push(new SettingVM({
            Title: 'Limit to 10 Chart Series',
            Value: self.LimitToTenSeries,
            Name: 'ApplyChartGrouping',
            help: {
                AppKey: "JANES",
                CatKey: "JDB",
                HelpTitle: "GROUPOTHER",
                ItemId: "GROUPOTHER",
                GroupId: "JDB"
            }
        }));
        //window.settings.settings.push(new SettingVM({
        //    Icon: 'icon-chart-area',
        //    Title: 'Chart Type',
        //    Value: self.currentChartId,
        //    Name: 'JDBFChartType',
        //    Options: [{
        //        Name: 'JDBChartConfigArea',
        //        Title: 'Area',
        //        Icon: 'icon-chart-area'
        //    }, {
        //        Name: 'JDBChartConfigPie',
        //        Title: 'Pie',
        //        Icon: 'icon-chart-pie'
        //    }, {
        //        Name: 'JDBChartConfigStackedColumn',
        //        Title: 'Col',
        //        Icon: 'icon-chart-bar'
        //    }, {
        //        Name: 'JDBChartConfigLine',
        //        Title: 'Line',
        //        Icon: 'icon-chart-line'
        //    }]
        //}));
        var currencySettings = new SettingVM({
            Title: 'Currency',
            Value: ko.computed({
                read: function () {
                    return (self.Currency() || {}).key || "";
                },
                write: function (newValue) {
                    var newCurr = _.findWhere(self.settings.currencies, {
                        key: newValue
                    });
                    if (newCurr)
                        self.Currency(newCurr);
                }
            }),
            Name: 'Currency',
            Options: _.map(self.settings.currencies, function (c, i) {
                return {
                    Name: c.key,
                    Title: c.text
                }
            })
        });
        window.settings.settings.push(currencySettings);
        window.settings.settings.push(new SettingVM("Show me the following"));
        window.settings.settings.push(new SettingVM({
            Title: 'Data grid',
            saveChanges: false,
            Value: self.viewGrid,
            Name: 'JDBShowGrid',
            Tooltip: 'Shows the underlying data for Defence Budgets.',

        }));
        window.settings.settings.push(new SettingVM({
            Title: 'Charts',
            Value: self.viewChart,
            saveChanges: false,
            Name: 'JDBShowCharts',
            Tooltip: 'Shows the charts for Defence Budgets.',
        }));
        $.get('GetCurrencies', function (data) {
            currencySettings.options().forEach(function (opt) {
                if (!opt.name)
                    return;
                if (!data.ExchangeRates[opt.name])
                    return;
                opt.title(opt.title() + ' (1 USD = ' + data.ExchangeRates[opt.name] + ' ' + opt.name + ')');
            });
            var date = new Date(parseInt(data.DateUpdated.replace(/\/Date\((.*?)\)\//gi, "$1")))
            date = date.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()] + ' ' + date.getFullYear();
            currencySettings.options.push(new SettingOptionVM({
                Title: 'Source: OAND, as of ' + date
            }));
        });
    })();

    function setupSettings() {
        self.settings = {
            currencies: [{
                key: "",
                text: "$ US Dollar",
                symbol: "$M"
            }, {
                key: "GBP",
                text: "\u00A3 UK Pound",
                symbol: "\u00A3M"
            }, {
                key: "EUR",
                text: "\u20AC Euro",
                symbol: "\u20ACM"
            }],
            defenceSegments: [{
                key: "FUNCTIONALSEGMENT",
                text: "Function"
            }, {
                key: "FORCESTRUCTURE",
                text: "Force Structure"
            }, {
                key: "STD_COUNTRY",
                text: "Country"
            }, {
                key: "STD_REGION",
                text: "Region"
            }, {
                key: "PLATFORMTYPE",
                text: "Platform Type"
            }, {
                key: "STD_SUPPLIER",
                text: "Supplier"
            }, {
                key: "ITEMLIFECYCLEDESC",
                text: "Life Cycle Position"
            }, {
                key: "USERORGGEN",
                text: "User Org Gen"
            }, {
                key: "GOVERNMENT_PRIME",
                text: "Govt Prime"
            }, {
                key: "PLATFORMFAMILYNAME",
                text: "Platform Family"
            }, {
                key: "MANNED_UNMANNED",
                text: "Manned Unmanned"
            }, {
                key: "PARENT_Defence",
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
            }],
            forecastType: [{
                key: "FT_TOTAL_PROGRAM",
                text: "Total Program"
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
            }]
        };
    }

    ////add one for development
    //_.delay(self.subCharts.AddChart, 1000);
};
function GetContextMenuPostion(event, contextMenu) {
    var mousePosition = {};
    var menuPostion = {
        x: 0,
        y: 0
    };
    var menuDimension = {};
    menuDimension.x = contextMenu.outerWidth();
    menuDimension.y = contextMenu.outerHeight();
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
    if (mousePosition.x + menuDimension.x > $(window).width() + $(window).scrollLeft()) {
        menuPostion.x = mousePosition.x - menuDimension.x;
    } else {
        menuPostion.x = mousePosition.x;
    }
    if (mousePosition.y + menuDimension.y > $(window).height() + $(window).scrollTop()) {
        menuPostion.y = mousePosition.y - menuDimension.y + 50;
    } else {
        menuPostion.y = mousePosition.y - 50;
    }
    var chart = document.getElementById('JDBHiChartContainer');
    if (!chart) {
        chart = event.srcElement.parentElement.parentElement.parentElement.parentElement.parentElement.id;

    }
    var chartPos = cumulativeOffset(chart);
    menuPostion.x = menuPostion.x - chartPos.left;
    menuPostion.y = menuPostion.y - chartPos.top;

    return menuPostion;
}
var cumulativeOffset = function (element) {
    var top = 0
        , left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element); return {
        top: top,
        left: left
    };
};

$(".customisation.dialog").draggable({
    handle: ".modal-header"
});

_.delay(function () {
    $('#facetsearchHook').prepend($('#facetsSearchDataDiv').detach());
    $('#facetsearchHook').prepend($('#facetsSearchToggle').detach());
    //_.delay(function () { vm.gridChartVM.FacetsSearcher.visible(false) }, 2000);
}, 3000);

_.delay(function () {
    vm.gridChartVM.FacetsSearcher.visible(true);
}, 4000);


var FacetsSearcher = function (search) {
    var self = this;
    self.search = search;
    self.busy = ko.observable(false);
    self.visible = ko.observable(false);
    self.visible.subscribe(function () {
        if (self.visible()) {
            $('#facetSearchText').focus();
        }
    })
    self.SearchChanged = function () {
        ;//maybe update the search here in the future.
    }
    // $('#facetsSearchDataDiv').modal();
    self.results = ko.observableArray([]);
    self.searchTerm = ko.observable();
    self.removeAllFacetsOnApply = ko.observable(false);
    self.searchTerm.subscribe(function () {
        if (self.searchTerm().length < 3) {
            self.results.removeAll();
        }
        else {
            self.getFacetsData(self.searchTerm());
        }


    });
    self.Process = function (row) {
        if (self.searchTerm().length < 3) {
            self.busy(false);
        }

        if (vm.gridChartVM.ctrlKeyDown() || self.removeAllFacetsOnApply()) {
            vm.facetsVM.clearAppliedFacets(true);
        }
        var value = row.Item2.substring(0, row.Item2.lastIndexOf("(") - 1);
        vm.facetsVM.applyFacet(row.Item1, value, false, null, false);
    }

    self.useAuths = true;
    self.getFacetsDataInternal = function (searchstring) {

        //check it still matches,
        if (searchstring != self.searchTerm()) {
            self.busy(false);
            return;
        }

        self.results.removeAll();
        self.busy(true);

        if (self.useAuths) {
            // remember we cant do not in - so one constraint like France would 
            // exclude all others from the list
            //WITH 
            var query = self.search.calculateQueryString();


            //IF THE USER HAS PUT A STAR AT THE FRONT, REMOVE IT AND EMPTY QUERY
            // ITS A GOOD WAY TO INITIALLY ALLOW NON-REFINED SEARCHING
            if (!searchstring.startsWith("*")) {
                query = "";
            }

            //query = ""; //SET THIS TO EMPTY FOR THE MOMENT, REFINING SEARCH NOT AVAILABLE YET VIA THIS
            // BUT AUTHS ARE APPLIED
            var searchWas = self.searchTerm();
            $.get2("SearchFacetsData" + "?" + query, { searchTerm: searchstring }).done(function (data) {
                _.each(data, function (d) {
                    d.Title = d.Item1;
                    d.Title = d.Title.replace('CUSTOM', '');
                    d.Title = d.Title.replace('_', ' ');
                    switch (d.Item1) {
                        case "platformFamilyName": d.Title = "Platform Family"; break;
                        case "ItemFamily": d.Title = "Item Family"; break;
                        case "itemname": d.Title = "Item Name"; break;
                        case "platformSpecific": d.Title = "Platform Specific"; break;
                        case "PROGRAMFAMILY": d.Title = "Program Family"; break;
                        case "User_Org_spec": d.Title = "User Org Spec"; break;
                        case "std_country": d.Title = "Country"; break;
                        case "std_region": d.Title = "Region"; break;
                        case "META_SYSTEM_SUBTYPE": d.Title = "System Subtype"; break;
                        case "META_SYSTEM_TYPE": d.Title = "System type"; break;
                        case "GovtPrime": d.Title = "Gov Prime"; break;
                        case "std_supplier": d.Title = "Supplier"; break;
                        case "functionalSegment": d.Title = "Functional Segment"; break;
                        case "ContractNo": d.Title = "Contract No"; break;
                        case "Cty_Final_Assembly": d.Title = "Cty Final Assembly"; break;


                    }
                });
                if (searchWas == self.searchTerm()) {
                    self.results(data);
                    self.busy(false);
                }

            });

        }



    }
    self.getFacetsData = _.debounce(self.getFacetsDataInternal, 750);

    self.hideHeader = function (index) {
        if (index == 0)
            return false;
        return self.results()[index - 1].Title == self.results()[index].Title;
    }
}