//LiveMapArcGIS JS file

dojo.require("esri.map");
dojo.require("esri.toolbars.navigation");
dojo.require("esri.layers.agsdynamic");
dojo.require("esri.virtualearth.VETiledLayer");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("esri.tasks.PrintTask");

var arcGISControlMap, navToolbar, drawToolbar, lmArcGISConfig, activeNodeServiceData, lmState, findTask, findParams, deferredPrint;
var printMapColArr;

var convert = 3.2808399 / 5280;

//Layer types enum
var serviceTypeEnum = { "none": 0, "ArcGISDynamicMapServiceLayer": 1, "ArcGISTiledMapServiceLayer": 2, "VETiledLayer": 3, "FeatureLayer": 4 };
//BING map styles enum
var bingMapTypeEnum = { "none": 0, "Aerial": 1, "Aerial_with_labels": 2, "Roads": 3 };
//Extent types
var extentTypeEnum = { "full": 0, "initial": 1 };
//Scale types
var scaleTypeEnum = { "min": 0, "max": 1 };
//Ordering
var ordering = { "ascending": 0, "descending": 1 };

var labelLayerSuffix = "_label";

var lmService = null;
var map;
var gpService;
var dataArr = new Array();

function init() {
    try {
        identifyIsOn = false;

        //Get lm config from category gridconfig
        lmArcGISConfig = jQuery.parseJSON($("#lmConfigJSON").val());

        var initialExtent;

        if ($("input[id$='stateExtentJSON']").val() != "") {
            //Keep extent between post backs
            initialExtent = new esri.geometry.Extent(jQuery.parseJSON($("input[id$='stateExtentJSON']").val()));
        }
        else {
            //Create map from initial extent stored in lmArcGISConfig
            initialExtent = new esri.geometry.Extent({
                "xmin": parseFloat(lmArcGISConfig.xmin),
                "ymin": parseFloat(lmArcGISConfig.ymin),
                "xmax": parseFloat(lmArcGISConfig.xmax),
                "ymax": parseFloat(lmArcGISConfig.ymax),
                "spatialReference": { "wkid": parseFloat(lmArcGISConfig.spatialReference) }
            });
        }

        arcGISControlMap = new esri.Map("arcGISControlMap", { extent: initialExtent, resizeDelay: 100 });

        arcGISControlMap.setExtent(initialExtent, true);

        //set active layer
        var node;
        if ($("input[id$='activeNodeId']").val() != "") {
            node = $('#' + $("input[id$='activeNodeId']").val());
        }
        else {
            var config = getMainServiceConfig();
            if (config != null && config.layers && config.layers.length > 0) {
                for (var i = 0; i < config.layers.length; i++) {
                    if (config.layers[i].main_layer) {
                        config = config.layers[i];
                        break;
                    }
                }
            }
            if (config != null) {
                node = $("div[id$='tvServiceTree']").find('a:contains("' + config.title + '")');
            }
        }
        if (node != null) {
            node.addClass('activeLayer');
            activeNodeServiceData = GetJSonServiceDataFromNode(node);

            initFind(activeNodeServiceData);
        }

        printMapColArr = lmArcGISConfig.printmap_colnames.split(',');
        printMapColAlaisArr = lmArcGISConfig.printmap_colalaises.split(',');

        if (lmArcGISConfig.proxyUrl != "") {
            esri.config.defaults.io.proxyUrl = lmArcGISConfig.proxyUrl;
            esri.config.defaults.io.alwaysUseProxy = true;
        }

        //Add layers
        initLayers();

        //Add toolbar
        initToolbar();

        //Add scale bar
        initScaleBar();

        if (lmArcGISConfig.addOverviewMap) {
            //Add overview map
            initOverview();
        }

        initCoordinates();

        initFindResult();

        initPrintDiv();

        initZoomDialog();

        if (lmArcGISConfig.identifyOnInit) ToggleIdentify();

        InitCount();

        //Init progress bar
        initProgressBar();

        dojo.connect(arcGISControlMap, "onExtentChange", function (extent) {
            $("input[id$='stateExtentJSON']").val(JSON.stringify(extent));
            SetCount();
        });

        $(document).bind('FilterContainerMoved', function (e) {
            arcGISControlMap.resize();
            arcGISControlMap.reposition();
            initIdentify(activeNodeServiceData);
        });
    }
    catch (e) {
        //Do something
        //debugger;
    }
}

function initCoordinates() {
    dojo.connect(arcGISControlMap, "onMouseMove", showCoordinates);
    dojo.connect(arcGISControlMap, "onMouseDrag", showCoordinates);
}

function showCoordinates(evt) {
    //get mapPoint from event
    var mp = evt.mapPoint;
    var coords = "X=" + mp.x.toFixed(3) + ", Y=" + mp.y.toFixed(3);

    mp = esri.geometry.webMercatorToGeographic(mp);
    coords = "Long=" + mp.x.toFixed(6) + ", Lat=" + mp.y.toFixed(6) + "<br/>" + coords;
    //display mouse coordinates
    dojo.byId("coordinates").innerHTML = coords;
}

function initPrintDiv() {
    if (lmArcGISConfig.can_simple_print === true) {
        $('#printDialogSimple').show();
    }
    else {
        $('#printDialogAdvanced').show();
    }

    $('#printDialogPrint').click(function () {
        if (lmArcGISConfig.can_simple_print === true) {
            window.open('LiveMapArcGISPrint.aspx', 'Print');
        }
        else {
            getPrintMapTables();
            $('#printDialog').hide();
            setLoading(true);
        }
    });

    $('#printDialogCancel').click(function () {
        $('#printDialog').hide();
    });
}

function initZoomDialog() {
    $('#zoomXY').change(function () {
        if ($(this).prop('checked')) {
            $('#textX').text('X');
            $('#textY').text('Y');
        }
    });
    $('#zoomLL').change(function () {
        if ($(this).prop('checked')) {
            $('#textX').text('Latitude');
            $('#textY').text('Longitude');
        }
    });

    $('#zoomDialogZoom').click(function () {
        var x = $('#zoomX').val();
        var y = $('#zoomY').val();
        if (x && y && $.isNumeric(x) && $.isNumeric(y)) {
            var doZoom = false;
            var point;
            if ($('#zoomLL').is(':checked')) {
                //latitude
                var latRegEx = /^-?([1-8]?[0-9]|[1-9]0)\.{1}\d{1,6}/;
                //longitude
                var longRegEx = /^-?([1]?[0-7][0-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,6}/;

                if (y.indexOf(".") <= 0) {
                    y = y + ".0";
                }

                if (x.indexOf(".") <= 0) {
                    x = x + ".0";
                }

                if (!x.match(latRegEx)) {
                    alert("Please enter a valid latitude value with at least one decimal point!")
                }
                else if (!y.match(longRegEx)) {
                    alert("Please enter a valid longitude value with at least one decimal point!")
                }
                else {
                    point = new esri.geometry.Point(y, x, new esri.SpatialReference({ wkid: 4326 }));
                    point = esri.geometry.geographicToWebMercator(point);
                    doZoom = true;
                }
            }
            else {
                point = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 102100 }));
                //We need this hack for some reason to make zooming work
                point = esri.geometry.webMercatorToGeographic(point);
                point = esri.geometry.geographicToWebMercator(point);
                doZoom = true;
            }

            if (doZoom) {
                arcGISControlMap.centerAndZoom(point, 14);
                $('#zoomDialog').hide();
                $('#zoomX').val('');
                $('#zoomY').val('');
            }
        }
        else {
            alert('Please set numeric values for both input boxes!');
        }
    });

    $('#zoomDialogCancel').click(function () {
        $('#zoomDialog').hide();
        $('#zoomX').val('');
        $('#zoomY').val('');
    });
}

