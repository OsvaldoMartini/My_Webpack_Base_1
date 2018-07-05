var MapSearchBarVM = function (search, options) {
    var self = this;

    options = $.extend({},
        {
            layers: [],
            onGlobalSearchApplied: function () { },
            onLayerSearchApplied: function (layerId) { },
            allowAdvancedSearch: false,
            map:null
        },
        options);

    SearchBarVM.apply(self, [search, options]);
    self.map = options.map;

    /* PROPERTIES */
    self.GLOBAL_SEARCH_OPTION = { 
        key: "AllLayers", 
        value: "All Layers",
        applySearch: self.applyMapSearch.bind(self) 
    };
    
    var mapSearch = self.mapSearchSetup();
    self.LOCATION_SEARCH_OPTION = {
        key: "Location",
        value: "Location",
        applySearch: mapSearch.apply,
        autocompleteSource: mapSearch.autocompleteSource,
        autocompleteSelect: mapSearch.autocompleteSelect,
    };
    
    self.queryKey = self.search.queryProperty.search;
    self.newSearchText = ko.observable('');

    /* CALLBACKS / EVENTS */
    self.onGlobalSearchApplied = options.onGlobalSearchApplied;
    self.onLayerSearchApplied = options.onLayerSearchApplied;

    /* OBSERVABLES */
    self.layers = typeof options.layers === "function" ? options.layers : ko.observableArray(options.layers);

    self.searchableLayers = ko.computed(function () {
        var result = self.layers()
            .filter(function (p) {
                return p.isTextSearchable && p.hasFacets && p.facets && p.search;
            });

        return result;
    });

    self.layersWithoutResults = ko.computed(function() {
        var result = self.searchableLayers()
            .filter(function(p) {
                return p.isVisible() && p.totalResults && p.totalResults() === 0 && p.search.hasQueryValue(self.queryKey);
            });

        return result;
    });

    self.noSearchResultsText = ko.computed(function () {
        var result = "There were no results found for ";
        result += self.layersWithoutResults()
            .map(function(p) {
                return "\"" + p.search.getQueryValue(self.queryKey) + "\"" + " (" + p.title() + ")";
            })
            .join(", ");

        return result;
    });

    //self.layersWithResults = ko.computed(function () {
    //    var result = self.searchableLayers()
    //        .filter(function (p) {
    //            return p.isVisible() && p.totalResults && p.totalResults() > 0;
    //        });

    //    return result;
    //});

    self.appliedSearches = ko.observableArray([]);

    self.selectedOption = ko.observable(self.LOCATION_SEARCH_OPTION);

    self.isLocationSearch = ko.computed(function () {
        return self.selectedOption() === self.LOCATION_SEARCH_OPTION;
    });

    //CTOR
    

    self.layers.subscribe(function(layers){
        var dropdown = [];
        dropdown.push(
            self.LOCATION_SEARCH_OPTION,
            {key:'--'},
            self.GLOBAL_SEARCH_OPTION);
        layers.filter(function (p) {
            return p.isTextSearchable && p.hasFacets && p.facets && p.search;
        }).forEach(function(l){
            dropdown.push({
                key: l.id, 
                value: l.title(), 
                css: 'u-padding-Ll', 
                applySearch: self.applyMapSearch.bind(self) });
        });

        dropdown.push({key:'--'});
        dropdown.push({key:'AllJanes', value:'All Janes'});

        self.dropdown(dropdown);
    });
    self.redirect = true;
    self.calculateAppliedSearches();
    var globalSearchTerm = self.search.getQueryValue(self.queryKey);
    if (globalSearchTerm && globalSearchTerm.length > 0) {
        self.applyGlobalSearch(globalSearchTerm);
        self.selectedZone(self.GLOBAL_SEARCH_OPTION);
    }else {
        self.selectedZone(self.LOCATION_SEARCH_OPTION);
    }
    if(window.searchBarVM){
        var bars = $('.with-search-bar.with-data-bind');
        bars.each(function(){
            if (!ko.dataFor(this)) return;
            ko.cleanNode(this);
        });
    }

};
MapSearchBarVM.prototype = Object.create(SearchBarVM.prototype);
/**
 * Submit the search term for the associated layer or global search.
 * @param {object} searchArg - Either a function or String value denoting the actual search text term.
 */
MapSearchBarVM.prototype.applyMapSearch = function (searchArg) {

    var self = this;

    var searchTerm = typeof searchArg === "function" ? searchArg() : searchArg;

    if (self.isGlobalSearch()) {
        self.applyGlobalSearch(searchTerm, true);
    } else {
        var layerId = self.selectedZone().key;
        var layer = self.getLayer(layerId);
        layer.hasExplicitSearchQuery = true;
        self.applyLayerSearch(searchTerm, layer, true);
    }

    self.calculateAppliedSearches();
};


MapSearchBarVM.prototype.mapSearchSetup = function(){
    var self = this;

    self.mapSearch = new esri.dijit.Search({
        map: self.map
    }, '');
    self.mapSearch.startup();
    var mapSearch = {};
    mapSearch.autocompleteSource = function (request, response) {
        self.searchBar().isLoading(true);
        self.mapSearch.suggest(request.term);
        self.mapSearch.on('suggest-results', function(data){
            if(data.results[0])
                response(data.results[0].map(function(r){r.label = r.text; return r;}));
            
            self.searchBar().isLoading(false);
        });
    };
    mapSearch.autocompleteSelect = function (event, ui) {
        self.mapSearch.clear();
        self.mapSearch.set('value',ui.item.text);
        self.mapSearch.set('magicKey',ui.item.magicKey);
        self.mapSearch.search();
    };

    mapSearch.apply = function(term){
        self.mapSearch.clear();
        self.mapSearch.search(term);
    }
    return mapSearch;
};

