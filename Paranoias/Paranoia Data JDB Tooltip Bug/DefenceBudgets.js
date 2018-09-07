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
        ApplyCombine: false,
        EnableInflation: true,
        EnableCommercialAircraftDiscount: true,
        Currency: 'USD',
        ApplyRetroColourPalette: false,
        ApplyChartGrouping: true
    }, parent.options.userSettings);

    // Data
    self.CombineOn = ko.observable(!parent.options.userSettings.ApplyCombine);
    self.Inflate = ko.observable(parent.options.userSettings.EnableInflation);
    self.DiscountRate = ko.observable(parent.options.userSettings.EnableCommercialAircraftDiscount);
    self.CAGR = false;
    self.JdbViewBySegment = ko.observable(self.settings.jdbViewBySegments[1]);
    self.JdbUnitType = ko.observable(self.settings.jdbUnitType[0]);
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
            if (event.target.type === "text")
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

            self.ChangeLens(self.lenses()[1], self.resultsVM);

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
            disabled: (disabled === true ? true : false)
        };
    }
    self.availbleChartTypes = ko.observableArray([]);
	self.availbleChartTypes.push({ name: "Activity", tooltip: "Change to a activity based chart", x: "TIMELINE", y: "Defence_Budget", g: "BY_ACTIVITY" });
	self.availbleChartTypes.push({ name: "Force", tooltip: "Change to a force based chart", x: "TIMELINE", y: "Defence_Budget", g: "BY_FORCE" });

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
    self.lenses.push(new self.lens("Activity", "Show filters related to Defence-type searching.", "tipsyMe", ["TIMELINE", "BY_ACTIVITY"]));
    self.lenses.push(new self.lens("Force", "Show filters related to Defence-type searching.", "tipsyMe", ["TIMELINE","BY_FORCE"]));

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


        if (!self.viewChart())
            self.subCharts.updateCharts();

        self.subCharts.arrangeCharts();

        //vm.gridChartVM.subCharts.AddChart();

    }

    // end guided stuff   ****************************************88
    // ********************************************************************88
    // ********************************************************************88
    // ********************************************************************88


    /**
    * Show the Janes Analysis Grid Template.
    **/
    //self.showJanesAnalysisGrid = function () {
    //    self.viewGrid(true);

    //    $('body').animate({
    //        scrollTop: $("#main > div.grid.gridJDB").offset().top - 100 /** add 100 tSo handle the locked row at the top **/
    //    }, 1000);

    //}

    /// Works out what should be passed down the wire to let the provider know about pgo, inflation etc.
    self.GetJDBSpecifcHints = function () {
        var hints = {};
        if (!self.viewGrid())
            hints["SD"] = "dontSearch";
        if ((self.JdbViewBySegment() || {}).key === "NOTHING") {
            self.JdbViewBySegment(self.settings.jdbViewBySegments[1]);
        }

        hints["UnIxr"] = "" + ((self.JdbUnitType() || {}).key) + ("|CURRENCY_" + (self.Currency() ? (self.Currency() || {}).key : "USD")) + ("|" + (self.JdbViewBySegment() || {}).key) + (self.CombineOn() ? "|COMBINE" : "") + (self.Inflate() ? "|INFLATE" : "");

        return hints;
    }
        ;

    self.currentChartId = ko.observable("JDBWorldWideChart");

    self.startChart = function () {

        _.delay(function () {
            //Update any help links in classic to the new classic help file.
            if (!self.GuidedBeta) {
                var helpLinks = document.querySelectorAll("a[href='/DefenceBudgets/Help']");
                for (i = 0; i < helpLinks.length; ++i) {
                    helpLinks[i].href = "https://cdn.ihs.com/ADS/Help/JMF-Classic_4_06/Default.htm";
                }
            }
        }, 2000);


        self.newchart = new cmpChartVM('', self.search.calculateQueryString(), self.search, "chart_" + self.currentChartId(), self.currentChartId(), "JanesDefenceBudgets");
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
                if (self.chartWillIgnoreCallbacksCount > 0 || event === "facetPanel" && self.GuidedBeta) {
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
            } else if (a === "jdbCustomSegments") {
                console.log('Point jdbCustomSegments');
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

            //if (!self.viewChart())
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

        if (self.JdbViewBySegment().key === "BY_ACTIVITY" || self.JdbViewBySegment().key === "BY_FORCE") {
            // check we have the total program value as this is the only one allowed for subsystems
            if (self.JdbUnitType().key !== self.settings.jdbUnitType[0].key) {
                self.JdbUnitType(self.settings.jdbUnitType[0]);
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
    
            showPreviouslySelectedTab();

        });

    }, 100, {
            leading: false
        });

    self.updateChartAndGrid = function () {
        self.resultsVM.search.updateResults();
    };

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
    };

    self.addSubChart = function () {
        self.subCharts.AddChart();
    }

    self.viewChart.subscribe(function (visible) {
        if (self.GuidedBeta) {
            CMP.Utils.ActivityLog.log('DefenceBudgets', 11, 1, "viewChart=" + self.viewChart());//11 = event.changed, 1 info.
            self.updateView(visible, self.viewGrid());
            if (!self.viewChart())
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

    self.JdbViewBySegment.subscribe(self.update);
    self.Currency.subscribe(self.updateChartAndGrid);
    self.JdbUnitType.subscribe(self.update);

    /**
     * Updates the query value for view.
     */
    self.updateView = function (chart, grid) {
        var view = ((chart ? 'chart' : '') + '|' + (grid ? 'grid' : '')).replace(/^\||\|$/g, '');
        self.search.setQueryValue('view', view);
        if ((self.GuidedBeta) && grid) {
	        self.search.setQueryValue('template', 'grid');
        }
        else {
	        self.search.setQueryValue('template', '');
        }
        self.search.updateHash();
    }
        ;
    self.DiscountRate.subscribe(self.updateChartAndGrid);
    self.Inflate.subscribe(self.updateChartAndGrid);
    self.CombineOn.subscribe(self.updateChartAndGrid);
    self.LimitToTenSeries.subscribe(self.update);
    self.ApplyRetroColourPalette.subscribe(function (useRetro) {
        useRetroColours = useRetro;
    });
    self.ApplyRetroColourPalette.subscribe(self.update);

    self.currentChartId.subscribe(function (chartId) {
        self.newchart.chartAreaId = chartId;
        self.update();
    });



   
    //hide grid on start
    var views;
    if ((views = (search.getQueryValue('view') || 'chart')) && (views = views.split('|')).length) {
        self.viewGrid(views.indexOf('grid') >= 0);
        self.viewChart(views.indexOf('chart') >= 0);
    }
    self.viewingChartContextMenu = ko.observable(false);
    
    self.currentSegmentClicked = "";
    self.currentYearClicked = "";

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
        // otherwise we may be segmenting on a given custom attribute which is not at all relevant to the current search / market.
        if (self.JdbViewBySegment().key.startsWith("CUSTOM_")) {
            var match = _.find(self.CustomAttributes(), function (customAttribute) {
                return customAttribute.key === self.JdbViewBySegment().key;
            });
            if (!match) {
                ShowInfo("Reverting chart segment back to 'Function' as '" + self.JdbViewBySegment().text + "' is no longer valid for this search.", 25000);
                self.JdbViewBySegment(self.settings.jdbViewBySegments[1]);
            }
        }

    };

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
        var url = '/DefenceBudgets/Download/MarkUp/DefenceBudgetsSummary/xlsx';
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
            Title: 'Nominal Terms',
            Value: self.Inflate,
            Name: 'EnableInflation',
            help: {
                AppKey: "JANES",
                CatKey: "JanesDefenceBudgets",
                HelpTitle: "INFLATE",
                ItemId: "INFLATE",
                GroupId: "JanesDefenceBudgets"
            }
        }));

        window.settings.settings.push(new SettingVM({
            Title: 'Use Old Palette',
            Value: self.ApplyRetroColourPalette,
            Name: 'ApplyRetroColourPalette'
        }));
        var currencySettings = new SettingVM({
            Title: 'Currency',
            Value: ko.computed({
                read: function () {
                    return (self.Currency() || {}).key || "USD";
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
                key: "USD",
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
            }, {
                key: "AUD",
                text: "A$ Australian Dollar",
                symbol: "A$"
            }, {
                key: "CAD",
                text: "C$ Canadian Dollar",
                symbol: "C$"
            }, {
                key: "YEN",
                text: "\u00A5 Yen",
                symbol: "\u00A5"
            }, {
                key: "ARS",
                text: "ARS Argentinian Neuvo Peso",
                symbol: "ARS"
            }],
            jdbViewBySegments: [{
                key: "BY_ACTIVITY",
                text: "Activity"
            }, {
                key: "BY_FORCE",
                text: "Force"
            }],
            jdbUnitType: [{
                key: "FT_PRODUCTION_UNITS",
                text: "Production units"
            }, {
                key: "SERIESVAL",
                text: "Production units"
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
                if (searchWas === self.searchTerm()) {
                    self.results(data);
                    self.busy(false);
                }

            });

        }



    }
    self.getFacetsData = _.debounce(self.getFacetsDataInternal, 750);

    self.hideHeader = function (index) {
        if (index === 0)
            return false;
        return self.results()[index - 1].Title === self.results()[index].Title;
    }
}