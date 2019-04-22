

function getMainServiceConfig() {
    for (var i = 0; i < lmArcGISConfig.services.service.length; i++) {
        if (lmArcGISConfig.services.service[i].main_layer === true) {
            return lmArcGISConfig.services.service[i];
        }
    }
    return null;
}
 
//Returns service config for a given serviceID
function GetServiceConfig(serviceID) {

    var serviceConfig = null;

    if (serviceID.substr(serviceID.length - 1) == "L") {
        //Label service
        serviceConfig = lmArcGISConfig.label_service;
    }
    else {
        for (var i = 0; i < lmArcGISConfig.services.service.length; i++) {
            if (lmArcGISConfig.services.service[i].id == serviceID) {
                serviceConfig = lmArcGISConfig.services.service[i];
                break;
            }
        }
    }
    return serviceConfig;
}

//Gets layer config
function GetLayerConfig(serviceID, layerID) {
    var layerConfig = null;
    var serviceConfig = GetServiceConfig(serviceID);

    if (serviceConfig != null) {
        // Is it label service layer
        if (serviceID.substr(serviceID.length - 1) == "L") {
            for (var i = 0; i < serviceConfig.labels.length; i++) {
                if (serviceConfig.labels[i].id == layerID) {
                    layerConfig = serviceConfig.labels[i];
                    break;
                }
            }
        }
        else {

            if (serviceConfig.layers != null) {
                for (var i = 0; i < serviceConfig.layers.length; i++) {
                    if (serviceConfig.layers[i].id == layerID) {
                        layerConfig = serviceConfig.layers[i];
                        break;
                    }
                }
            }

            //try search in label layers if not found
            if (layerConfig == null && serviceConfig.labels != null) {
                for (var i = 0; i < serviceConfig.labels.length; i++) {
                    if (serviceConfig.labels[i].id == layerID) {
                        layerConfig = serviceConfig.labels[i];
                        break;
                    }
                }
            }
        }
    }

    return layerConfig;
}

//Some configuration elements can be present on both layer and service level.
//This function returns desired configuration in that particular order. 
function GetLayerOrServiceConfiguration(serviceData, configurationElementName) {
    var config = null;

    if (serviceData.ServiceID) {

        var serviceConfig = GetServiceConfig(serviceData.ServiceID);

        if (serviceConfig) {

            //Check layer level config first
            if (serviceData.LayerID) {

                var layerConfig = GetLayerConfig(serviceData.ServiceID, serviceData.LayerID)

                if (layerConfig) {
                    config = layerConfig[configurationElementName] ? layerConfig[configurationElementName] : null;
                }
            }
        }

        // If still null check service level config
        if (config == null) config = serviceConfig[configurationElementName] ? serviceConfig[configurationElementName] : null;

    }

    return config;
}

// Gets array of linked layers from the config
function GetLinkedLayerIds(serviceId, layerId) {
    var layerConfig = GetLayerConfig(serviceId, layerId);
    var layerIds = [];
    layerIds.push(layerConfig.id);

    if (layerConfig.linked_layer_ids != null) {
        layerIds = layerIds.concat(layerConfig.linked_layer_ids.split(','));
    }

    return layerIds;
}

//return the definition expression of the layer
function getDefinitionExpresion(serviceID) {
    var mapDefEx = jQuery.parseJSON($("#ctl00_mainContent_LiveMapArcGISControl_initialDefExp").val());
    if (mapDefEx) {
        for (var i = 0; i < mapDefEx.length; i++) {
            if (mapDefEx[i].Id == serviceID)
                return mapDefEx[i];
        }
    }
}

function substractArrays(array1, array2) {

    for (var j = 0; j < array2.length; j++) {
        for (var i = array1.length - 1; i >= 0; i--) {
            if (array1[i] == array2[j]) {
                array1.splice(i, 1);
                //break;
            }
        }
    }
    return array1;
}

function setLoading(load) {

    $('#divInitialLoad').hide(); //Hide initial load message

    if (load === true) {
        $('#arcGISControlMap #mapLoading').show();
        //Remove it for now because causing issues, have to find a workaround for it
        //arcGISControlMap.disableMapNavigation();

        if (arcGISControlMap != null) arcGISControlMap.hideZoomSlider();
    }
    else {
        $('#arcGISControlMap #mapLoading').hide();
        //Remove it for now because causing issues, have to find a workaround for it
        //arcGISControlMap.enableMapNavigation();
        if (arcGISControlMap != null) arcGISControlMap.showZoomSlider();
    }
}

