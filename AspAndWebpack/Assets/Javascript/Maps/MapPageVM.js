/**
 * A function view model to handle changes within a chart view page.
 * @param {string} containerId - The container which the view model is applied to.
 * @param {string} queryString - The search query string.
 * @param {object} map - The esri map object.
 * @param {int} initialZoomlevel - The starting zoom level.
 * @param {object} esriLibs - All the objects loaded via requirejs.
 */
var MapPageVM = function (containerId, queryString, map, initialZoomlevel, esriLibs, options) {

    var self = this;

    self.options = $.extend({
    }, options);

    self.map = map;

    self.disableAggregation = ko.observable(self.options.disableAggregation);
    self.highFidelity = ko.observable(self.options.highFidelity);
    self.zoomLevel = ko.observable(map.getZoom());
    self.disableAggregation.subscribe(function () {
        self.updateLayers();
    });

    self.highFidelity.subscribe(function () {
        self.updateLayers();
    });

    self.search = new Search({
        serviceUrl: "Map/getResults",
        queryString: queryString
    });

    self.globalExtent = new esri.geometry.Extent(-96, -54, 136, 72, new esri.SpatialReference({ wkid: options.wgs }));

    self.searchType = ko.observable("layers");

    //Any layers which are currently loading. 
    self.loadingLayers = ko.observableArray([]);
    self.loadingLayerTitles = ko.computed(function () {
        var result = self.loadingLayers().map(function (p) { return typeof p.title ==='function'? p.title(): p.title; }).join(', ');
        return result;
    });

    self.setMapExtent = function (options) {

        options = $.extend({},
            {
                minX: 0,
                minY: 0,
                maxX: undefined,
                maxY: undefined,
                wgs: 4326,
                zoom: undefined,
                fit: false
            },
            options);

        if (options.maxX && options.maxY) {
            var newExtent = new esri.geometry.Extent(options.minX, options.minY, options.maxX, options.maxY, new esri.SpatialReference({ wkid: options.wgs }));
            map.setExtent(newExtent, options.fit);
        } else {
            if (options.zoom) {
                map.centerAndZoom(new esri.geometry.Point(options.minX, options.minY, new esri.SpatialReference({ wkid: options.wgs })), options.zoom);
            } else {
                map.centerAt(new esri.geometry.Point(options.minX, options.minY, new esri.SpatialReference({
                    wkid: options.wgs
                })));
            }
        }
    };

    self.facetsVM = new FacetsVM(self.search);

    self.isfullScreen = ko.observable(false);
    self.containerId = containerId;
    self.modalId = "mapItemModal";
    self.esriLibs = esriLibs;
    self.LayerManagerVM = new LayerManager(map, self);
    self.container = document.getElementById(containerId);
    self.isLoading = ko.observable(true);
    self.isMeasuring = ko.observable(false);

    self.countryOverview = new CountryOverviewsVM({
        modalId: "countryOverviewModal"
    });


    self.searchBarVM = new MapSearchBarVM(self.search, {
        layers: self.LayerManagerVM.Layers,
        map: self.map
    });


    //text inputs were disabled on modal popup. We need them enabled on the facets pane
    $('#' + self.modalId).on('shown.bs.modal', function () {
        $(document).off('focusin.modal');
    });

    self.commandsVM = new CommandsVM(self.search,
        {
            commandsType: 'map',
            selectedRecordsFn: function () {
                var selectedEventsNumber = 0;

                for (var g = 0; g < map.graphicsLayerIds.length; g++) {

                    var graphicsLayer = map.getLayer(map.graphicsLayerIds[g]);

                    if (graphicsLayer.visible) {
                        selectedEventsNumber = graphicsLayer.graphics.length;
                        // text symbols contain number of JTIC events so add them up to get a total.
                        // Additionally, some do not have text symbols (single hits), so add number of symbols
                        //and remove two for each text node (1 for the pic and one for the text)
                        for (var gr = 0; gr < graphicsLayer.graphics.length; gr++) {

                            var graphics = graphicsLayer.graphics[gr];

                            if (graphics.symbol.type == "textsymbol") {
                                var eventNumber = parseInt(graphics.symbol.text, 10);

                                if (!isNaN(eventNumber)) {
                                    selectedEventsNumber = selectedEventsNumber + eventNumber - 2;
                                }
                            }
                        }
                    }
                }

                return selectedEventsNumber;

            }
        });

    self.commandsVM.notifyOnCompleteFunctions.push(function () {
        var undo = true;
        self.LayerManagerVM.ApplyFacetsForAnyPopupWindows(undo);
    });

    self.tutorial = new TutorialVM({
        cookie: "IHS_POPUP_450a4109-aca1-4d15-9c71-b21045d30bef",
        name: "MapPageTutorial",
        maxPages: $('.startHint').length
    });

    self.filterTabsVM = new FilterTabsVM(self.search);
    self.Zoom = initialZoomlevel;

    self.temporalSlider = new TemporalSliderVM(document.getElementById('temporalSlider'));

    var coordinates = $('#coordinates');
    self.getmapConfig = function () {
        $.get("Map/GetMapConfig", function (result) {
            self.mapConfig = result;
            self.LayerManagerVM.InitLayers(result.MapConfig, result);
            self.hideLoading();
        });
    };
    self.mapConfig = self.getmapConfig();
    /***  MAP EVENTS */
    map.on("extent-change", function (e) {
        if (map.loaded) {
            if (self.draw.isDrawing()) return;
            if ((e.delta && (e.delta.x !== 0 || e.delta.y !== 0)) || (e.levelChange)) {
                self.updateMapExtentFacet(true);
                self.updateLayers();
            }

            $('.esriPopupWrapper').draggable();
        }
    });
    map.on("zoom-end", function (event) {
        var geo = map.geographicExtent;
        self.setZoomLevel(event.level);
        self.zoomLevel(event.level);
    });
    map.on("zoom-start", function (event) {
        self.ClearAllGraphicsAndLayers();
    });
    map.on("pan-start", function (event) {
        self.ClearAllGraphicsAndLayers();
    });
    map.on("mouse-move", function (event) {
        self.showCoordinates(event);
    });

    map.on('measure-start', function () {
        self.isMeasuring(true);
    });
    map.on('measure-end', function () {
        self.isMeasuring(false);
    });

    self.updateMapExtentFacet = function (stopSearch) {
        var geo = map.geographicExtent;

        var southWest = geo.ymin.toFixed(5) + "," + geo.xmin.toFixed(5);
        var northEast = geo.ymax.toFixed(5) + "," + geo.xmax.toFixed(5);

        self.facetsVM.applyFacet("latlongs", southWest + "||" + northEast, true, undefined, stopSearch);
        self.search.updateHash(null, true);
    };

    self.updateLayers = function (updateRequestSender, constraintsToRemove) {
        var globalConstraints = self.getGlobalConstraints();
        self.LayerManagerVM.update(updateRequestSender || self.search.updateRequestSender.map, globalConstraints, constraintsToRemove);
    };

    self.getGlobalConstraints = function () {
        var searchConstraint = self.search.getQueryValue("q");

        if (!self.facetsVM.hasFacet("latlongs")) {
            self.updateMapExtentFacet(true);
        }

        var facetConstaint = self.search.getQueryValue("f");
        return { q: searchConstraint, f: facetConstaint, disableAggregation: self.disableAggregation(), highFidelity: self.highFidelity() };
    };
    ////////////////////////////////
    self.showLoading = function (layerId, layerTitle) {
        if(self.isMeasuring()) return;
        var exists = self.loadingLayers().filter(function (p) { return p.id === layerId }).length > 0;

        if (!exists) {
            self.loadingLayers.push({ id: layerId, title: layerTitle || layerId });
        }

        self.isLoading(true);
    };
    self.showPopup = function (items, template, completionFunction) { };

    self.hideLoading = function (layerId) {

        var exists = self.loadingLayers().filter(function (p) { return p.id === layerId });
        if (exists.length > 0) {
            self.loadingLayers.remove(exists[0]);
        }

        if (self.loadingLayers().length === 0) {
            self.isLoading(false);
            map.enableMapNavigation();
            map.showZoomSlider();
        }
    };

    self.ClearAllGraphicsAndLayers = function () {
        //map.graphics.clear();
    };
    self.setZoomLevel = function (newLevel) {
        pageLoadZoomLevel = newLevel;
    };
    self.enableExportData = function () {
        var enable = self.zoomLevel() > 4;
        if (self.disableAggregation() === true) {
            enable = true;
        }
        return enable;
    };
    self.exportDataTooltip = function() {
        return (self.enableExportData()
            ? "Export Bases with Orbats"
            : "Zoom in further to enable Export Bases with Orbats");
    };

    self.draw = new MapDrawing(map, self.LayerManagerVM.Layers);
    self.measure = new MapMeasurement(map);
    self.a11y = new MapA11y(map);

    ko.applyBindings(self, self.container);

    $(".page-header.with-search-bar").each(function () {
        ko.applyBindings(self, this);
    });
    self.search.registerFinishedCallback(function updateMap(result, updateRequestSender) {
        self.updateLayers(updateRequestSender);
    });

    //called by a click or something from the ui.
    self.print = function (btn, type) {
        self.mapPrinter.print(btn, type);
    };
    self.exportMapResults = function () {
        self.LayerManagerVM.ApplyFacetsForAnyPopupWindows();
        self.commandsVM.exportResults(true);
    };
    self.mapPrinter = new mapPrinter({
        mapDivId: "map",
        mapObject: map
    });
    self.resetPopupArrays = function () {
        self.LayerManagerVM.resetPopupArrays();
    };
    self.togglePanelSize = function (e) {
        var $ele = $(e);
        var $i = $ele.find("i");
        var $modal = $ele.closest(".modal-dialog");
        var $flex = $(".flexslider");
        var expand = $i.hasClass("icon-resize-full");
        var animateTime = 250;

        if (expand) {
            $modal.addClass("mapModal-Expanded")
                .removeClass("mapModal-Collapsed");

            $i.removeClass("icon-resize-full")
                .addClass("icon-resize-small");
        } else {
            $modal.addClass("mapModal-Collapsed")
                .removeClass("mapModal-Expanded");

            $i.removeClass("icon-resize-small")
                .addClass("icon-resize-full");
        }

        // Repaint flexbox if it is present.
        if ($flex.length > 0) {
            window.setTimeout(function() {
                $flex.data("flexslider").resize();
            }, animateTime);
            
        }

    }
    self.showCoordinates = function (evt) {
        //get mapPoint from event
        var mp = evt.mapPoint ? evt.mapPoint : evt;
        if (mp && mp.x && typeof (mp.x.toFixed) !== "undefined") {
            var coords = "X=" + mp.x.toFixed(3) + ", Y=" + mp.y.toFixed(3);
            mp = esri.geometry.webMercatorToGeographic(mp);
            coords = "Long=" + mp.x.toFixed(6) + ", Lat=" + mp.y.toFixed(6) + "<br/>" + coords;
            //display mouse coordinates
            coordinates.html(coords);
        }
    };

    self.resize = function () {
        var headerHeight = 0;
        if (!self.isfullScreen()) {
            var foot = document.getElementsByTagName("footer")[0];
            headerHeight = $("header").height() + foot.scrollHeight + $('header').offset().top;
            if(foot.scrollHeight !== foot.offsetHeight){
                foot.style.height = foot.scrollHeight+'px'
            }
        }
        $('#map').css('height', winHeight - headerHeight);
        $('#filter').css('height', winHeight - headerHeight);
        $('#main').css('max-width', document.innerWidth);
    };
    self.resize();

    $('#main').css('max-width', document.innerWidth);

    self.TogglefullScreen = function () {
        self.isfullScreen(!self.isfullScreen());
        var fullscreenBtn = $("#ToggleFullScreen", "#mapToolbar");
        fullscreenBtn.toggleClass("icon-resize-small icon-resize-full");

        $("header").toggle(!self.isfullScreen());
        $("footer").toggle(!self.isfullScreen());

        $("#filter").toggleClass("closed", self.isfullScreen());
        $('body').toggleClass("fullscreen", self.isfullScreen());

        self.resize();
    };

    self.setLayersOpacity = function (opacity) {
        self.LayerManagerVM.Layers()
            .forEach(function (l) {
                if (!l.isVisible()) return;
                l.getLayer(l.type).setOpacity(opacity);
            });
    };

    if (window.settings !== undefined) {
        window.settings.settings.push(new SettingVM("Map"));
        window.settings.settings.push(new SettingVM({
            Name: "MapDisableAggregation",
            Type: 0,
            Title: "Show all layers as single points on map",
            ReloadPage: false,
            Value: self.disableAggregation
        }));

        window.settings.settings.push(new SettingVM("News"));
        window.settings.settings.push(new SettingVM({
            Name: 'MapHighFidelity',
            Type: 0,
            Title: 'Enable High Relevancy',
            ReloadPage: false,
            Value: self.highFidelity,
            Info: "High relevancy means that the place is mentioned in the heading or towards the beginning of the article"
        }));
    }

    $(".with-data-bind").each(function () {
        if (ko.dataFor(this)) return;
        ko.applyBindings(self, this);
    });
};
/**
 * Initial function to get all the libs together and create the map.
 */