function initOverview() {
    var overviewMapDijit = new esri.dijit.OverviewMap({
        map: arcGISControlMap,
        attachTo: "bottom-left",
        opacity: 0.25,
        visible: true
    });
    overviewMapDijit.startup();
}

function initProgressBar() {
    var mapDiv = $('#arcGISControlMap');

    dojo.connect(arcGISControlMap, "onUpdateStart", function () {
        setLoading(true);
    });
    dojo.connect(arcGISControlMap, "onUpdateEnd", function () {
        initIdentify(activeNodeServiceData);
        SetCount();
        setLoading(false);
    });

    centerProgressBar(mapDiv.width(), mapDiv.height());

    //centre progress bar on resize
    dojo.connect(arcGISControlMap, "onResize", function (extent, width, height) {
        centerProgressBar(width, height);
    });
}

function centerProgressBar(width, height) {
    var loading = $('#arcGISControlMap #mapLoading');
    loading.css({ top: (height / 2) - (loading.height() / 2), left: (width / 2) - (loading.width() / 2) });
}

function initToolbar() {
    navToolbar = new esri.toolbars.Navigation(arcGISControlMap);
    drawToolbar = new esri.toolbars.Draw(arcGISControlMap);

    dojo.connect(drawToolbar, 'onDrawEnd', drawSelection);

    dojo.connect(navToolbar, "onExtentHistoryChange", function (e) {
        if (navToolbar.isFirstExtent()) {
            disableButton('prevZoom');
        }
        else {
            enableButton('prevZoom');
        }
        if (navToolbar.isLastExtent()) {
            disableButton('nextZoom');
        }
        else {
            enableButton('nextZoom');
        }
    });

    $('#arcGISToolbar ul li div').click(function (e) {
        if ($(this).hasClass('disabled')) {
            e.stopImmediatePropagation();
        }
    });

    InitDropDownButtons();
    $("#pan").addClass("highlightButton");

    //Click handlers for navigation toolbar
    $("#zoomIn").click(function (e) {
        RemoveToolbarHighlight();
        arcGISControlMap.reposition();
        navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
        $(this).addClass("highlightButton");
    });

    $("#zoomOut").click(function (e) {
        RemoveToolbarHighlight();
        arcGISControlMap.reposition();
        navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
        $(this).addClass("highlightButton");
    });

    $("#zoomPoint").click(function (e) {
        var dialog = $('#zoomDialog');
        arcGISControlMap.reposition();
        dialog.css({ top: (dialog.parent().height() / 2) - (dialog.height() / 2), left: (arcGISControlMap.width / 2) - (dialog.width() / 2) });
        dialog.toggle();
    });

    $("#zoomFull").click(function (e) {
        arcGISControlMap.reposition();
        ZoomToCustomExtent(lmArcGISConfig.xmin, lmArcGISConfig.ymin, lmArcGISConfig.xmax, lmArcGISConfig.ymax, lmArcGISConfig.spatialReference);
    });

    $("#prevZoom").click(function (e) {
        arcGISControlMap.reposition();
        navToolbar.zoomToPrevExtent();
    });

    $("#nextZoom").click(function (e) {
        arcGISControlMap.reposition();
        navToolbar.zoomToNextExtent();
    });

    $("#pan").click(function (e) {
        RemoveToolbarHighlight();
        //navToolbar.activate(esri.toolbars.Navigation.PAN);
        arcGISControlMap.reposition();
        navToolbar.deactivate()
        $(this).addClass("highlightButton");
    });

    //Click handlers for draw toolbar
    $("#selectRect").click(function (e) {
        resetDefaultNavigation();
        //arcGISControlMap.resize();
        arcGISControlMap.reposition();
        drawToolbar.activate(esri.toolbars.Draw.EXTENT);
        arcGISControlMap.hideZoomSlider();
    });

    $("#selectPolygonFree").click(function (e) {
        arcGISControlMap.reposition();
        drawToolbar.activate(esri.toolbars.Draw.FREEHAND_POLYGON);
        arcGISControlMap.hideZoomSlider();
    });

    $("#selectPolygon").click(function (e) {
        if (!identifyIsOn) {
            resetDefaultNavigation();
            arcGISControlMap.reposition();
            drawToolbar.activate(esri.toolbars.Draw.POLYGON);
            arcGISControlMap.hideZoomSlider();
        }
        else {
            alert('This option requires Identify off. This can be done by clicking on the Identify icon on the toolbar.');
        }
    });

    $("#selectClear").click(function (e) {
        arcGISControlMap.reposition();
        arcGISControlMap.graphics.clear();
    });

    $("#filterSelection").click(function (e) {
        arcGISControlMap.reposition();
        if (activeNodeServiceData) {
            setLoading(true);
            filterSelection(activeNodeServiceData);
        }
        else {
            alert('There is no active layer!');
        }
    });

    $("#identify").click(function (e) {
        arcGISControlMap.reposition();
        ToggleIdentify();
    });

    $("#gridViev").click(function (e) {
        //Move/read this setting from config maybe latter
        var serviceConfig = GetServiceConfig(activeNodeServiceData.ServiceID);
        if (serviceConfig.foreign_category) {
            jQuery.ajax({
                type: "POST",
                url: "/LiveMapArcGIS.aspx",
                data: { 'swhitch_to_category': serviceConfig.foreign_category },
                success: function () {
                    document.location = serviceConfig.gridPageURL;
                }
            });
        }
        else {
            document.location = serviceConfig.gridPageURL;
        }
    });

    $("#export").click(function (e) {
        arcGISControlMap.reposition();
        if (activeNodeServiceData) {
            setLoading(true);
            lmExport(activeNodeServiceData);
            setLoading(false);
        }
        else {
            alert('There is no active layer!');
        }
    });

    $("#print").click(function (e) {
        arcGISControlMap.reposition();
        var dialog = $('#printDialog');

        dialog.css({ top: (dialog.parent().height() / 2) - (dialog.height() / 2), left: (arcGISControlMap.width / 2) - (dialog.width() / 2) });

        dialog.toggle();
    });

    $("#zoomToFeatures").click(function (e) {
        arcGISControlMap.reposition();
        if (activeNodeServiceData) {
            var serviceConfig = GetServiceConfig(activeNodeServiceData.ServiceID);
            if (serviceConfig.main_layer) {
                var selectionLayerColumn = serviceConfig.selection_filter_layer_column;
                var queryLayerId = serviceConfig.selection_filter_query_layer_id;

                if (activeNodeServiceData.LayerID != null) {
                    var layerConfig = GetLayerConfig(activeNodeServiceData.ServiceID, activeNodeServiceData.LayerID);

                    //Get selection_filter_query_layer_id from layer if specified first
                    if (layerConfig.selection_filter_query_layer_id != "") {
                        queryLayerId = layerConfig.selection_filter_query_layer_id;
                    }

                    //If no selection_filter_query_layer_id specified on layer and service level use layer ID
                    queryLayerId = activeNodeServiceData.LayerID;
                }

                if (queryLayerId == "") queryLayerId = "0";

                var url = serviceConfig.url + '/' + queryLayerId;
                var layer = arcGISControlMap.getLayer(serviceConfig.id);
                var where = '';
                if (layer && layer.layerDefinitions) {
                    where = layer.layerDefinitions[queryLayerId];
                }
                ZoomToFeatures(url, where, serviceConfig, layerConfig);
            }
            else {
                alert('Activate main layer first. Main layer is marked with (*) in Layers list.');
            }
        }
        else {
            alert('There is no active layer!');
        }
    });

    $('#find').keyup(function (event) {
        f
        if (event.keyCode == 13) {
            $('#findButton').click();
        }
    });

    $('#findButton').click(function () {
        var text = $('#find').val();
        if (findTask && text) {
            $('#findGroup input').attr('disabled', true);
            setLoading(true);
            findParams.searchText = text;
            findTask.execute(findParams, findResults, function (error) {
                setLoading(false);
                $('#findGroup input').attr('disabled', false);
                alert('Error occurred during find!');
            });
        }
    });
}

