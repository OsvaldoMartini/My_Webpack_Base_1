var EsriMapWidget = function (mapId, country, containerId, options) {
    var self = this;
    self.mapId = mapId;
    self.country = ko.observable(country);
    self.container = $("#" + containerId);
    self.options = ko.observable(options || {});
    self.layers = {};
    self.infoWindow = null;
    self.activeLayerNames = ko.observableArray([]);
    self.basemapGallery = null;
    self.map = null;
    self.isExtentSet = true;
    self.isLegendOpen = ko.observable(options.IsLegendOpen);

    var newMaprequest;

    self.initialise = function (myMapWidget) {
        require([
                "esri/map", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/virtualearth/VETiledLayer",
                "esri/request", "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
                "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/dijit/PopupTemplate",
                "esri/renderers/ClassBreaksRenderer", "esri/geometry/webMercatorUtils",
                "/Assets/Javascript/ClusterLayer.js", "esri/SpatialReference", "esri/geometry/Point",
                "esri/InfoTemplate", "esri/dijit/BasemapGallery", "dojo/_base/array", "dojo/domReady!"
        ],
            function (esriMap,
                esriGraphicsLayer,
                esriFeatureLayer,
                esriVeTileLayer,
                esriRequest,
                esriPoint,
                esriGraphic,
                esriGraphicUtils,
                esriPictureMarkerSymbol,
                esriSimpleMarkerSymbol,
                PopupTemplate,
                ClassBreaksRenderer,
                webMercatorUtils,
                ClusterLayer,
                SpatialReference,
                Point,
                esriInfoTemplate,
                esriDigitBasemapGallery,
                dojoArray) {
                var map, basemapGallery;

                function createBasemapGallery() {
                    //Manually create a list of basemaps to display
                    var basemaps = [];
                    var basemapRoad = new esri.dijit.Basemap({
                        layers: [
                            new esri.dijit.BasemapLayer({
                                url: "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer",
                            })
                        ],
                        id: "dgRoad",
                        title: "Road"
                    });
                    basemaps.push(basemapRoad);
                    var basemapAerial = new esri.dijit.Basemap({
                        layers: [
                            new esri.dijit.BasemapLayer({
                                url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
                            })
                        ],
                        id: "dgAerial",
                        title: "Aerial"
                    });
                    basemaps.push(basemapAerial);
                    var basemapAerialLabels = new esri.dijit.Basemap({
                        layers: [
                            new esri.dijit.BasemapLayer({
                                url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
                            }),
                            new esri.dijit.BasemapLayer({
                                url: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer"
                            })
                        ],
                        id: "dgAerialLabels",
                        title: "Aerial with Labels"
                    });
                    basemaps.push(basemapAerialLabels);

                    basemapGallery = new esri.dijit.BasemapGallery({
                        showArcGISBasemaps: false,
                        basemaps: basemaps,
                        map: map
                    });
                    myMapWidget.basemapGallery = basemapGallery;
                    //BasemapGallery.startup isn't needed because we aren't using the default basemap, instead
                    //we are going to create a custom user interface to display the basemaps, in this case a menu.
                    dojo.forEach(basemapGallery.basemaps,
                        function (basemap) {
                            //Add a menu item for each basemap, when the menu items are selected
                            $(".baseMap .dropdown-menu", this.container)
                                .append("<li><a href=\"javascript:void(0)\" data-id=\"" +
                                    basemap.id +
                                    "\">" +
                                    basemap.title +
                                    "</a></li>");
                        },
                        myMapWidget);
                    $(".baseMap a", myMapWidget.container)
                        .click(function (evt) {
                            basemapGallery.select($(evt.target).data("id"));
                        });

                    basemapGallery.select("dgRoad");
                }

                /**
                * Creates a graphic marker to be displayed on the map or layer if an ImageUrl is supplied
                * it will assume a width of 23 and a height of 28, or you can supply an obecjt with the format
                * { Width: xx, Height:yy, Url: /Asset..../ddd.jpg }
                *
                * @param {} marker
                * @returns {esriGraphic} Esri Graphic
                */
                function createMarker(marker) {
                    var myMarker = marker;
                    var graphic;
                    var longitude = myMarker.Longitude;
                    var latitude = myMarker.Latitude;
                    var infoTemplate = new esriInfoTemplate();
                    infoTemplate.title = myMarker.Title;
                    infoTemplate.content = myMarker.Description;
                    var markerImage = "/Map/Icon/" + myMarker.TypeId;
                    if (myMarker.TypeId === 0) {
                        graphic = new esri.Graphic(new esri.geometry.Point(longitude, latitude),
                            new esri.symbol.SimpleMarkerSymbol(),
                            myMarker,
                            infoTemplate);
                    } else {
                        var imageUrl = markerImage;
                        var width = 23;
                        var height = 23;
                        if (!markerImage.constructor === "".constructor) {
                            //if marker is not a string assume it is an object and pull out the relevant properties
                            width = markerImage.Width;
                            height = markerImage.Height;
                            imageUrl = markerImage.Url;
                        }
                        var symbol = new esriPictureMarkerSymbol(imageUrl, width, height);
                        graphic = new esriGraphic(new esriPoint(longitude, latitude), symbol, myMarker, infoTemplate);
                    }
                    return graphic;
                }; /**
        * Method is invoked when a graphic is clicked,
        * Effectively goes and fetched any additional Information associated with
        * the marker and adds it to to the info window.
        * @param {esri UIEvent} evt
        */
                function displayMarkerInfo(evt) {
                    if (evt.graphic.attributes.Loaded == null || evt.graphic.attributes.Loaded === false) {
                        $.ajax({
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            url: "/Widget/Map/GetAdditionalData",
                            data: JSON.stringify({
                                'installationId': evt.graphic.attributes.Id
                            }),
                            success: function (data) {
                                if (data != null) {
                                    var additionalData = '';
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        var item = data[i];
                                        additionalData += '<b>' + item.Key + '</b>: ' + item.Value + '</br>';
                                    }
                                    evt.graphic.infoTemplate.content += additionalData;
                                    evt.graphic.attributes.Loaded = true;
                                    map.infoWindow.setFeatures([evt.graphic]);
                                }
                            }
                        });
                    } else {
                        map.infoWindow.setFeatures([evt.graphic]);
                    }
                }

                /**
             * Creates / updates a layer with the supplied map markers
             * @param {} layerName
             * @param {} mapMarkers
             * @param {} cluster
             */
                function addLayer(layerName, mapMarkers, cluster) {
                    var layer = map.getLayer(layerName);
                    if (layer == null) {
                        if (cluster) {
                            layer = addClusters(layerName, mapMarkers);
                            map.infoWindow.on("hide",
                                function (e) {
                                    cleanUp(layer);
                                });
                        } else {
                            layer = createSimpleLayer(layerName);
                            layer.on("click", displayMarkerInfo);
                        }
                        map.addLayers([layer]);
                    }
                    if (!cluster) {
                        var features = new Array();
                        for (var i = 0; i < mapMarkers.length; i++) {
                            var marker = mapMarkers[i];
                            marker.loadedData = false;
                            var gMarker = createMarker(marker);
                            features.push(gMarker);
                        }
                        layer.applyEdits(features,
                            null,
                            null,
                            function (e) { }, //complete
                            function (e) { } // error
                        );
                    }

                    if (!layer
                        .visible &&
                        !$('.mapCheckBox[value="' + layerName + '"]', self.container).is('[disabled]'))
                        layer.show();

                    //$('#' + layerName, myMapWidget.container).prop('checked', true);
                }; /**
           * Creates simple layer for single items
           * @param {} layerName
           * @returns {esri Feature Layer}
           */
                function createSimpleLayer(layerName) {
                    var featureCollection = {
                        "featureSet": {
                            "features": [],
                            "geometryType": "esriGeometryPoint"
                        },
                        "layerDefinition": {
                            "geometryType": "esriGeometryPoint",
                            "objectIdField": "ObjectID",
                            "drawingInfo": {
                                "renderer": {
                                    "type": "simple"
                                }
                            },
                            "fields": [
                                {
                                    "name": "ObjectID",
                                    "alias": "ObjectID",
                                    "type": "esriFieldTypeOID"
                                }
                            ]
                        }
                    };
                    return new esriFeatureLayer(featureCollection,
                    {
                        id: layerName
                    });
                }

                /**
                  * Creates cluster layer for grouped items
                  * @param {} layerName
                  * @param {} mapMarkers
                  * @returns {}
                  */
                function addClusters(layerName, mapMarkers) {
                    var markers = {};
                    var wgs = new SpatialReference({
                        "wkid": 4326
                    });
                    markers.data = dojoArray.map(mapMarkers,
                        function (p) {
                            var latlng = new Point(parseFloat(p.Longitude), parseFloat(p.Latitude), wgs);
                            var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
                            return {
                                "x": webMercator.x,
                                "y": webMercator.y,
                                "attributes": p
                            };
                        });
                    // popupTemplate to work with attributes specific to this dataset
                    var popupTemplate = new PopupTemplate({
                        title: "{Title}",
                        description: "{Description}"
                    });
                    // cluster layer that uses OpenLayers style clustering
                    var clusterLayer = new ClusterLayer({
                        "data": markers.data,
                        "distance": 100,
                        "id": layerName,
                        "labelColor": "#fff",
                        "labelOffset": 10,
                        "resolution": map.extent.getWidth() / map.width,
                        "singleColor": "#888",
                        "singleTemplate": popupTemplate
                    });
                    var defaultSym = new esriSimpleMarkerSymbol().setSize(4);
                    var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");
                    var small = new esriPictureMarkerSymbol("/Assets/Images/Map/Markers/googlemarker1.png", 20, 20)
                        .setOffset(0, 15);
                    var medium = new esriPictureMarkerSymbol("/Assets/Images/Map/Markers/googlemarker2.png", 34, 34)
                        .setOffset(0, 15);
                    var large = new esriPictureMarkerSymbol("/Assets/Images/Map/Markers/googlemarker3.png", 46, 46)
                        .setOffset(0, 15);
                    renderer.addBreak(0, 2, small);
                    renderer.addBreak(2, 100, medium);
                    renderer.addBreak(100, 10001, large);
                    clusterLayer.setRenderer(renderer);
                    return clusterLayer;
                }

                function cleanUp(clusterLayer) {
                    clusterLayer.clearSingles();
                }

                function clearLayers(remove) {
                    (myMapWidget.options().Layers || []).forEach(function (layer) {
                        clearLayer(layer.LayerName, remove);
                    });
                }

                /*********************************************************************************
             * Clears all of the graphics from the supplied layer
             * @param {String} layerName Name of the layer to clear.
             * @param {Bool} remove A value indicating whether to remove the layer, not just clear it.
             */
                function clearLayer(layerName, remove) {
                    var layer = map.getLayer(layerName);
                    if (!layer)
                        return;
                    if (remove) {
                        map.removeLayer(layer);
                        return;
                    }
                    layer.hide();
                    //if this is a dashboard widget, update the settingsw
                    updateWidgetSettings();
                }; /**
         * Fetches the layer from the webservices, and then forward the response to the
         * plotting function
         * @param {String} markerType The layer Id.
         */
                function fetchLayer(markerType) {
                    var layer = map.getLayer(markerType);
                    if (layer) {
                        if (!layer.visible &&
                            !$('.mapCheckBox[value="' + markerType + '"]', self.container).is('[disabled]'))
                            layer.show();
                        updateWidgetSettings();
                        return;
                    }

                    switch (markerType) {
                        case "JticBubble_Events":
                            // WARNING this string comes from the mapmarker options in JanesCountryService EnumMapLayer.
                            // Currently its brittle and could do with tieing together a bit more.
                            AddBubbleLayer(markerType);
                            break;
                        default:
                            var data = {
                                subject: myMapWidget.country(),
                                markerType: markerType
                            };
                            $.ajax({
                                url: "/Widget/Map/GetLayer",
                                method: "POST",
                                data: data
                            })
                                .done(function (data) {
                                    addLayer(data.LayerName, data.Markers, data.Cluster);
                                    updateWidgetSettings();
                                    myMapWidget.options().Layers = myMapWidget.options().Layers || [];
                                    myMapWidget.options().Layers.push(data);
                                });
                    }
                }

                self.showLoading = function () {
                    self.container.find('.loading').removeClass('hidden').addClass('show');
                };

                function AddBubbleLayer(id) {
                    var cfg = {
                        categoryName: "JTICONLINEEVENTS",
                        providerName: "JanesJTIC_OnlineSQLProvider",
                        bubbleScaleFactor: 0.7,
                        bubbleFontSize: "10px",
                        mapVm: {
                            showLoading: function () {
                                self.showLoading();
                            },
                            hideLoading: function () {
                                self.container.find('.loading').removeClass('show').addClass('hidden');
                            },
                        },
                        id: id,
                        layerManagerVm: self,
                        a: 1,
                        enableFacetPanel: false,
                        isVisible: true,
                        type: layerTypeEnum.Marker
                    };

                    self.esriLibs = {
                        Point: Point,
                        PictureMarkerSymbol: esriPictureMarkerSymbol,
                        Graphic: esriGraphic,
                        GraphicsLayer: esriGraphicsLayer,
                        SpatialReference: SpatialReference
                    };
                    cfg.wgs = new SpatialReference({
                        "wkid": 4326
                    });

                    var layer = new MarkerLayerVM(cfg);
                    map.on("extent-change",
                        function () {
                            var maplayer = layer.getLayer(layer.type);
                            if (maplayer && maplayer.visible) {
                                layer.update("extent-change", self.map, self.map.geographicExtent, self.map.getZoom(), self.getGlobalConstraints());
                            }
                        });
                    
                    layer.update("layerAdded", self.map, self.map.geographicExtent, self.map.getZoom(), self.getGlobalConstraints());
                    map.addLayers([layer.getLayer()]);
                };

                function createExtentManager() {
                    /**
                     * Fetches the extent data from the webservices, and then forward the response to the
                     * plotting function
                     * @returns {}
                     */
                    self.fetchMapExtent = function () {
                        clearLayers(true);
                        if (!myMapWidget.country()) {
                            var zoom = self.setZoomLevel(0)
                            map.centerAndZoom(new esri.geometry.Point({ latitude: 22, longitude: -5 }), zoom);

                            $('.mapCheckBox:not([disabled])', self.container)
                                .each(function () {
                                    var layerName = this.getAttribute('value');
                                    var layer = map.getLayer(layerName);
                                    if (layer) layer.show();
                                });
                        }

                        if (self.isExtentSet) {
                            loadLayers();
                            var extent = createExtent();
                            if(extent) map.setExtent(extent, true);
                            return;
                        }

                        var data = {
                            subject: myMapWidget.country(),
                            layers: myMapWidget.activeLayerNames().join()
                        };
                        cancelLastMapRequest();
                        newMaprequest = $.ajax({
                            url: "/Widget/Map/GetNewMap",
                            method: "POST",
                            data: data
                        })
                            .done(function (data) {
                                myMapWidget.options($.extend({}, myMapWidget.options(), data));

                                var extent = createExtent();
                                if (extent) {
                                    map.setExtent(extent, true);
                                }

                                loadLayers();
                            })
                            .always(function () {
                                self.container.find('.loading').removeClass('show').addClass('hidden');
                            });
                    };

                    function changeFooterLink() {
                        var link = myMapWidget.container.find('.widgetfooter .list-group-item');
                        changeWidgetFooterLink(link, "EVENT_COUNTRY", myMapWidget.country());
                    };

                    myMapWidget.country.subscribe(function (country) {
                        self.isExtentSet = false;
                        self.fetchMapExtent();
                        changeFooterLink();
                        self.isExtentSet = true;
                    });
                    changeFooterLink();
                };

                self.setZoomLevel = function (requestZoom) {
                    var minZoom = 0;
                    var width = self.map.width;
                    if (width > 500) minZoom = 1;
                    if (width > 1050) minZoom = 2;
                    if (width > 2000) minZoom = 3;

                    var zoom = self.map.getZoom();
                    var newZoom = minZoom;
                    if (zoom >= minZoom) {
                        newZoom = zoom;
                    }

                    if (requestZoom != undefined && requestZoom > -1) {
                        newZoom = Math.max(requestZoom, minZoom);
                    }

                    return newZoom;
                };
                self.getGlobalConstraints = function () {
                    var date = new Date();
                    date.setYear(date.getFullYear() - 1);
                    return {
                        f: this.updateMapExtentFacet() + "<and>START_DATE(" + date.getFullYear() + "-" + ('0'+(date.getMonth() + 1)).substr(-2) + "-" + date.getDate() + "::)"
                    };
                };
                self.updateMapExtentFacet = function (stopSearch) {
                    var geo = map.geographicExtent;

                    var southWest = geo.ymin.toFixed(5) + "," + geo.xmin.toFixed(5);
                    var northEast = geo.ymax.toFixed(5) + "," + geo.xmax.toFixed(5);

                    return "latlongs("+southWest + "||" + northEast+")";
                };

                function updateWidgetSettings() {
                    if (myMapWidget.updateSettings !== undefined) {
                        myMapWidget.updateSettings("layers", myMapWidget.activeLayerNames().join());
                    }
                }

                /*
                 * Creates an Extent object using the widget option.
                 */
                function createExtent() {

                    var opts = myMapWidget.options();

                    if (opts.SW_Latitude === null ||
                        opts.SW_Longitude === null ||
                        opts.NE_Latitude === null ||
                        opts.NE_Longitude === null) {
                        return undefined;
                    }

                    return new esri.geometry.Extent(opts.SW_Longitude,
                        opts.SW_Latitude,
                        opts.NE_Longitude,
                        opts.NE_Latitude);
                }

                function loadLayers() {
                    var layers = myMapWidget.options().Layers || [];
                    for (var i = 0; i < layers.length; i++) {
                        var layer = layers[i];
                        addLayer(layer.LayerName, layer.Markers, layer.Cluster);
                        if (myMapWidget.activeLayerNames.indexOf(layer.LayerName) < 0 && layer.IsSelected)
                            myMapWidget.activeLayerNames.push(layer.LayerName);

                        if (!layer.IsSelected) {
                            clearLayer(layer.LayerName);
                        }
                    }
                }

                function cancelLastMapRequest() {
                    if (newMaprequest && newMaprequest.abort) {
                        newMaprequest.abort();
                    }
                }

                /**
                 * Initialises and creates the esri map
                 */
                function init() {
                    map = new esri.Map(myMapWidget.mapId,
                    {
                        extent: createExtent(),
                        logo: false,
                        fitExtent: true
                    });

                    myMapWidget.map = map;
                    map.autoResize = true;
                    createBasemapGallery();
                    map.on("load",
                        function () {
                            loadLayers();
                            if (myMapWidget.options().SW_Longitude === null) {
                                self.fetchMapExtent();
                            }
                        });
                    createExtentManager();
                    myMapWidget.activeLayerNames.subscribe(function (newValues) {
                        var self = this;
                        var currentLayers = self.map.getLayersVisibleAtScale()
                            .filter(function (l) {
                                return l.visible;
                            })
                            .map(function (l) {
                                return l.id;
                            });
                        currentLayers.shift();
                        _(currentLayers)
                            .difference(newValues)
                            .forEach(function (layer) {
                                clearLayer(layer);
                            });
                        _(newValues)
                            .difference(currentLayers)
                            .forEach(function (layer) {
                                fetchLayer(layer);
                            });
                    },
                        myMapWidget);

                    map.on('mouse-drag-end', function () {
                        self.isExtentSet = false;
                    });
                }

                dojo.ready(init);
            });

    };

    self.initialise(self);

    self.search = {};
};
//If we can, register the functions super class as the widget base. Allows for specific events to be raised.
//e.g. onDashboardResize, onWidgetExpand, onWidgetMinify, onWidgetRemove
if (typeof WidgetBase === 'function') {
    EsriMapWidget.prototype = new WidgetBase();
}
EsriMapWidget.prototype.changeBasemap = function (baseMap) {
    var self = this;
    self.basemapGallery.select(baseMap.id);
};
EsriMapWidget.prototype.onSubjectChange = function (subject) {
    var self = this;
    self.container.find('.loading').removeClass('hidden').addClass('show');
    self.country(subject);
};

EsriMapWidget.prototype.expandLegend = function () {
    var self = this;
    var isOpen = self.isLegendOpen();
    self.isLegendOpen(!isOpen);

    self.updateSettings("IsLegendOpen", !isOpen);
};

EsriMapWidget.prototype.findLayer = function (name) {
    var self = this;
    return _.findWhere(self.options().Layers, { LayerName: name }) || { Markers: [] };
}