function makeUnique(array) {
    var u = {}, a = [];
    for (var i = 0, l = array.length; i < l; ++i) {
        if (array[i] in u)
            continue;
        a.push(array[i]);
        u[array[i]] = 1;
    }
    return a;
}

//Gets JSon data from node object
function GetJSonServiceDataFromNode(jqObject) {
    //sWell Activity\\{\"ServiceID\":\"001\",\"LayerID\":\"1\",\"Action\":\"ActivateLayer\"}
    var serviceData = null;
    var nodePath = jqObject.attr('href').substring(jqObject.attr('href').indexOf(",") + 2, jqObject.attr('href').length - 2);

    //Make sure it is service node, e.g. not tree expand anchor
    if (nodePath.indexOf("ServiceID") > -1) {
        var nodeValues = nodePath.split("\\\\");
        var nodeValue = nodeValues[nodeValues.length - 1].replace(/\\"/g, '"').replace("s{", "{");

        serviceData = JSON.parse(nodeValue);
    }

    return serviceData;
}

function GetPrintData() {
    var mapObject = {};
    mapObject.layers = [];
    for (var i = 0; i < arcGISControlMap.layerIds.length; i++) {
        var layer = arcGISControlMap.getLayer(arcGISControlMap.layerIds[i]);
        if (layer.visible) {
            mapObject.layers.push(jQuery.extend(true, {}, layer));
        }
    }
    mapObject.extent = arcGISControlMap.extent;
    mapObject.proxyUrl = esriConfig.defaults.io.proxyUrl;

    mapObject.title = $('#printTitle').val();

    if ($("#chkGenerateLegend").is(':checked')) {
        //create clone of the tree and remove unecessary items
        var tree = $("div[id$='tvServiceTree']").clone();
        tree.children('div').each(function () {
            var del = true;
            var hasChbox = false;
            $(this).find("input[type=checkbox]").each(function (index, element) {
                if ($(element)[0].checked) {
                    del = false;
                }
                hasChbox = true;
            });
            if (del && hasChbox) {
                $(this).prev('table').remove();
                $(this).remove();
            }
        });

        tree.find("span:contains('May be filtered on')").closest('table').next('div').remove();
        tree.find("span:contains('May be filtered on')").closest('table').remove();
        tree.find("input[type=checkbox][checked!='checked']").closest('table').next('div').remove();
        tree.find("input[type=checkbox][checked!='checked']").closest('table').remove();
        tree.find('span:contains(Filter)').closest('table').next('div').remove();
        tree.find('span:contains(Filter)').closest('table').remove();
        tree.find('input[type=checkbox]').remove();
        tree.find("img[src^='/WebResource.axd']").parent('a').remove();
        tree.find("img[src^='/WebResource.axd']").remove();
        tree.find('a').attr('href', '#');
        tree.find('a').removeAttr('onclick');
        tree.find('div').show();

        mapObject.tree = tree;
    }
    else mapObject.tree = ''

    mapObject.width = arcGISControlMap.width;
    mapObject.height = arcGISControlMap.height;

    return mapObject;
}

function getPrintMapTables() {

    var mainConfig = getMainServiceConfig();
    var layer = arcGISControlMap.getLayer(mainConfig.id);
    var geometry = arcGISControlMap.extent;
    var mx_num = 50;
    var where = '';
    var queryLayerId = mainConfig.selection_filter_query_layer_id;
    if (queryLayerId == '') queryLayerId = '0';
    var url = mainConfig.url + '/' + queryLayerId;
    if (layer && layer.layerDefinitions) {
        where = layer.layerDefinitions[queryLayerId];
    }

    queryLayer(url, geometry, printMapColArr, '', where,
				function (featureSet) {
				    for (var i = 0; i < featureSet.features.length && i < mx_num; i++) {
				        for (var n = 0; n < this.printMapColArr.length; n++) {
				            var val = featureSet.features[i].attributes[this.printMapColArr[n]];
				            var convert = val == null ? "NULL" : val.toString();
				            dataArr.push(convert);
				        }
				    }
				    sendPrintJob();
				},
                function queryErrorCallback(error) {
                    alert('Query error: ' + error.message);
                    setLoading(false);
                }
		      );
}

function ZoomToCustomExtent(xMin, yMin, xMax, yMax, spatialReference) {

    if (xMin && yMin && xMax && yMax && spatialReference) {
        var customExtent = new esri.geometry.Extent({
            "xmin": parseFloat(xMin),
            "ymin": parseFloat(yMin),
            "xmax": parseFloat(xMax),
            "ymax": parseFloat(yMax),
            "spatialReference": { "wkid": parseFloat(spatialReference) }
        });

        if (customExtent) { this.arcGISControlMap.setExtent(customExtent, true); }
    }
}