function InitDropDownButtons() {
    var button = $('#arcGISToolbar .dropDownButton').parent();
    var box = $('#arcGISToolbar .dropDownButton .dropDownBox');

    button.mouseenter(function () {
        var currentBox = $('.dropDownBox', this);
        var parentPos = $(this).position();
        currentBox.css({ top: parentPos.top + $(this).outerHeight(), left: parentPos.left });
        currentBox.show();
    });
    button.mouseleave(function () {
        $('.dropDownBox', this).hide();
    });

    box.click(function () {
        $(this).hide();
    });
}

function resetDefaultNavigation() {
    RemoveToolbarHighlight();
    navToolbar.activate(esri.toolbars.Navigation.PAN);
    $("#pan").addClass("highlightButton");
}

function RemoveToolbarHighlight() {
    dojo.query("#arcGISToolbar div").removeClass("highlightButton");
}

function disableButton(buttonId) {
    $('#' + buttonId).addClass('disabled');
    $('#' + buttonId).parent().addClass('disabled');
}

function enableButton(buttonId) {
    $('#' + buttonId).removeClass('disabled');
    $('#' + buttonId).parent().removeClass('disabled');
}

function drawSelection(geometry) {
    drawToolbar.deactivate();
    arcGISControlMap.showZoomSlider();

    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
    var graphic = new esri.Graphic(geometry, symbol);
    arcGISControlMap.graphics.add(graphic);
}

function initScaleBar() {
    dojo.connect(arcGISControlMap, 'onLoad', function () {
        var scalebar = new esri.dijit.Scalebar({
            map: arcGISControlMap,
            scalebarUnit: 'english',
            attachTo: 'bottom-right'
        });
    });
}