/**
 * 
 * @param {string} mapId the Id of the div which will contain the map. 
 * @param {Requester~requestCallback} callback - The callback function after the map has finished initialising
 */
MapPageVM.initialise = function (mapId, callback, options) {

    var self = this;

    self.options = $.extend({
        title: "",
        categoryName: "noset",
        startLoadingCallback: function () {
        },
        finishedLoadingCallback: function () {
        },
        searchbox: true,
        overviewMap: true
    }, options);

    require(["esri/urlUtils",
        "esri/dijit/Search",
        "esri/dijit/Scalebar",
        "esri/map",
        "esri/dijit/OverviewMap",
        "esri/geometry/Point",
        "esri/geometry/Polygon",
        "esri/graphic",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/layers/GraphicsLayer",
        "esri/Color",
        "esri/SpatialReference",
            "esri/geometry/Circle",
        "esri/geometry/webMercatorUtils",
        "esri/layers/FeatureLayer",
        "esri/layers/WebTiledLayer",
        "esri/InfoTemplate",
        "esri/tasks/query",
        "esri/dijit/BasemapGallery",
        "esri/toolbars/draw",
        "esri/toolbars/edit",
        "dojo/on"],
        function (urlUtils, Search, ScaleBar, Map, OverviewMap, Point, Polygon, Graphic, PictureMarkerSymbol, esriSimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, GraphicsLayer, Color, SpatialReference, Circle, webMercatorUtils, esriFeatureLayer, EsriWebTiledLayer, esriInfoTemplate, query, esriDigitBasemapGallery, Draw, Edit, on) {
            esri.config.defaults.io.corsEnabledServers.push("virtualearth.net");
            esri.config.defaults.io.useCors = true;
            var searchQuery = window.location.search.substring(1) + window.location.hash;
            var minZoomLevel = 3;
            var centreX = 20, centreY = 20;

            var map = new Map(mapId, {
                minZoom: minZoomLevel, // needs to be higher than expected so the layermanager can nudge it
                maxZoom: 20,
                resizeDelay: 400,
                sliderPosition: "top-right",
                wrapAround180: true,
                center: [centreX, centreY],
                basemap: 'streets'
            });

            // Add root layer, this enables other layers to be reordered.
            map.addLayer(new GraphicsLayer({
                id: "root"
            }));

            var esriLibs = {
                Color: Color,
                Point: Point,
                Polygon: Polygon,
                Graphic: Graphic,
                SimpleMarkerSymbol: esriSimpleMarkerSymbol,
                SimpleFillSymbol: SimpleFillSymbol,
                SimpleLineSymbol: SimpleLineSymbol,
                PictureMarkerSymbol: PictureMarkerSymbol,
                GraphicsLayer: GraphicsLayer,
                SpatialReference: SpatialReference,
                webMercatorUtils: webMercatorUtils,
                Circle: Circle,
                FeatureLayer: esriFeatureLayer,
                WebTiledLayer: EsriWebTiledLayer,
                InfoTemplate: esriInfoTemplate,
                query: query,
                on: on,
                urlUtils: urlUtils
            }

            map.on("load", function () {

                dojo.create("i", {
                    className: "icon-globe large actionable u-margin-Txxs u-margin-Bxxxs",
                    title: 'Zoom to Full Extent',
                    onclick: function () {
                        map.centerAndZoom(new esri.geometry.Point(centreX, centreY), minZoomLevel);
                    }
                }, dojo.query(".esriSimpleSliderIncrementButton")[0], "after");

                //To get the map zoom working
                map._params.minZoom = 2;
                $(map._decButton).removeClass('esriSimpleSliderDisabledButton');
                var zoom = map.getZoom();
                map._simpleSliderZoomHandler(0, 0, 0, zoom);
            });

            if (self.options.searchbox) {
                var searchBox = new Search({
                    map: map,
                    enableInfoWindow: false
                }, "searchBoxDiv");
                searchBox.startup();
            }


            var scalebar = new ScaleBar({
                map: map,
                scalebarUnit: "dual"
            }, dojo.byId("scalebar"));

            if (self.options.overviewMap) {
                var overviewMapDijit = new OverviewMap({
                    map: map,
                    attachTo: "bottom-left",
                    visible: false,
                    width: (map.width / 5),
                    height: (map.height / 5)
                });
                overviewMapDijit.startup();
            }

            var mapPageVm = new MapPageVM(containerId, searchQuery, map, pageLoadZoomLevel, esriLibs, self.options);

            $(document).bind('ResizeEventCalled', function (e) {
                mapPageVm.resize();
            });

            function cleanUp() {
                map.infoWindow.hide();
                clusterLayer.clearSingles();
            }
            function error(err) {
                console.log("something failed: ", err);
            }

            callback(mapPageVm);
        });
};

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    var textAreaStyle = textArea.style;
  
    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //
  
    // Place in top-left corner of screen regardless of scroll position.
    textAreaStyle.position = 'fixed';
    textAreaStyle.top = 0;
    textAreaStyle.left = 0;
  
    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textAreaStyle.width = '2em';
    textAreaStyle.height = '2em';
  
    // We don't need padding, reducing the size if it does flash render.
    textAreaStyle.padding = 0;
  
    // Clean up any borders.
    textAreaStyle.border = 'none';
    textAreaStyle.outline = 'none';
    textAreaStyle.boxShadow = 'none';
  
    // Avoid flash of white box if rendered for any reason.
    textAreaStyle.background = 'transparent';
  
  
    textArea.value = text;
  
    document.body.appendChild(textArea);
  
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
    } catch (err) {
    }
  
    document.body.removeChild(textArea);
  }