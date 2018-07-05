/**
 * Layer manager class for esri4Map
***/
var LayerManager = function (map, mapPageViewModel) {
    var self = this;
    self.map = map;
    self.mapPageVM = mapPageViewModel;

    self.LayersHierachy = ko.observableArray();
    self.Layers = ko.computed(function () {
        var layers = [];
        function getLayers(l) {
            var layerArr = [];
            if (l.children().length) {
                layerArr = l.children();
            }
            if(l.type !== layerTypeEnum.Group){
                layerArr = [l].concat(layerArr);
            }
            return layerArr;
        }
        self.LayersHierachy().forEach(function (l) {
            layers = layers.concat(getLayers(l));
        });
        return layers;
    });
    self.layersWithFacets = ko.computed(function () {
        var result = self.Layers().filter(function (p) {
            return p.hasFacets &&
                p.facets &&
                p.isVisible() &&
                (!p.parentLayer || p.parentLayer.type != layerTypeEnum.Combined);
        });

        return result;
    });
    self.basemaps = ko.observableArray();
    self.basemapGallery = undefined;
    self.esriLibs = self.mapPageVM.esriLibs;
    self.mapConfig = {};
    self.activeFacetVM = ko.observable();

    /** Update function called on map change or filters change. Will pass on to each layer.
    *   @param {string} updateRequestSender - The type of update such as facetPanel.
    *   @param {object} globalConstraints - The search constraints that will apply to all layers of the map.
    **/
    self.update = function (updateRequestSender, globalConstraints, constraintsToRemove) {
        if (!self.map.loaded) {
            return;
        }
        var geo = self.map.geographicExtent;
        var zoom = self.map.getZoom();
        if (updateRequestSender !== self.mapPageVM.search.updateRequestSender.pageLoad) {
            // update the location
            var center = map.extent.getCenter();
            center = self.esriLibs.webMercatorUtils.webMercatorToGeographic(center);
            var mapZoomAndCentre = center.x.toFixed(6) + "," + center.y.toFixed(6) + "," + zoom;
            self.mapPageVM.search.setQueryValue(self.mapPageVM.search.queryProperty.mapZoomAndCentre, mapZoomAndCentre);
            self.updateLayerQuerystring(false);
            self.mapPageVM.search.updateHash();
        }
        self.Layers().forEach(function(lyr){
            if (lyr.isVisible()) {
                lyr.update(updateRequestSender, map, geo, zoom, globalConstraints || {}, constraintsToRemove);
            }
        });
    };

    self.showFacets = function (facetVM) {
        self.activeFacetVM(facetVM);
        $('.nav-tabs a[href="#filters_tab"]').tab('show');
    }

    self.setMinZoom = function () {
        //SHOULD BE MADE REDUNDANT SOON, LEFT IN JUST IN CASE.
        var minZoom = 0;
        var width = self.map.width;
        if (width > 500) { minZoom = 1; }
        if (width > 1050) { minZoom = 2; }
        if (width > 2000) { minZoom = 3; }

        self.map._params.minZoom = minZoom;
        $(map._decButton).removeClass('esriSimpleSliderDisabledButton');
        var zoom = self.map.getZoom();
        map._simpleSliderZoomHandler(0, 0, 0, zoom);
        self.map.setZoom(minZoom);
    };
    //map.on('resize', function (e) { self.setMinZoom(); });

    self.ApplyFacetsForAnyPopupWindows = function (undo) {
        for (var i = 0; i < self.Layers().length; i++) {
            var layer = self.Layers()[i];
            if (layer.isVisible()) {
                layer.ApplyFacetsForAnyPopupWindows(undo);
            }
        }
    }
    self.resetPopupArrays = function () {
        for (var i = 0; i < self.Layers().length; i++) {
            var layer = self.Layers()[i];
            if (layer.isVisible()) {
                layer.resetPopupArrays();
            }
        }
    };
    self.updateLayerQuerystring = function (bUpdateHash) {
        var mapLayers = "";
        for (var i = 0; i < self.Layers().length; i++) {
            var layer = self.Layers()[i];
            if (layer.isVisible()) {
                mapLayers = mapLayers + layer.id + ",";
            }
        }
        self.mapPageVM.search.setQueryValue(self.mapPageVM.search.queryProperty.mapLayers, mapLayers);
        if (bUpdateHash) {
            self.mapPageVM.search.updateHash();
        }
    };

    self.setupBaseLayers = function (mapconfig) {
        var self = this;
        var defaultLayerId;
        var basemaps = [];
        var configBaseLayers = mapconfig.base_layers;

        for (var i = 0; i < configBaseLayers.length; i++) {

            var config = configBaseLayers[i];

            var basemapLayers = [];

            var configLayers = config.layer;
            for (var clIndex = 0; clIndex < configLayers.length; clIndex++) {

                var configLayer = configLayers[clIndex];

                var baseLayerArgs = { type: configLayer.layerType, id: config.id };

                for (var j = 0; j < configLayer.property.length; j++) {
                    var prop = configLayer.property[j];

                    var val = "";
                    switch (prop.type) {
                        case "integer":
                        case 1:
                            val = parseInt(prop.value);
                            break;
                        case "float":
                        case 2:
                            val = parseFloat(prop.value);
                            break;
                        case "array":
                        case 3:
                            val = eval(prop.value);
                            break;
                        case "string":
                        case 0:
                        default:
                            val = prop.value;
                            break;
                    }

                    baseLayerArgs[prop.name] = val;
                }

                basemapLayers.push(new esri.dijit.BasemapLayer(baseLayerArgs));
            }

            var basemap = new esri.dijit.Basemap({
                layers: basemapLayers,
                id: config.id,
                title: config.title,
                thumbnailUrl: config.thumbnail
            });

            basemap.css = config.css;

            basemaps.push(basemap);

            if (config.isDefaultLayer) {
                defaultLayerId = basemap.id;
            }
        }

        self.basemapGallery = new esri.dijit.BasemapGallery({
            showArcGISBasemaps: false,
            basemaps: basemaps,
            map: self.map
        }, "basemapGallery");
        self.basemapGallery.startup();

        self.basemaps(basemaps);

        if (defaultLayerId) {
            self.basemapGallery.select(defaultLayerId);
        }
    };

    /**
     * Sets up layer from layer options.
     * @param {object} layer - options from the server.
     */
    self.SetupLayer = function (layer) {
        var layerOptions = {
            isVisible: false,
            title: layer.Title,
            id: layer.Id,
            xOffSet: layer.XOffset,
            categoryName: layer.CategoryName,
            providerName: layer.ProviderName,
            icon: layer.Icon,
            detailImage: layer.DetailImage,
            hasFacets: layer.HasFacets,
            parentServiceId: layer.ParentServiceId,
            startLoadingCallback: self.mapPageVM.showLoading,
            finishedLoadingCallback: self.mapPageVM.hideLoading,
            showFacetsCallback: self.showFacets,
            getGlobalConstraints: function () { return self.mapPageVM.getGlobalConstraints() },
            applyMapExtent: self.mapPageVM.setMapExtent,
            layerManagerVm: self,
            modalId: self.mapPageVM.modalId,
            isBottom: layer.IsBottomLayer,
            subLayerKey: layer.SubLayerFacet,
            queryString: layer.QueryString,
            urlKey: layer.CategoryKey || undefined,
            children: layer.Children || [],
            exportData: layer.ExportData,
            help: layer.Help || undefined,
            static: !!layer.Static,
            isTextSearchable: layer.IsTextSearchable,
            type: layer.LayerType,
            choropleth: layer.Choropleth,
            colours: layer.Colours,
            temporal: layer.Temporal,
            popover: layer.Options,
            activeChildren: layer.ActiveChildren,
            hiddenLayers: layer.HiddenLayers || [],
            hidden: layer.IsHidden || false,
            facetsVisible: layer.FacetsVisible || false
        };

        var layerVm;

        if (layerOptions.type & layerTypeEnum.Marker || layerOptions.type & layerTypeEnum.Choropleth || layerOptions.type & layerTypeEnum.Heatmap) {
            return new MarkerLayerVM(layerOptions);
        }
        else if (layer.LayerType & layerTypeEnum.RangedMarker) {
            return new RangedMarkerLayerVM(layerOptions);
        }
        else if (layer.LayerType & layerTypeEnum.Group) {
            return new GroupLayerVM(layerOptions);
        }
        else if (layer.LayerType & layerTypeEnum.Combined) {
            return new CombinedLayerVM(layerOptions);
        }
        else {
            // Inherit from parent layer
            layerOptions.commandsVM = layer.commandsVM || null;
            if (layerOptions.commandsVM !== null) {
                layerOptions.commandsVM.options.commandsType = "mapHidden";
            }
            return new EmptyLayerVM(layerOptions);
        }

        return null;
    };

    /**
    Called once the map is loaded
    **/
    self.InitLayers = function (mapconfig, mapModel) {

        self.mapConfig = mapconfig;

        self.setupBaseLayers(mapconfig);

        var configLayers = self.initLayers2(mapconfig, mapModel);

        var layerToAutoLoad;

        for (var layerIndex = 0; layerIndex < mapModel.Layers.length; layerIndex++) {

            var layr = mapModel.Layers[layerIndex];

            var layerVm = self.SetupLayer(layr);

            if (layr.IsVisible) {
                layerToAutoLoad = layerVm;
            }

            self.mapPageVM.temporalSlider.addLayer(layerVm);

            self.LayersHierachy.push(layerVm);
        }

        if (layerToAutoLoad) {
            layerToAutoLoad.isVisible(true);
            layerToAutoLoad.getFacetsVM();
        }

        self.showBaseLayers(mapconfig);
        self.getSelectedLayersFromSearch();
    };

    self.showBaseLayers = function (mapconfig) {

        var groupEsriLayers = self.SetupLayer({
            LayerType: layerTypeEnum.Group,
            Title: 'Energy Layers',
            Icon: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        });
        groupEsriLayers.options.toggleChildren = false;
        var layerList = groupEsriLayers.children;
        if (!self.LayersHierachy().length) layerList = self.LayersHierachy;

        for (var i = 0; i < mapconfig.services.service.length; i++) {
            var svc = mapconfig.services.service[i];
            // if this is a map layer, show it - if its something like an arcgis, add sublayers.
            switch (svc.arcgis_service_type) {
                case serviceTypeEnum.ArcGISDynamicMapServiceLayer:
                    {
                        if (svc.layers != null) {
                            for (var l = 0; l < svc.layers.length; l++) {
                                layerList.push(new EsriMapLayerVM({
                                    isVisible: false,
                                    title: " " + svc.layers[l].title,
                                    id: svc.layers[l].id,
                                    layerType: "ArcGISDynamicMapServiceLayer",
                                    xOffSet: 0,
                                    //testing,
                                    parentServiceId: svc.id,
                                    layerManagerVm: self
                                }, self));
                            }
                        } else {
                            layerList.push(new EsriMapLayerVM({
                                isVisible: false,
                                title: svc.title,
                                id: svc.id,
                                layerType: "ArcGISDynamicMapServiceLayer",
                                xOffSet: 0,
                                layerManagerVm: self
                            }, self));
                        }
                        break;
                    }
                case serviceTypeEnum.ArcGISTiledMapServiceLayer:
                    {
                        layerList.push(new EsriMapLayerVM({
                            isVisible: false,
                            title: svc.title,
                            id: svc.id,
                            layerType: "ArcGISTiledMapServiceLayer",
                            xOffSet: 0,
                            layerManagerVm: self
                        }, self));
                        break;
                    }
                case serviceTypeEnum.VETiledLayer:
                    {
                        self.Basemaps.push(
                            new EsriMapLayerVM({
                                isVisible: false,
                                title: svc.title,
                                css: self.getLayerCss(svc.bing_map_style),
                                id: svc.id,
                                layerType: "VETiledLayer",
                                xOffSet: 0, //testing,
                                layerManagerVm: self
                            }, self));
                        break;
                    }
            }
        }

        if (groupEsriLayers.children().length) {
            self.LayersHierachy.push(groupEsriLayers);
        }
    };

    self.getLayerCss = function (bing_map_style) {
        var bingMapCss = 'none';
        switch (bing_map_style) {
            case bingMapTypeEnum.Aerial:
                {
                    bingMapCss = 'Aerial';
                    break;
                }
            case bingMapTypeEnum.Aerial_with_labels:
                {
                    bingMapCss = 'Aerial_with_labels';
                    break;
                }
            case bingMapTypeEnum.Roads:
                {
                    bingMapCss = 'Roads';
                    break;
                }
            default:
                {
                }
        }

        return bingMapCss;
    };

    self.getDetailsFromQuerystringAndUpdate = function () {
        if (self.map.loaded) {
            self.getExtentFromSearch();
            //if there are no layers selected, select the first layer as default.
            for (var j = 0; j < self.Layers().length; j++) {
                if (self.Layers()[j].isVisible()) {
                    break;
                }
            }
            self.update();
        } else {
            _.delay(function () {
                self.getDetailsFromQuerystringAndUpdate();
            }, 500, "InitFinished");
        }
    }
    //return the definition expression of the layer
    function getDefinitionExpresion(serviceID) {
        // **FIX hard coded defex here!
        var mapDefEx = JSON.parse("[{\"Id\":\"003\",\"ServiceExpression\":null,\"LayerExpressions\":[{\"Key\":\"21\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"41\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"14\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"34\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"44\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"19\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"39\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"17\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"27\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"37\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"47\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"12\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"42\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"15\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"25\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"45\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"10\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"20\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"40\",\"Value\":\"PIP_STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"13\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"23\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"43\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"18\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"28\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"38\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"16\",\"Value\":\"PIP_STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"26\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"36\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"1\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"2\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"3\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"},{\"Key\":\"4\",\"Value\":\"STATUS=\\u0027Operating\\u0027\"}]},{\"Id\":\"101\",\"ServiceExpression\":\" START_DATE \\u003e ( current_date - 365) \",\"LayerExpressions\":null},{\"Id\":\"102\",\"ServiceExpression\":\" START_DATE \\u003c= ( current_date - 365) AND START_DATE \\u003e ( current_date - 1460) \",\"LayerExpressions\":null}]");
        //        var mapDefEx = jQuery.parseJSON($("#ctl00_mainContent_LiveMapArcGISControl_initialDefExp").val());
        if (mapDefEx) {
            for (var i = 0; i < mapDefEx.length; i++) {
                if (mapDefEx[i].Id === serviceID)
                    return mapDefEx[i];
            }
        }
    }
    //Returns service config for a given serviceID
    function GetServiceConfig(serviceID, lmArcGISConfig) {
        var serviceConfig = null;
        if (serviceID.substr(serviceID.length - 1) === "L") {
            //Label service
            serviceConfig = lmArcGISConfig.label_service;
        } else {
            for (var i = 0; i < lmArcGISConfig.services.service.length; i++) {
                if (lmArcGISConfig.services.service[i].id === serviceID) {
                    serviceConfig = lmArcGISConfig.services.service[i];
                    break;
                }
            }
        }
        return serviceConfig;
    }
    function setLabelDefEx(serviceConfig, lmArcGISConfig) {
        if (lmArcGISConfig.label_service) {
            var lblService = arcGISControlMap.getLayer(lmArcGISConfig.label_service.id);
            var service = arcGISControlMap.getLayer(serviceConfig.id);
            var labelDefinition = lblService.layerDefinitions;
            var layerDefinitions = service.layerDefinitions;
            if (!labelDefinition)
                labelDefinition = [];
            for (var i = 0; i < serviceConfig.labels.length; i++) {
                var serverExp = '';
                if (serviceConfig.labels[i].append_bound_server_expression == true) {
                    serverExp = mergeServerExpressions(serviceConfig, service.visibleLayers);
                }
                var def = '';
                if (layerDefinitions) {
                    def = layerDefinitions[serviceConfig.labels[i].filter_based_on_layer_id];
                }
                if (serverExp != '' && def != '') {
                    labelDefinition[serviceConfig.labels[i].id] = '(' + serverExp + ')' + ' AND ' + def;
                } else if (def != '') {
                    labelDefinition[serviceConfig.labels[i].id] = def;
                } else if (serverExp != '') {
                    labelDefinition[serviceConfig.labels[i].id] = serverExp;
                }
            }
            lblService.setLayerDefinitions(labelDefinition);
        }
    }
    var serviceTypeEnum = {
        "none": 0,
        "ArcGISDynamicMapServiceLayer": 1,
        "ArcGISTiledMapServiceLayer": 2,
        "VETiledLayer": 3,
        "FeatureLayer": 4,
    };
    //BING map styles enum
    var bingMapTypeEnum = {
        "none": 0,
        "Aerial": 1,
        "Aerial_with_labels": 2,
        "Roads": 3
    };

    // ***************************************************************************************
    // ***************************************************************************************
    // ***************************************************************************************
    //Loop and add all layers configured
    self.initLayers2 = function (lmArcGISConfig, mapPageModel) {



        if (mapPageModel.EmsProxies !== null) {
            for (var i = 0; i < mapPageModel.EmsProxies.length; i++) {
                var proxy = mapPageModel.EmsProxies[i];
                self.esriLibs.urlUtils.addProxyRule({
                    urlPrefix: proxy.UrlPrefix,
                    proxyUrl: proxy.ProxyUrl
                });
            }
        }

        //Layer types enum
        //Add layers
        var firstBaseMap = true;
        for (var serviceCounter = 0; serviceCounter < lmArcGISConfig.services.service.length; serviceCounter++) {
            var lmService = null;
            var serviceConfig = lmArcGISConfig.services.service[serviceCounter];
            switch (serviceConfig.arcgis_service_type) {
                case serviceTypeEnum.ArcGISDynamicMapServiceLayer:
                    lmService = new esri.layers.ArcGISDynamicMapServiceLayer(serviceConfig.url, {
                        id: serviceConfig.id
                    });
                    //Set the initial Definition Expression on first load
                    self.esriLibs.on(lmService, "load", function (service, bit2, bit3) {
                        var defExp = getDefinitionExpresion(service.target.id);
                        if (defExp) {
                            var layerDefinitions = [];
                            if (defExp.ServiceExpression) {
                                for (var j = 0; j < service.layer.visibleLayers.length; j++) {
                                    layerDefinitions[service.layer.visibleLayers[j]] = defExp.ServiceExpression;
                                }
                            } else {
                                for (var j = 0; j < defExp.LayerExpressions.length; j++) {
                                    layerDefinitions[defExp.LayerExpressions[j].Key] = defExp.LayerExpressions[j].Value;
                                }
                            }
                            service.target.setLayerDefinitions(layerDefinitions);
                            var config = GetServiceConfig(service.target.id, lmArcGISConfig);
                            //set defEx for connected labels
                            setLabelDefEx(config, lmArcGISConfig);
                            if (lmArcGISConfig.can_zoom && config.main_layer) {
                                var queryLayerId = config.selection_filter_query_layer_id;
                                if (queryLayerId == '')
                                    queryLayerId = '0';
                                var layerConfig = null;
                                if (config.layers && config.layers.length > 0) {
                                    for (var i = 0; i < config.layers.length; i++) {
                                        if (config.layers[i].main_layer) {
                                            layerConfig = config.layers[i];
                                            queryLayerId = layerConfig.id;
                                            break;
                                        }
                                    }
                                }
                                var url = config.url + '/' + queryLayerId;
                                // ZoomToFeatures(url, layerDefinitions[queryLayerId], config, layerConfig); **FIX - check if we need to do this - think not atm
                            }
                        }
                    });
                    if (lmService != null) {
                        if (serviceConfig.layers && serviceConfig.layers.length > 0) {
                            lmService.visibleLayers = [-1];
                        }
                        self.map.addLayer(lmService);
                        lmService.on('visible-layers-change', function (e) { });
                        self.map.getLayer(lmService.id).setVisibility(false);
                    }
                    break;
                case serviceTypeEnum.ArcGISTiledMapServiceLayer:
                    lmService = new esri.layers.ArcGISTiledMapServiceLayer(serviceConfig.url, {
                        id: serviceConfig.id
                    });
                    if (lmService != null) {
                        self.map.addLayer(lmService);
                        self.map.getLayer(lmService.id).setVisibility(false);
                    }
                    break;
                default:
                //
            }
        }
    }
    /**
     * Parse the querystring and get the map zoom and center.
     * @returns {} 
     */
    self.getExtentFromSearch = function () {

        var self = this;

        var latLongs = self.mapPageVM.facetsVM.getFacetValues("latlongs") || [];

        //If an extent has been saved
        if (latLongs.length === 2) {

            var min = latLongs[0].split(',');
            var max = latLongs[1].split(',');

            self.mapPageVM.setMapExtent({
                minX: min[1],
                minY: min[0],
                maxX: max[1],
                maxY: max[0]
            });
        } else {
            //otherwise use a centroid if it exists.
            var mapZoomAndCentre = self.mapPageVM.search
                .getQueryValue(self.mapPageVM.search.queryProperty.mapZoomAndCentre);
            if (typeof (mapZoomAndCentre) != "undefined") {
                var wgs = new self.esriLibs.SpatialReference({
                    "wkid": 4326
                });
                var parts = mapZoomAndCentre.split(",");
                self.map.centerAndZoom(new self.esriLibs.Point(parts[0], parts[1], wgs), parts[2]);
            } else {
                //use the default
                self.mapPageVM.setMapExtent({
                    minX: -96,
                    minY: -54,
                    maxX: 136,
                    maxY: 72
                });
            }
        }
    };

    /**
     * Parse the querstring and return the selected layers.
     * @returns {} 
     */
    self.getSelectedLayersFromSearch = function () {
        var mapLayers = self.mapPageVM.search.getQueryValue(self.mapPageVM.search.queryProperty.mapLayers);
        if (typeof (mapLayers) != "undefined") {
            var layersSelected = mapLayers.split(",");
            for (var i = 0; i < layersSelected.length; i++) {
                for (var j = 0; j < self.Layers().length; j++) {
                    if (layersSelected[i] === self.Layers()[j].id) {
                        self.Layers()[j].isVisible(true);
                        break;
                    }
                }
            }
            return;
        }
        var mapCategory = self.mapPageVM.search.getQueryValue("categoryName");
        if(mapCategory){
            for (var i =0; i < self.Layers().length;  i++){
                if(mapCategory === self.Layers()[i].options.categoryName){
                    self.Layers()[i].isVisible(true);
                }
            }
        }
    }

    //Set map extent.
    // self.getDetailsFromQuerystringAndUpdate();

    self.getExtentFromSearch();
}

var layerTypeEnum = {
    none: 0,
    Group: 1,
    Marker: 2,
    Choropleth: 4,
    Heatmap: 8,
    Esri: 16,
    Combined: 32,
    RangedMarker: 64,
    All: [0,1,2,4,8,16, 64]
};