//Loop and add all layers configured
function initLayers() {

    //Add layers
    for (var serviceCounter = 0; serviceCounter < lmArcGISConfig.services.service.length; serviceCounter++) {
        var lmService = null;
        var lmServiceLabels = null;
        var serviceConfig = lmArcGISConfig.services.service[serviceCounter];

        switch (serviceConfig.arcgis_service_type) {
            case serviceTypeEnum.ArcGISDynamicMapServiceLayer:
                lmService = new esri.layers.ArcGISDynamicMapServiceLayer(serviceConfig.url, { id: serviceConfig.id });
                //Set the initial Definition Expression on first load
                dojo.connect(lmService, "onLoad", function (service) {
                    var defExp = getDefinitionExpresion(service.id);
                    if (defExp) {
                        var layerDefinitions = [];
                        if (defExp.ServiceExpression) {
                            for (var j = 0; j < service.visibleLayers.length; j++) {
                                layerDefinitions[service.visibleLayers[j]] = defExp.ServiceExpression;
                            }
                        } else {
                            for (var j = 0; j < defExp.LayerExpressions.length; j++) {
                                layerDefinitions[defExp.LayerExpressions[j].Key] = defExp.LayerExpressions[j].Value;
                            }
                        }
                        service.setLayerDefinitions(layerDefinitions);
                        var config = GetServiceConfig(service.id);
                        //set defEx for connected labels
                        setLabelDefEx(config);

                        if (lmArcGISConfig.can_zoom && config.main_layer) {
                            var queryLayerId = config.selection_filter_query_layer_id;
                            if (queryLayerId == '') queryLayerId = '0';
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
                            ZoomToFeatures(url, layerDefinitions[queryLayerId], config, layerConfig);
                        }
                    }
                });
                break;
            case serviceTypeEnum.ArcGISTiledMapServiceLayer:
                lmService = new esri.layers.ArcGISTiledMapServiceLayer(serviceConfig.url, { id: serviceConfig.id });
                break;
            case serviceTypeEnum.VETiledLayer:
                switch (serviceConfig.bing_map_style) {
                    case bingMapTypeEnum.Aerial:
                        lmService = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer", {
                            id: serviceConfig.id
                        });
                        break;
                    case bingMapTypeEnum.Aerial_with_labels:
                        lmService = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer", {
                            id: serviceConfig.id
                        });
                        lmServiceLabels = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer",
                            {
                                id: serviceConfig.id + labelLayerSuffix
                            });
                        break;
                    case bingMapTypeEnum.Roads:
                        lmService = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer", {
                            id: serviceConfig.id
                        });
                        break;
                    default:
                        //
                }
                break;
            default:
                //
        }

        if (lmService != null) {
            arcGISControlMap.addLayer(lmService);
        }

        if (lmServiceLabels != null) {
            arcGISControlMap.addLayer(lmServiceLabels);
        }
    } // end of for

    //Add label layer
    if (lmArcGISConfig.label_service) {
        var lblService;
        var lblConfig = lmArcGISConfig.label_service;
        switch (lmArcGISConfig.label_service.arcgis_service_type) {
            case serviceTypeEnum.ArcGISDynamicMapServiceLayer:
                lblService = new esri.layers.ArcGISDynamicMapServiceLayer(lblConfig.url, { id: lblConfig.id });
                break;
            case serviceTypeEnum.ArcGISTiledMapServiceLayer:
                lblService = new esri.layers.ArcGISTiledMapServiceLayer(lblConfig.url, { id: lblConfig.id });
                break;
        }
        if (lblService != null) {
            dojo.connect(lblService, "onLoad", function (service) {
            });

            arcGISControlMap.addLayer(lblService);
        }
    }

    //Set visibility
    var firstBaseMapId = "";
    var baseSelected = false;
    for (var i = 0; i < lmArcGISConfig.services.service.length; i++) {
        if (lmArcGISConfig.services.service[i].bing_map_style > 0) {
            if (firstBaseMapId == "") {
                firstBaseMapId = lmArcGISConfig.services.service[i].id;
            }

            var vis = false;
            if ($("input[id$='hidBaseLayerSelectionId']").val() == lmArcGISConfig.services.service[i].id && $("input[id$='hidBaseLayerSelectionId']").val() != "XXX") {
                baseSelected = true;
                vis = true;
            }

            setLayerVisibility(arcGISControlMap, lmArcGISConfig.services.service[i].id, vis);
            //arcGISControlMap.getLayer(lmArcGISConfig.services.service[i].id).setVisibility(vis);
        }
    }

    if (!baseSelected && !firstBaseMapId == "" && $("input[id$='hidBaseLayerSelectionId']").val() != "XXX") {
        setLayerVisibility(arcGISControlMap, firstBaseMapId, true);
        //arcGISControlMap.getLayer(firstBaseMapId).setVisibility(true);
    }

    $("div[id$='tvServiceTree']").find('input[type="checkbox"]').each(function () {
        var a = $(this).parent().find('a');
        if (a.length > 0) {
            var serviceData = GetJSonServiceDataFromNode(a);
            $(this).data('serviceData', serviceData);
            var service = arcGISControlMap.getLayer(serviceData.ServiceID);
            var visibleLayers = [];
            if (service.visibleLayers) {
                visibleLayers = service.visibleLayers;
            }

            if (lmArcGISConfig.label_service && serviceData.ServiceID == lmArcGISConfig.label_service.id) {
                serviceConfig = GetServiceConfig(serviceData.parentServiceID);
                for (var i = 0; i < serviceConfig.labels.length; i++) {
                    if (serviceConfig.labels[i].id == serviceData.LayerID) {
                        serviceConfig.labels[i].active = $(this).prop('checked');
                    }
                }
                if ($(this).prop('checked')) {
                    var boundLayer = arcGISControlMap.getLayer(serviceData.parentServiceID);
                    if (boundLayer.visible && !boundLayer.visibleLayers || boundLayer.visibleLayers && boundLayer.visibleLayers[0] != -1) {
                        visibleLayers = addVisible(visibleLayers, serviceData.LayerID);
                        service.setVisibleLayers(visibleLayers);
                    }
                }
            } else {
                serviceConfig = GetServiceConfig(serviceData.ServiceID);
                if (serviceConfig.layers && serviceConfig.layers.length > 0) {
                    var linkedLayers = GetLinkedLayerIds(serviceData.ServiceID, serviceData.LayerID);

                    if ($(this).prop('checked')) {
                        for (var linkedLayerCounter = 0; linkedLayerCounter < linkedLayers.length; linkedLayerCounter++) {
                            visibleLayers = addVisible(visibleLayers, linkedLayers[linkedLayerCounter]);
                        }
                    }

                    // If all off pass -1
                    if (visibleLayers.join('') == '') {
                        visibleLayers = addVisible(visibleLayers, -1);
                        //service.hide();
                    }
                    service.setVisibleLayers(visibleLayers);
                } else {
                    if (serviceData && serviceData.ServiceID == serviceConfig.id) {
                        arcGISControlMap.getLayer(serviceConfig.id).visible = ($(this).prop('checked'));
                    }
                }
            }
        }
    });

    //Wire up base layer selection
    $("div[id$='baseLayerWrapper'] > div").click(function () {
        var serviceData = JSON.parse($(this).attr("serviceData"));
        if (serviceData) {
            for (var i = 0; i < lmArcGISConfig.services.service.length; i++) {
                if (lmArcGISConfig.services.service[i].bing_map_style > 0) {
                    setLayerVisibility(arcGISControlMap, lmArcGISConfig.services.service[i].id, false);
                    //arcGISControlMap.getLayer(lmArcGISConfig.services.service[i].id).setVisibility(false);
                }
            }

            //toggle service
            if (serviceData.ServiceID != "XXX") {
                setLayerVisibility(arcGISControlMap, serviceData.ServiceID, true);
                //arcGISControlMap.getLayer(serviceData.ServiceID).setVisibility(true);
            }
            $("input[id$='hidBaseLayerSelectionId']").val(serviceData.ServiceID);
        }
    });

    //Wire up check box service/layer toggle
    $("div[id$='tvServiceTree']").find('input[type="checkbox"]').click(function () {
        var hideIds = [];
        var serviceData = $(this).data('serviceData');
        var boundLayer = arcGISControlMap.getLayer(serviceData.parentServiceID);

        if (serviceData) {
            var chkValue = $(this).prop('checked');
            if (lmArcGISConfig.label_service && serviceData.ServiceID == lmArcGISConfig.label_service.id) {
                serviceConfig = GetServiceConfig(serviceData.parentServiceID);

                if (chkValue) {
                    for (var i = 0; i < serviceConfig.labels.length; i++) {
                        if (serviceConfig.labels[i].id == serviceData.LayerID) {
                            serviceConfig.labels[i].active = true;
                        }
                        else {
                            serviceConfig.labels[i].active = false;
                            hideIds.push(serviceConfig.labels[i].id);
                        }
                    }

                    $(this).closest('div').find('input[type="checkbox"]').removeAttr('checked');
                    if (boundLayer.visible && boundLayer.visibleLayers[0] != -1) {
                        if (lmArcGISConfig.label_service) {
                            var lblLayer = arcGISControlMap.getLayer(lmArcGISConfig.label_service.id);
                            var visible = substractArrays(lblLayer.visibleLayers, hideIds);
                            visible = addVisible(visible, serviceData.LayerID);
                            lblLayer.setVisibleLayers(visible);
                        }
                    }
                    $(this).prop('checked', chkValue);
                }
                else {
                    for (var i = 0; i < serviceConfig.labels.length; i++) {
                        if (serviceConfig.labels[i].id == serviceData.LayerID) {
                            serviceConfig.labels[i].active = false;
                            hideIds.push(serviceConfig.labels[i].id);
                        }
                    }

                    if (boundLayer.visible && boundLayer.visibleLayers[0] != -1) {
                        if (lmArcGISConfig.label_service) {
                            var lblLayer = arcGISControlMap.getLayer(lmArcGISConfig.label_service.id);
                            var visible = substractArrays(lblLayer.visibleLayers, hideIds);

                            // If all off pass -1
                            if (visible.join('') == '') {
                                visible = addVisible(visible, -1);
                            }

                            lblLayer.setVisibleLayers(visible);
                        }
                    }
                }
            }
            else {
                if (serviceData.LayerID != null) {
                    //Toggle layer and its linked layers

                    var serviceLayer = arcGISControlMap.getLayer(serviceData.ServiceID);
                    var visibleLayers = serviceLayer.visibleLayers;
                    var linkedLayers = GetLinkedLayerIds(serviceData.ServiceID, serviceData.LayerID);

                    //Overwrite with chkbox values form the UI

                    if (chkValue) {
                        for (var linkedLayerCounter = 0; linkedLayerCounter < linkedLayers.length; linkedLayerCounter++) {
                            visibleLayers = addVisible(visibleLayers, linkedLayers[linkedLayerCounter]);
                        }
                    } else {
                        visibleLayers = substractArrays(serviceLayer.visibleLayers, linkedLayers);
                    }

                    // If all off pass -1
                    if (visibleLayers.join('') == '') {
                        visibleLayers = addVisible(visibleLayers, -1);
                        //serviceLayer.hide();
                    }

                    //Issue: when all of the sub layers are off neither can get on again.
                    //Fix: set entire service to visible then apply layer visibility from selection.
                    setLayerVisibility(arcGISControlMap, serviceData.ServiceID, true);
                    //arcGISControlMap.getLayer(serviceData.ServiceID).setVisibility(true);

                    serviceLayer.setVisibleLayers(visibleLayers);
                } else {
                    //figure out mutually_toggle_off_service_ids
                    var serviceConfig = GetServiceConfig(serviceData.ServiceID);
                    if (chkValue && serviceConfig.mutually_toggle_off_service_id != "undefined") {
                        var toggleOffServiceIds = serviceConfig.mutually_toggle_off_service_ids.split(',');
                        if (toggleOffServiceIds != null && toggleOffServiceIds.length > 0) {
                            for (var i = 0; i < toggleOffServiceIds.length; i++) {
                                $("div[id$='tvServiceTree']").find('input[type="checkbox"]').each(function () {
                                    var a = $(this).parent().find('a');
                                    if (a.length > 0) {
                                        var serviceData = GetJSonServiceDataFromNode(a);
                                        if (serviceData.ServiceID == toggleOffServiceIds[i]) {
                                            $(this).removeAttr('checked');
                                            //toggle service(s)
                                            setLayerVisibility(arcGISControlMap, toggleOffServiceIds[i], false);
                                            //arcGISControlMap.getLayer(toggleOffServiceIds[i]).setVisibility(false);
                                        }
                                    }
                                });
                            }
                        }
                    }

                    //toggle service
                    setLayerVisibility(arcGISControlMap, serviceData.ServiceID, chkValue);
                    //arcGISControlMap.getLayer(serviceData.ServiceID).setVisibility(chkValue);
                }
                //Hide/show labels
                var serviceConfig = GetServiceConfig(serviceData.ServiceID);
                boundLayer = arcGISControlMap.getLayer(serviceData.ServiceID);
                if (serviceConfig.labels && serviceConfig.labels.length > 0) {
                    lblLayer = arcGISControlMap.getLayer(lmArcGISConfig.label_service.id);
                    var visibleLabels = lblLayer.visibleLayers;
                    var activeLblId;
                    for (var i = 0; i < serviceConfig.labels.length; i++) {
                        if (serviceConfig.labels[i].active) {
                            activeLblId = serviceConfig.labels[i].id;
                        }
                    }

                    if (boundLayer.visible && boundLayer.visibleLayers[0] != -1) {
                        visibleLabels = addVisible(visibleLabels, activeLblId);
                    } else {
                        visibleLabels = substractArrays(visibleLabels, [activeLblId]);
                    }
                    if (visibleLabels.join('') == '') {
                        visibleLabels = addVisible(visibleLabels, -1);
                    }
                    lblLayer.setVisibleLayers(visibleLabels);
                    if (serviceData.LayerID != null) {
                        setLabelDefEx(serviceConfig);
                    }
                }
            }
        }
    });

    //Wire up layer/service selection
    $("div[id$='tvServiceTree']").find('a').click(function () {
        var retVal = false;     //Stop post
        var serviceData = GetJSonServiceDataFromNode($(this));

        if (serviceData != null) {
            var serviceConfig = GetServiceConfig(serviceData.ServiceID);

            if ((serviceConfig && serviceConfig.arcgis_service_type != serviceTypeEnum.VETiledLayer)
				&& serviceData.ServiceID.substr(serviceData.ServiceID.length - 1) != "L") {
                $("div[id$='tvServiceTree'] a").removeClass('activeLayer');
                $(this).addClass('activeLayer');
                initIdentify(serviceData);
                initFind(serviceData);
                activeNodeServiceData = serviceData;
                $("input[id$='activeNodeId']").val(this.id);
                InitCount();
                SetCount();
            }
            else {
                alert("This item can not be active.");
            }
        }
        else {
            retVal = true;
        }

        return retVal;
    });

    // Wire up service and layer context menu
    $("div[id$='tvServiceTree']").find('a').each(function () {
        var serviceData = GetJSonServiceDataFromNode($(this));

        if (serviceData != null) {
            var serviceConfig = GetServiceConfig(serviceData.ServiceID);
            $(this).bind('contextmenu', function () {
                if (serviceConfig == null || serviceConfig.main_layer == null || !serviceConfig.main_layer) {
                    $('#serviceMenu').disableContextMenuItems('#serviceToFeatures');
                    $('#layerMenu').disableContextMenuItems('#serviceToFeatures');
                }
                else {
                    $('#serviceMenu').enableContextMenuItems('#serviceToFeatures');
                    $('#layerMenu').enableContextMenuItems('#serviceToFeatures');
                }
            });
            if (serviceData.LayerID == null) {
                //Service context menu
                $(this).contextMenu(
				{ menu: 'serviceMenu', addToX: -175, addToY: -25 },
				function (action, el, pos) {
				    switch (action) {
				        case "serviceToFullExtent":
				            SetMapExtentFromService(el, extentTypeEnum.full);
				            break;
				        case "serviceToInitialExtent":
				            SetMapExtentFromService(el, extentTypeEnum.initial);
				            break;
				        case "serviceToMinScale":
				            SetServiceScale(el, scaleTypeEnum.min, serviceData);
				            break;
				        case "serviceToMaxScale":
				            SetServiceScale(el, scaleTypeEnum.max, serviceData);
				            break;
				        case "serviceToFeatures":
				            ZoomToFeaturesFromContextMenu(serviceData);
				            break;
				        default:
				            //do nothing
				    }
				});
            }
            else {
                //Layer context menu
                $(this).contextMenu(
				{ menu: 'layerMenu', addToX: -175, addToY: -25 },
				function (action, el, pos) {
				    switch (action) {
				        case "serviceToFullExtent":
				            SetMapExtentFromService(el, extentTypeEnum.full);
				            break;
				        case "serviceToInitialExtent":
				            SetMapExtentFromService(el, extentTypeEnum.initial);
				            break;
				        case "layerToMinScale":
				            SetLayerScale(el, scaleTypeEnum.min);
				            break;
				        case "layerToMaxScale":
				            SetLayerScale(el, scaleTypeEnum.max);
				            break;
				        case "serviceToFeatures":
				            ZoomToFeaturesFromContextMenu(serviceData);
				            break;
				        default:
				            //do nothing
				    }
				});
            }
        }
    });
}

