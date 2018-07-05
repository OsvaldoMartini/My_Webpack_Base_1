var fmMap;
var fmConfig;
var fmFeaturesArray = new Array();
var fmPageFilter = "";
var fmControlFilter = new Array();
var fmFeatureLayer = null;
var fmBaseLayer = null;
var fmFeatureLayerExtent = null;
var fmMaximised = false;

require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/virtualearth/VETiledLayer",
        "esri/request",
        "esri/geometry/Point",
        "esri/graphic",
        "esri/graphicsUtils",
        "esri/symbols/PictureMarkerSymbol",
        "esri/InfoTemplate",
        "esri/dijit/InfoWindow",
        "dojo/_base/array",
        "dojo/domReady!"
    ],
    function(
        esriMap,
        esriFeatureLayer,
        esriVeTileLayer,
        esriRequest,
        esriPoint,
        esriGraphic,
        esriGraphicUtils,
        esriPictureMarkerSymbol,
        esriInfoTemplate,
        esridijitInfoWindow,
        dojoArray
    ) {
        if ($("#fmConfigJSON").length > 0) {
            fmConfig = jQuery.parseJSON($("#fmConfigJSON").val());
            BuildFeaturesArray();
            BuildFilters();
            $("#fmTitle").text(fmConfig.title);
            fmPageFilter = $("#fmPageFilter").val();
            fmMap = new esri.Map("fmMap");
            fmMap.autoResize = true;

            setFMLoading(true);

            //create a feature collection
            var featureCollection = {
                "layerDefinition": null,
                "featureSet": {
                    "features": [],
                    "geometryType": "esriGeometryPoint"
                }
            };

            featureCollection.layerDefinition = {
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
            };

            //hide the popup if its outside the map's extent
            fmMap.on("mouse-drag", function(evt) {
                if (fmMap.infoWindow.isShowing) {
                    var loc = fmMap.infoWindow.getSelectedFeature().geometry;
                    if (!fmMap.extent.contains(loc)) {
                        fmMap.infoWindow.hide();
                    }
                }
            });

            fmMap.on("resize", function(evt) {
                SetFeatureLayerExtent();
            });

            fmMap.on("reposition", function(evt) {
                SetFeatureLayerExtent();
            });

            fmMap.on("layers-add-result", function(results) {
                RequestFeatureMapData();
            });

            AddBaseLayer(esriVeTileLayer.MAP_STYLE_ROAD);

            AddFeatureLayer();
        }

        //Add filter toggles
        function BuildFilters() {
            if (fmConfig.features.feature != null) {
                for (var i = 0; i < fmConfig.features.feature.length; i++) {
                    var filtersHtml = '<div class="fmFilterRow"><div class="fmFilterCell"><img src="{fmFilterImgSrc}"> ' +
                        '</div><div class="fmFilterCell"><input id="{fmFilterInputId}" type="checkbox" value="checked"' +
                        'fmdata="{fmFilterInputData}"></div><div class="fmFilterCell">{fmFilterText}</div>';

                    filtersHtml = filtersHtml.replace("{fmFilterImgSrc}", fmConfig.features.feature[i].symbol_url);
                    filtersHtml = filtersHtml.replace("{fmFilterInputId}", "chkFilterInputId" + i);
                    filtersHtml = filtersHtml.replace("{fmFilterInputData}", fmConfig.features.feature[i].filter_value);
                    filtersHtml = filtersHtml.replace("{fmFilterText}", fmConfig.features.feature[i].filter_label);
                    $("#fmFilters").append(filtersHtml);

                    //hook filter checkboxes
                    $("#fmFilters").find("input[type='checkbox']").click(function() {
                        AddFeatureLayer();
                    });
                    //set all checkboxes checked on load
                    $("#fmFilters").find("input[type='checkbox']").each(function() {
                        $(this).prop('checked', true);
                    });
                }
            }
        }

        function AddBaseLayer(esriVeTileLayerStyle) {
            if (fmBaseLayer != null && fmBaseLayer.id != null) fmMap.removeLayer(fmBaseLayer);

            fmBaseLayer = new esriVeTileLayer({
                bingMapsKey: $("#bmKey").val(),
                mapStyle: esriVeTileLayerStyle
            });

            fmMap.addLayer(fmBaseLayer);
        }

        function AddFeatureLayer() {
            //remove current feature layer
            if (fmFeatureLayer != null && fmFeatureLayer.id != null) fmMap.removeLayer(fmFeatureLayer);

            //create new feature layer based on the feature collection
            fmFeatureLayer = new esriFeatureLayer(featureCollection);
            fmFeatureLayer.maxScale = 0;
            fmFeatureLayer.minScale = 0;

            //associate the features with the popup on click
            fmFeatureLayer.on("click", function(evt) {
                if (evt.graphic.attributes.Loaded === false) {
                    $.ajax({
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        url: window.location.pathname + "/GetFeatureMapDetails",
                        data: JSON.stringify({ 'installationId': evt.graphic.attributes.ID }),
                        success: function(response) {
                            if (response != null && response.d != null && response.d != "") {
                                var parsedResponse = JSON.parse(response.d);
                                var additionalData = '';
                                for (var i = 0, len = parsedResponse.length; i < len; i++) {
                                    var item = parsedResponse[i];
                                    additionalData += '<b>' + item.Key + '</b>: ' + item.Value + '</br>';
                                }

                                evt.graphic.attributes['Additional'] = additionalData;
                                evt.graphic.attributes.Loaded = true;

                                fmMap.infoWindow.setFeatures([evt.graphic]);
                            }
                        }
                    });
                } else {
                    fmMap.infoWindow.setFeatures([evt.graphic]);
                }
            });

            fmMap.addLayers([fmFeatureLayer]);
        }

        function RequestFeatureMapData() {
            SetControlFilter();
            setFMLoading(true);

            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: window.location.pathname + "/GetFeatureMapData",
                data: JSON.stringify({ 'pageFilter': fmPageFilter, 'controlFilters': fmControlFilter }),
                success: function(responseData, textStatus, jqXHR) {
                    var features = new Array();

                    if (responseData != null && responseData.d != null && responseData.d != "") {
                        var featureMapData = JSON.parse(responseData.d);

                        for (var i = 0, len = featureMapData.length; i < len; i++) {
                            var featureMapItem = featureMapData[i];
                            featureMapItem.Loaded = false;
                            var filterValue = featureMapItem[fmConfig.features.filter_column].toUpperCase();
                            var longitude = featureMapItem[fmConfig.features.longitude_column];
                            var latitude = featureMapItem[fmConfig.features.latitude_column];

                            if (longitude != null && latitude != null && !isNaN(longitude) && !isNaN(latitude)) {
                                var infoTemplate = new esriInfoTemplate();
                                var pictureMarkerSymbol = null;
                                var isForeignOperator = featureMapItem.IsForeignOperator;


                                if (fmFeaturesArray[filterValue] != null) {
                                    infoTemplate.title = fmFeaturesArray[filterValue].popup_info_title_template;
                                    infoTemplate.content = fmFeaturesArray[filterValue].popup_info_content_template;

                                    var url = fmFeaturesArray[filterValue].symbol_url;
                                    if (isForeignOperator) {
                                        url = url.split('.png').join('foreign.png');
                                    }

                                    pictureMarkerSymbol = new esriPictureMarkerSymbol(url, fmFeaturesArray[filterValue].symbol_height, fmFeaturesArray[filterValue].symbol_width);
                                } else {
                                    infoTemplate.title = fmConfig.features.popup_info_title_template;
                                    infoTemplate.content = fmConfig.features.popup_info_content_template;

                                    var url = fmConfig.features.symbol_url;
                                    if (isForeignOperator) {
                                        url = url.split('.png').join('foreign.png');
                                    }

                                    pictureMarkerSymbol = new esriPictureMarkerSymbol(url, fmConfig.features.symbol_height, fmConfig.features.symbol_width);
                                }

                                var graphic = new esriGraphic(new esriPoint(longitude, latitude), pictureMarkerSymbol, featureMapItem, infoTemplate);
                                features.push(graphic);
                            }
                        }
                    }

                    if (features.length > 0) {
                        fmFeatureLayer.applyEdits(features, null, null);
                        SetFeatureLayerExtent();
                        SetExtentToFeatureLayer();
                    } else {
                        mFeatureLayerExtent = null;
                    }

                    setFMLoading(false);
                },
                error: function(xhr, status, error) {
                    setFMLoading(false);
                    ShowError(error);
                }
            });
        }

        //Set feature layer extent
        function SetFeatureLayerExtent() {
            if (fmFeatureLayer.graphics.length > 0) fmFeatureLayerExtent = esriGraphicUtils.graphicsExtent(fmFeatureLayer.graphics);
            else fmFeatureLayerExtent = null;
        }

    }
);

