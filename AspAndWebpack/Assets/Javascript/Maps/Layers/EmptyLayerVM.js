
/**
 * A layer representing nothing! Inherits from the LayerVM.
* @param {object} options - A collection of properties that are to be used to set-up the layer.
 */
var EmptyLayerVM = function (options) {
    var self = this;

    //Call the super/base constructor.
    LayerVM.apply(self, arguments);

    self.commandsVM = options.commandsVM || null;
};

//Use the parent's prototype as a base.
EmptyLayerVM.prototype = Object.create(LayerVM.prototype);

//But use your own constructor, not your parent's constructor (yet).
EmptyLayerVM.prototype.constructor = EmptyLayerVM;

/*********************************** IMPLEMENTED "ABSTRACT" FUNCTIONS ************************************/

/**
 Update function called on map change or filters change. 
 * @param {string} updateRequestSender - The type of update such as facetPanel.
 * @param {object} map - esri map.
 * @param {object} geo - geographic extent.
 **/
EmptyLayerVM.prototype.update = function (updateRequestSender, map, geo, zoom) {

};

/**
 * Clear the layer.
 */
EmptyLayerVM.prototype.clear = function (updateRequestSender, map, geo, zoom) {

};
/**
 * Export Data from the layer.
 */
EmptyLayerVM.prototype.exportData = function () {
    this.commandsVM.exportResults(true);
};