function initFindResult() {
    $("#arcGISControlFindResults table tbody").on("click", "tr", function (event) {
        var geometry = $(this).data('geometry');
        if (geometry instanceof esri.geometry.Point) {
            arcGISControlMap.centerAndZoom(geometry, 12);
        }
        else {
            var extent;
            if (geometry instanceof esri.geometry.Extent) {
                extent = geometry
            }
            else {
                extent = geometry.getExtent();
            }
            arcGISControlMap.setExtent(extent);
        }
    });
}

function initFind(serviceData) {
    var serviceId = serviceData.ServiceID;
    var config = GetServiceConfig(serviceId);
    if (config.can_find) {
        findTask = new esri.tasks.FindTask(config.url);

        findParams = new esri.tasks.FindParameters();
        findParams.returnGeometry = true;

        if (serviceData.LayerID != null) {
            findParams.layerIds = [serviceData.LayerID];
        }
        else {
            findParams.layerIds = [config.find_layer_id];
        }
        $('#findGroup input').removeAttr('disabled');
        $('#findGroup').show();
    }
    else {
        $('#findGroup input').attr('disabled', true);
        $('#findGroup').hide();
        findTask = null;
        findParams = null;
    }

    //$('#arcGISControlFindResults').draggable({ containment: "parent", cursor: 'move', handle: "arcGISControlFindResultsTitle" });
}