//Get filter to pass to the page
function SetControlFilter() {
    var arrayCounter = 0;
    fmControlFilter = new Array();

    if ($("#fmFilters").find("input[type='checkbox']").length > 0) {
        $("#fmFilters").find("input[type='checkbox']").each(function() {
            if ($(this).prop('checked')) {
                fmControlFilter[arrayCounter] = $(this).attr("fmdata");
                arrayCounter = arrayCounter + 1;
            }
        });
    }
}

//Create named filter array for quick access
function BuildFeaturesArray() {
    if (fmConfig.features.feature != null) {
        for (var i = 0; i < fmConfig.features.feature.length; i++) {
            fmFeaturesArray[fmConfig.features.feature[i].filter_value.toUpperCase()] = fmConfig.features.feature[i];
        }
    }
}

//Set extent to everything visible on the feature layer
function SetExtentToFeatureLayer() {
    if (fmFeatureLayerExtent != null) {
        //fmMap.setExtent(fmFeatureLayerExtent.expand(1.05), true);
        fmMap.setExtent(fmFeatureLayerExtent, true);
    }
}

//Resize
function FMResize() {
    if (fmMaximised) {
        $("#featureMapArcGisControl").removeClass("featureMapArcGisControlMaximised");
        $("#featureMapArcGisControl").addClass("featureMapArcGisControlMinimised");
        $("#fmResize").prop('title', 'Expand');
    } else {
        $("#featureMapArcGisControl").removeClass("featureMapArcGisControlMinimised");
        $("#featureMapArcGisControl").addClass("featureMapArcGisControlMaximised");
        $("#fmResize").prop('title', 'Close');
    }

    fmMap.resize(true);
    fmMap.reposition();
    SetExtentToFeatureLayer();
    fmMaximised = !fmMaximised;
}

function setFMLoading(loading) {
    //$('#fmLoading').hide(); //Hide initial load message
    $("#fmFilters input[type='checkbox']").attr('disabled', loading);

    if (loading === true) {
        $('#fmLoading').show();
        if (fmMap != null) fmMap.hideZoomSlider();
    } else {
        $('#fmLoading').hide();
        if (fmMap != null) fmMap.showZoomSlider();
    }
}

$('#fmFullExtentAnchor, #fmResize').tipsy({ gravity: 'se', delayIn: 200, delayOut: 200, fade: true });
$('#fmResize.max').tipsy({ gravity: 'ne', delayIn: 200, delayOut: 200, fade: true });