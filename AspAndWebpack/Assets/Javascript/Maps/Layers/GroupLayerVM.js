/**
 * A layer representing a group of layers. Inherits from the LayerVM.
 * @param {object} options - A collection of properties that are to be used to set-up the layer.
 */
var GroupLayerVM = function(options) {
  var self = this;

  //Call the super/base constructor.
  LayerVM.apply(self, [options, { toggleChildren: !!options.id }]);

  var visibleChildren = false;

  options.children.forEach(function(childLayer) {
    var layerVm = self.layerManagerVm.SetupLayer(childLayer);
    layerVm.parentLayer = self;
    self.children.push(layerVm);

    self.layerManagerVm.mapPageVM.temporalSlider.addLayer(layerVm);
    layerVm.isVisible.subscribe(function(visible) {
      if (!self.isVisible() && visible) {
        //we don't wanted to turn siblings on. So temporarily turn "toggle children" off.
        self.options.toggleChildren = false;
        self.isVisible(true);
        self.options.toggleChildren = !!self.options.id;
      }
    });
  });

  self.isVisible.subscribe(function(visible) {
    if (!self.options.toggleChildren) return;
    self.passDown("isVisible", visible);
  });
};

//Use the parent's prototype as a base.
GroupLayerVM.prototype = Object.create(LayerVM.prototype);

//But use your own constructor, not your parent's constructor (yet).
GroupLayerVM.prototype.constructor = GroupLayerVM;

/*********************************** IMPLEMENTED "ABSTRACT" FUNCTIONS ************************************/

/**
 Update function called on map change or filters change. 
 * @param {string} updateRequestSender - The type of update such as facetPanel.
 * @param {object} map - esri map.
 * @param {object} geo - geographic extent.
 **/
GroupLayerVM.prototype.update = function(updateRequestSender, map, geo, zoom) {
  //this.passDown('update', arguments);
};

/**
 * Clear the layer.
 */
GroupLayerVM.prototype.clear = function(updateRequestSender, map, geo, zoom) {
  //this.passDown('clear', arguments);
};
GroupLayerVM.prototype.passDown = function(func, args) {
  var self = this;
  if (!Array.isArray(args)) args = [args];
  self.children().forEach(function(child) {
    child[func].apply(child, args);
  });
};