function findResults(results) {
    //foundFieldName
    //value
    //feature.geometry
    $('#findGroup input').removeAttr('disabled');
    setLoading(false);
    var table = $('#arcGISControlFindResults table tbody');
    table.empty();
    results.sort(function (a, b) {
        if (a.value === b.value) return 0;
        if (a.value > b.value) return 1;
        if (a.value < b.value) return -1;
    });
    var row;
    for (var i = 0; i < results.length; i++) {
        row = $('<tr><td>' + results[i].foundFieldName + '</td><td>' + results[i].value + '</td></tr>');
        row.data('geometry', results[i].feature.geometry)
        table.append(row);
    }
    $('#arcGISControlFindResults').show();
}

function ZoomToFeatures(url, wherePart, config, layerConfig) {
    var where = null;
    var xMin = null;
    var yMin = null;
    var xMax = null;
    var yMax = null;

    if (!wherePart) { wherePart = '1 = 1'; }
    var boeRegion = $("input[id$='boeRegion']").val();
    if (boeRegion != '') { wherePart += ' AND ' + config.entitlement_column + ' IN (' + boeRegion + ')'; }
    if (layerConfig && layerConfig.server_definition_expression != '') { wherePart += ' AND ' + layerConfig.server_definition_expression; }
    if (layerConfig && layerConfig.permanent_filter != '') { wherePart += ' AND ' + layerConfig.permanent_filter; }

    // UPPER function needs to be used at both ends of the equation to make sure case insensitive string comparison.
    // UPPER on the left also breaks single query statement for min/max on lat/long so it is broken into 4 separate queries.

    // Full UPPER also does not work where layer datasource type is file e.g. Well Activity layer ATM, so we need to remove all UPPERs for zoom to work if comparison values are case equal.
    if (config.arcgis_geodatabases_type == 1) //"FileGeodatabase"
    {
        wherePart = wherePart.replace(/UPPER/g, ""); //This will replace only the first one
    }

    //Get xMin
    where = config.lon_column + ' = (SELECT MIN(' + config.lon_column + ') FROM ' + config.table_name + ' WHERE ' + wherePart + ')';
    queryLayer(url, null, [''], null, where,
			function (featureSet) {
			    if (featureSet.features && featureSet.features.length > 0) {
			        xMin = featureSet.features[0].geometry.x;
			        EndZoomQuery(featureSet);
			    }
			}
		  );

    //Get yMin
    where = config.lat_column + ' = (SELECT MIN(' + config.lat_column + ') FROM ' + config.table_name + ' WHERE ' + wherePart + ')';
    queryLayer(url, null, [''], null, where,
			function (featureSet) {
			    if (featureSet.features && featureSet.features.length > 0) {
			        yMin = featureSet.features[0].geometry.y;
			        EndZoomQuery(featureSet);
			    }
			}
			);

    //Get xMax
    where = config.lon_column + ' = (SELECT MAX(' + config.lon_column + ') FROM ' + config.table_name + ' WHERE ' + wherePart + ')';
    queryLayer(url, null, [''], null, where,
			function (featureSet) {
			    if (featureSet.features && featureSet.features.length > 0) {
			        xMax = featureSet.features[0].geometry.x;
			        EndZoomQuery(featureSet);
			    }
			}
			);

    //Get yMax
    where = config.lat_column + ' = (SELECT MAX(' + config.lat_column + ') FROM ' + config.table_name + ' WHERE ' + wherePart + ')';
    queryLayer(url, null, [''], null, where,
			function (featureSet) {
			    if (featureSet.features && featureSet.features.length > 0) {
			        yMax = featureSet.features[0].geometry.y;
			        EndZoomQuery(featureSet);
			    }
			}
			);

    //Fire Zoom action when all 4 asynchronous queries are done
    function EndZoomQuery(featureSet) {
        if (xMin && yMin && xMax && yMax) {
            //Is it one point is results
            if (xMin == xMax && yMin == yMax) {
                arcGISControlMap.centerAndZoom(featureSet.features[0].geometry, 16);
            }
            else {
                ZoomToCustomExtent(xMin, yMin, xMax, yMax, lmArcGISConfig.spatialReference);

                //now expand extent to make sure features are visible, f.e. 1.1 is 10% bigger
                //var newExtent = this.arcGISControlMap.extent;
                //newExtent = newExtent.expand(1.1);
                //this.arcGISControlMap.setExtent(newExtent, true);
            }
        }
    }
}

