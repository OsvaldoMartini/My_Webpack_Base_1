
/**
 * A layer representing nothing! Inherits from the LayerVM.
* @param {object} options - A collection of properties that are to be used to set-up the layer.
 */
var EsriMapLayerVM = function (options) {
    var self = this;

    //Call the super/base constructor.
    LayerVM.apply(self, arguments);
    
    self.parentServiceId = self.options.parentServiceId;

    self.icon = self.options.icon = options.icon || '/Assets/Images/Map/Legend/' + self.options.title.replace(' ', '') + '.png';
    self.detailImage = self.options.detailImage = options.detailImage || '/Assets/Images/Map/Legend/' + self.options.title.replace(' ', '') + '_detail.png';
    self.type = [layerTypeEnum.Esri]
};

//Use the parent's prototype as a base.
EsriMapLayerVM.prototype = Object.create(LayerVM.prototype);

//But use your own constructor, not your parent's constructor (yet).
EsriMapLayerVM.prototype.constructor = EsriMapLayerVM;

/*************************************************************************************/
/*********************************** FUNCTIONS ************************************/
/*************************************************************************************/

/**
 Update function called on map change or filters change. 
 * @param {string} updateRequestSender - The type of update such as facetPanel.
 * @param {object} map - esri map.
 * @param {object} geo - geographic extent.
 **/
EsriMapLayerVM.prototype.update = function (updateRequestSender, map, geo, zoom, globalConstraints, remove) {
    var self = this;

    if (updateRequestSender === Search.prototype.updateRequestSender.pageLoad) {
        return undefined;
    }
    var serviceLayer;

    if (self.parentServiceId) {
        // We need to get all the visible layers from the parent layer
        serviceLayer = self.map.getLayer(self.parentServiceId);
        var layerConfig;
        if (serviceLayer != null) {
            var services = self.layerManagerVm.mapConfig.services;
            for (var i = 0; i < services.service.length; i++) {
                if (services.service[i].id === self.parentServiceId) {
                    if (services.service[i].layers != null) {
                        var serviceConfig = services.service[i];
                        for (var i = 0; i < serviceConfig.layers.length; i++) {
                            if (serviceConfig.layers[i].id === self.id) {
                                layerConfig = serviceConfig.layers[i];
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            var vis = serviceLayer.visibleLayers;
            var linkedLayers = [];

            if (typeof (vis) == "undefined") {
                vis = [];
            }
            linkedLayers.push(self.id);
            if (layerConfig.linked_layer_ids != null) {
                linkedLayers = linkedLayers.concat(layerConfig.linked_layer_ids.split(','));
            }
            if (remove) {
                vis = self.subtractArrays(vis, linkedLayers);
            } else {
                vis = vis.concat(linkedLayers);
            }
            serviceLayer.setVisibility(true);
            serviceLayer.setVisibleLayers(vis);
        }
    } else {
        serviceLayer = self.map.getLayer(self.id);
        serviceLayer.setVisibility(!remove);
    }
    return self.id;
};

/**
 * Clear the layer.
 */
EsriMapLayerVM.prototype.clear = function () {
    var self = this;
    var remove = true;
    self.update("", null, null, null, null, remove);
};


EsriMapLayerVM.prototype.subtractArrays = function (array1, array2) {
    for (var j = 0; j < array2.length; j++) {
        for (var i = array1.length - 1; i >= 0; i--) {
            if (array1[i] === array2[j]) {
                array1.splice(i, 1);
            }
        }
    }
    return array1;
};