/**
 * Submit the search term for the associated layer or global search.
 * @param {object} searchArg - Either a function or String value denoting the actual search text term.
 */
MapSearchBarVM.prototype.clearSearch = function (breadcrumb, searchArg) {
    var self = this;
    var newSearchArg = "";

    if (typeof searchArg === "function") {
        searchArg(newSearchArg);
    }

    self.clearAppliedSearch(self.selectedOption());
};

MapSearchBarVM.prototype.clearAppliedSearches = function () {
    var self = this;
    //Remove all searches.
    while (self.appliedSearches().length > 0) {
        var search = self.appliedSearches()[0];
        self.clearAppliedSearch(search);
    }
};

MapSearchBarVM.prototype.clearAppliedSearch = function (breadcrumb) {
    var self = this;
    var layerId = breadcrumb.id;
    var layer = self.getLayer(layerId);

    if (layer) {
        layer.hasExplicitSearchQuery = false;
        //revert back to global search.
        var newSearchArg = self.search.getQueryValue(self.queryKey);
        self.applyLayerSearch(newSearchArg, layer, false);
    } else {
        self.applyGlobalSearch("", false);
    }

    if (self.selectedOption() && layerId === self.selectedOption().id) {
        self.newSearchText(newSearchArg || "");
    }

    self.calculateAppliedSearches();
};

/**
 * Apply a search term to all layers.
 * @param {string} searchTerm - The piece of text to search for. Warning, each layer may handle this differently.
 * @param {boolean} alterVisibility - Whether or not changing the search term will automatically turn on the layers.
 */
MapSearchBarVM.prototype.applyGlobalSearch = function (searchTerm, alterVisibility) {
    var self = this;
    var search = self.search;

    search.setQueryValue(self.queryKey, searchTerm);

    search.updateHash();

    for (var i = 0; i < self.searchableLayers().length; i++) {
        var layer = self.searchableLayers()[i];

        if (layer.hasExplicitSearchQuery) {
            continue;
        }

        self.applyLayerSearch(searchTerm, layer, alterVisibility);
    }

    self.onGlobalSearchApplied();
};

/**
 * Apply a search term to one layer.
 * @param {string} searchTerm - The piece of text to search for. Warning, each layer may handle this differently.
 * @param {object} layer - The layer to apply the search to.
 * @param {boolean} alterVisibility - Whether or not changing the search term will automatically turn on the layer.
 */
MapSearchBarVM.prototype.applyLayerSearch = function (searchTerm, layer, alterVisibility) {
    var self = this;
    var search = layer.search;

    search.setQueryValue(self.queryKey, searchTerm);
    search.updateHash();

    if (alterVisibility && !layer.isVisible()) {
        layer.isVisible(true);
    }

    search.submit();

    self.onLayerSearchApplied(layer.id);
};

/**
 * Retrieve a particular layer from the map.
 * @param {string} id - The identification string for the layer.
 * @returns {  } 
 */
MapSearchBarVM.prototype.getLayer = function (id) {
    var self = this;

    var matches = self.searchableLayers().filter(function (p) {
        return p.id === id;
    });

    return matches.length > 0 ? matches[0] : undefined;
};

/**
 * Determines whether or not the selected option within the drop-down is a layer or global search.
 * @returns {boolean} 
 */
MapSearchBarVM.prototype.isGlobalSearch = function () {
    var self = this;
    return self.selectedZone() === self.GLOBAL_SEARCH_OPTION;
};

/**
 * Set the selected option e.g. location or layer search.
 * @param {object} arg - The layer or option to search.
 */
MapSearchBarVM.prototype.setSelectedOption = function (arg) {
    var self = this;
    self.selectedZone(arg);

    var queryTerm = "";
    if (self.isGlobalSearch()) {
        queryTerm = self.search.getQueryValue(self.queryKey);
    } else if (!self.isLocationSearch()) {
        var layerId = self.selectedZone().id;
        var layer = self.getLayer(layerId);
        var search = layer.search;
        queryTerm = search.getQueryValue(self.queryKey);
    }

    self.newSearchText(queryTerm || "");
};

MapSearchBarVM.prototype.calculateAppliedSearches = function () {
    var self = this;
    var result = [];

    var globalSearchTerm = self.search.getQueryValue(self.queryKey);

    if (globalSearchTerm && globalSearchTerm.length > 0) {
        result.push({ id: self.GLOBAL_SEARCH_OPTION.id, title: "All Layers", value: self.search.getQueryValue(self.queryKey) });
    }

    for (var i = 0; i < self.searchableLayers().length; i++) {
        var layer = self.searchableLayers()[i];
        var layerSearchTerm = layer.search.getQueryValue(self.queryKey);


        if (layerSearchTerm && layerSearchTerm.length > 0 && layerSearchTerm !== globalSearchTerm) {
            result.push({ id: layer.id, title: layer.title(), value: layerSearchTerm });
        }
    }

    self.appliedSearches(result);
};
window.searchBarVM = false;