function filterSelection(nodeData) {
    if (arcGISControlMap.graphics.graphics.length > 0) {
        var serviceConfig = GetServiceConfig(nodeData.ServiceID);
        var selectionLayerColumn = serviceConfig.selection_filter_layer_column;
        var queryLayerId = serviceConfig.selection_filter_query_layer_id;
        var maximumNumberOfFeatures = serviceConfig.maximum_number_of_features;

        if (nodeData.LayerID != null) {
            var layerConfig = GetLayerConfig(nodeData.ServiceID, nodeData.LayerID);

            //Get selection_filter_query_layer_id from layer if specified first
            if (layerConfig.selection_filter_query_layer_id != "") {
                queryLayerId = layerConfig.selection_filter_query_layer_id;
            }

            //If no selection_filter_query_layer_id specified on layer and service level use layer ID
            queryLayerId = nodeData.LayerID;

            //Use layer specific selection column if specified
            if (layerConfig.selection_filter_layer_column != "") {
                selectionLayerColumn = layerConfig.selection_filter_layer_column;
            }

            //Use layer specific maximum number of features if specified
            if (layerConfig.maximum_number_of_features != "") {
                maximumNumberOfFeatures = layerConfig.maximum_number_of_features;
            }
        }

        if (selectionLayerColumn != "") {
            //Using a deferred object to iterate through async callbacks
            var deferred = jQuery.Deferred();
            var allIds = [];
            var counter = 0;
            var where = '';
            if (queryLayerId == "") queryLayerId = "0";

            var url = serviceConfig.url + '/' + queryLayerId;
            var layer = arcGISControlMap.getLayer(serviceConfig.id);
            if (layer && layer.layerDefinitions) {
                where = layer.layerDefinitions[queryLayerId];
            }

            for (var j = 0; j < arcGISControlMap.graphics.graphics.length; j++) {
                var geometry = arcGISControlMap.graphics.graphics[j].geometry;

                //Set 0 for default if no layer Id is specified

                queryLayer(url, geometry, [selectionLayerColumn], null, where,
							function (featureSet) {
							    var ids = [];
							    if (featureSet.features.length <= maximumNumberOfFeatures) {
							        for (var i = 0; i < featureSet.features.length; i++) {
							            ids.push(featureSet.features[i].attributes[selectionLayerColumn]);
							        }
							        counter++;
							        deferred.notify(ids, counter);
							    }
							    else {
							        deferred.reject();
							        alert('You have exceeded the limit of the selection (' + maximumNumberOfFeatures + ')! Please narrow your selection.');
							        setLoading(false);
							    }
							},
							function (error) {
							    deferred.reject();
							    alert('Filter error: ' + error.message + "\nMake sure selection has no intersecting lines.");
							    setLoading(false);
							}
						);
            }

            deferred.progress(function (ids, count) {
                allIds = allIds.concat(ids);
                if (arcGISControlMap.graphics.graphics.length == count) {
                    deferred.resolve(allIds);
                }
            });

            deferred.done(function (ids) {
                ids = makeUnique(ids);
                setLoading(false);
                if (ids.length > 0) {
                    jQuery.ajax({
                        type: "POST",
                        url: "/LiveMapArcGIS.aspx",
                        data: { 'Ids': ids.join(), 'SelectElements': 1, 'serviceId': nodeData.ServiceID, 'layerId': nodeData.LayerID },
                        success: function () {
                            CMPPostback();
                            arcGISControlMap.graphics.clear();
                        }
                    })
                }
                else {
                    alert('No feature{s) selected.');
                    setLoading(false);
                }
            });
        }
        else {
            alert('Filtering is not setup for this service/layer.');
            setLoading(false);
        }
    }
    else {
        alert('There is no selection!');
        setLoading(false);
    }
}

//Query START
function queryLayer(layerUrl, geometry, outFields, orderByFields, where, queryCompleteCallback, queryErrorCallback) {
    var query = new esri.tasks.Query();
    query.geometry = geometry;
    query.outFields = outFields;
    query.orderByFields = orderByFields;
    query.returnGeometry = true;
    query.where = where;
    var queryTask = new esri.tasks.QueryTask(layerUrl);
    queryTask.execute(query, queryCompleteCallback, queryErrorCallback);
}

function queryErrorCallback(error) {
    alert('Query error: ' + error.message);
    setLoading(false);
}
//Query END

//Export START
function lmExport(nodeData) {
    var serviceConfig = GetServiceConfig(nodeData.ServiceID);

    if (serviceConfig.can_export) {
        if (arcGISControlMap.graphics.graphics.length > 0) {
            var geometry = arcGISControlMap.graphics.graphics[0].geometry;

            var gp = new esri.tasks.Geoprocessor("http://10.79.1.79/ArcGIS/rest/services/IDD/RIGACTIVITY_REPORTING_Extract/GPServer/Extract%20Data%20Task");
            gp.setOutSpatialReference({ wkid: 102100 });

            var clipLayers = [];
            clipLayers.push('RIGACTIVITY_REPORTING - Overview');

            var features = [];
            features.push(arcGISControlMap.graphics.graphics[0]);
            var featureSet = new esri.tasks.FeatureSet();
            featureSet.features = features;

            var params = {
                "Layers_to_Clip": clipLayers,
                "Area_of_Interest": featureSet,
                "Feature_Format": 'Shapefile - SHP - .shp'
            }

            gp.submitJob(params, completeExportCallback, statusExportCallback, function (error) {
                alert("Export error: " + error.message);
            });
        }
        else {
            alert('There is no selection!');
        }
    }
    else {
        alert('Export is not setup for this service.');
    }
}

function completeExportCallback(jobInfo) {
    if (jobInfo.jobStatus == "esriJobSucceeded") {
        //        gp.getResultData(jobInfo.jobId, "Output_Zip_File", downloadExportFile);

        //try download from here as it does not call downloadExportFile for some reason
        setLoading(false);
        var theurl = "http://tags.ihs.com/arcgisjobs/idd/rigactivity_reporting_extract_gpserver/" + jobInfo.jobId + "/scratch/output.zip";
        window.location = theurl;
    }
}

function statusExportCallback(jobInfo) {
    if (jobInfo.jobStatus == "esriJobFailed") {
        setLoading(false);
        alert("Export error: " + status);
    }
    else if (jobInfo.jobStatus == "esriJobSucceeded") {
        setLoading(false);
    }
}

function downloadExportFile(outputFile) {
    setLoading(false);
    arcGISControlMap.graphics.clear();
    var theurl = outputFile.value.url;
    window.location = theurl;
}
//Export END

function addVisible(visibleArray, id) {
    if (!visibleArray || visibleArray[0] == -1)
        visibleArray = [];
    visibleArray.push(id);
    return visibleArray;
}

