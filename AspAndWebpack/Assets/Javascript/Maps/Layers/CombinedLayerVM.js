
/**
 * A layer representing a group of layers. Inherits from the LayerVM.
* @param {object} options - A collection of properties that are to be used to set-up the layer.
 */
var CombinedLayerVM = function (options) {
    var self = this;

    //Call the super/base constructor.
    MarkerLayerVM.apply(self, [options, { toggleChildren: !!options.id }]);
    var visibleChildren = false;

    options.children.forEach(function (childLayer) {
        var layerVm = self.layerManagerVm.SetupLayer(childLayer);
        layerVm.parentLayer = self;
        self.children.push(layerVm);

        self.layerManagerVm.mapPageVM.temporalSlider.addLayer(layerVm);
        layerVm.isVisible.subscribe(function (visible) {
            if (!self.isVisible() && visible) {
                //we don't wanted to turn siblings on. So temporarily turn "toggle children" off.
                self.options.toggleChildren = false;
                self.isVisible(true);
                self.options.toggleChildren = !!self.options.id;
            }
        });
    });

    self.onToggleFocus = function(self, e){
        var $e = $(e.target);
        var parent = $e.parent().webuiPopover('show');
        var popover = $e.parent().webuiPopover('getTarget')[0];

        var tabs = $(':tabbable', $e.parents()[2]);
        var next = tabs[tabs.index(e.target) + 1];
        var popoverContent = popover.find(':tabbable');
        $e.on('keydown', function(e){
            if(e.keyCode == 9 && !e.shiftKey){
                popoverContent.first().focus();
                return false;
            }
        });

        popoverContent.first().on('keydown', function(e){
            if(e.keyCode == 9 && e.shiftKey){
                $e.focus();
                $e.parent().webuiPopover('hide');
                return false;
            }
        });
        popoverContent.last().on('keydown', function(e){
            if(e.keyCode == 9 && !e.shiftKey){
                next.focus();
                $e.parent().webuiPopover('hide');
                return false;
            }
        });
    };

    self.search.registerStartCallback(function () {
        var selfFacets = self.facets.getFacetsFromSearch();
        self.children().forEach(function(child){
            var childFacets = child.facets.getFacetsFromSearch();
            if(!facetsEqual(selfFacets, childFacets)){
                child.facets.submitFacets(selfFacets, null, !child.isVisible());
            }
        });
    });

    function facetsEqual(a, b){
        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        if(aKeys.length !== bKeys.length) return false;

        for (var key in a) {
            if (a.hasOwnProperty(key) !== b.hasOwnProperty(key)|| !a.hasOwnProperty(key)) {
                return false;
            }
            var aVal = a[key];
            var bVal = b[key];
            if(aVal.values.toString() !== bVal.values.toString()){
                return false;
            }
        }

        return true;
    }
    self.children().forEach(function(c){
        c.search.registerStartCallback(function (sender) {
            if (sender !== 'facetPanel'){
                return;
            }

            var childFacets = c.facets.getFacetsFromSearch();
            var parentFacets = self.facets.getFacetsFromSearch();

            if(!facetsEqual(childFacets, parentFacets)){
                self.facets.submitFacets(childFacets);
            }
        });
    });
    
    self.isVisible.subscribe(function (visible) {
        if (!self.options.toggleChildren) return;
        var activeChildren = self.children().reduce(function(active, child, i){
            if(child.isVisible()) active.push(i);
            return active;
        }, []);

        if(!visible) self.options.activeChildren = activeChildren;
        else{
            if (activeChildren.length){
                self.options.activeChildren = activeChildren;
            }
            if(!self.options.activeChildren.length)self.options.activeChildren=[0];
        }

        self.passDown('isVisible', visible, self.options.activeChildren || [0]);
    });
};

//Use the parent's prototype as a base.
//CombinedLayerVM.prototype = Object.create(LayerVM.prototype);
CombinedLayerVM.prototype = Object.create(MarkerLayerVM.prototype);

//But use your own constructor, not your parent's constructor (yet).
CombinedLayerVM.prototype.constructor = CombinedLayerVM;


/*********************************** IMPLEMENTED "ABSTRACT" FUNCTIONS ************************************/

/**
 Update function called on map change or filters change.
 * @param {string} updateRequestSender - The type of update such as facetPanel.
 * @param {object} map - esri map.
 * @param {object} geo - geographic extent.
 **/
//CombinedLayerVM.prototype.update = function (updateRequestSender, map, geo, zoom) {
    //this.passDown('update', arguments);
//};

/**
 * Clear the layer.
 */
CombinedLayerVM.prototype.clear = function (updateRequestSender, map, geo, zoom) {
    //this.passDown('clear', arguments);
};
CombinedLayerVM.prototype.passDown = function (func, args, limits) {
    var self = this;
    if (!Array.isArray(args)) args = [args];
    self.children().forEach(function (child, i) {
        if(limits && limits.indexOf(i) < 0) return;
        child[func].apply(child, args);
    });
};
CombinedLayerVM.prototype.popover = function (popover) {
    return ko.renderTemplate('template-combined-layers', this, {}, popover.$target.find('.webui-popover-content')[0]);
};