function mergeServerExpressions(serviceConfig, ids) {
    var expression = [];
    for (var i = 0; i < serviceConfig.layers.length; i++) {
        if (ids.indexOf(serviceConfig.layers[i].id) > -1) {
            expression.push(serviceConfig.layers[i].server_definition_expression);
        }
    }
    return expression.join(' OR ');
}

function setLabelDefEx(serviceConfig) {
    if (lmArcGISConfig.label_service) {
        var lblService = arcGISControlMap.getLayer(lmArcGISConfig.label_service.id);
        var service = arcGISControlMap.getLayer(serviceConfig.id);
        var labelDefinition = lblService.layerDefinitions;
        var layerDefinitions = service.layerDefinitions;
        if (!labelDefinition) labelDefinition = [];
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
            }
            else if (def != '') {
                labelDefinition[serviceConfig.labels[i].id] = def;
            }
            else if (serverExp != '') {
                labelDefinition[serviceConfig.labels[i].id] = serverExp;
            }
        }
        lblService.setLayerDefinitions(labelDefinition);
    }
}

//show map on load
dojo.addOnLoad(init);

function SetMapExtentFromService(el, extentType) {
    var nodeData = GetJSonServiceDataFromNode(el);
    var extent;

    switch (extentType) {
        case extentTypeEnum.full:
            extent = arcGISControlMap.getLayer(nodeData.ServiceID).fullExtent;
            break;
        case extentTypeEnum.initial:
            extent = arcGISControlMap.getLayer(nodeData.ServiceID).initialExtent;
            break;
        default:
            //
    }

    arcGISControlMap.setExtent(extent, true);
}

function setLayerVisibility(map, layerId, isVisible) {
    var layer = map.getLayer(layerId);

    if (layer) {
        layer.setVisibility(isVisible);
    }

    var layerLabel = map.getLayer(layerId + labelLayerSuffix);

    if (layerLabel) {
        layerLabel.setVisibility(isVisible);
    }
}


function SetLayerScale(el, scaleType) {
    var layerScale = null;
    var layerConfig = null;
    var nodeData = GetJSonServiceDataFromNode(el);

    if (nodeData.ServiceID.substr(nodeData.ServiceID.length - 1) == "L") {
        layerConfig = GetLayerConfig(nodeData.parentServiceID, nodeData.LayerID);
    }
    else {
        layerConfig = GetLayerConfig(nodeData.ServiceID, nodeData.LayerID);
    }

    var layer = arcGISControlMap.getLayer(nodeData.ServiceID).layerInfos[nodeData.LayerID];

    if (layer != undefined) {
        switch (scaleType) {
            case scaleTypeEnum.min:
                if (layerConfig.min_scale != "") {
                    layerScale = layerConfig.min_scale;
                }
                else {
                    layerScale = layer.minScale;
                }
                break;
            case scaleTypeEnum.max:
                if (layerConfig.max_scale != "") {
                    layerScale = layerConfig.max_scale;
                }
                else {
                    layerScale = layer.maxScale;
                }
                break;
            default:
                //
        }

        if (layerScale != null) {
            var currentScale = esri.geometry.getScale(arcGISControlMap.extent, arcGISControlMap.width, arcGISControlMap.spatialReference.wkid);
            var scaleRatio = layerScale / currentScale;
            var newExtent = arcGISControlMap.extent.expand(scaleRatio);
            arcGISControlMap.setExtent(newExtent);
        }
    }
}

function SetServiceScale(el, scaleType, serviceData) {
    var serviceScale = "";

    if (serviceData != null) {
        var serviceConfig = GetServiceConfig(serviceData.ServiceID);

        switch (scaleType) {
            case scaleTypeEnum.min:
                serviceScale = serviceConfig.min_scale;
                break;
            case scaleTypeEnum.max:
                serviceScale = serviceConfig.max_scale;
                break;
            default:
                //
        }

        if (serviceScale != undefined && serviceScale != "") {
            var currentScale = esri.geometry.getScale(arcGISControlMap.extent, arcGISControlMap.width, arcGISControlMap.spatialReference.wkid);
            var scaleRatio = serviceScale / currentScale;
            var newExtent = arcGISControlMap.extent.expand(scaleRatio);
            arcGISControlMap.setExtent(newExtent);
        }
    }
}

function ZoomToFeaturesFromContextMenu(serviceData) {
    var serviceConfig = GetServiceConfig(serviceData.ServiceID);
    if (serviceConfig.main_layer) {
        var selectionLayerColumn = serviceConfig.selection_filter_layer_column;
        var queryLayerId = serviceConfig.selection_filter_query_layer_id;

        if (serviceData.LayerID != null) {
            var layerConfig = GetLayerConfig(serviceData.ServiceID, serviceData.LayerID);

            //Get selection_filter_query_layer_id from layer if specified first
            if (layerConfig.selection_filter_query_layer_id != "") {
                queryLayerId = layerConfig.selection_filter_query_layer_id;
            }

            //If no selection_filter_query_layer_id specified on layer and service level use layer ID
            queryLayerId = serviceData.LayerID;
        }

        if (queryLayerId == "") queryLayerId = "0";

        var url = serviceConfig.url + '/' + queryLayerId;
        var layer = arcGISControlMap.getLayer(serviceConfig.id);
        var where = '';
        if (layer && layer.layerDefinitions) {
            where = layer.layerDefinitions[queryLayerId];
        }
        ZoomToFeatures(url, where, serviceConfig, layerConfig);
    }
}

function sendPrintJob() {
    var mapPrinter = new LiveMapArcGISMapPrinter(arcGISControlMap, "/MapPrintHandler.ashx");
    var mapSz = $("#printSizeOptions").val();
    var varPrintOri = "Portrait";
    var blanCheck = document.getElementById("printLandRadio").checked;

    var xmin = Math.abs(parseFloat(arcGISControlMap.extent.xmin)) * convert;
    var xmax = Math.abs(parseFloat(arcGISControlMap.extent.xmax)) * convert;

    var scale = Math.abs(xmin - xmax);

    if (blanCheck) {
        varPrintOri = "Landscape"
    }

    var params = {
        Type: lmArcGISConfig.printmap_type,
        Title: lmArcGISConfig.printmap_title,
        Orientation: varPrintOri,
        PageSize: mapSz,
        colNames: printMapColArr,
        colAlaises: printMapColAlaisArr,
        dataRows: dataArr,
        Scale: scale
    };

    deferredPrint = mapPrinter.generate("", dojo.toJson(params), "PDF");

    //the code below MUST be here otherwise we never get a status back from the  dojo.io.iframe.send
    // and the user is only able to print once until the page reloads.  This is a known issue.  Plz see
    //http://www.mikejuniper.com/2009/03/fun-with-dojoioiframesend/

    if (deferredPrint) {
        deferredPrint.cancel();
    }

    setLoading(false);
}