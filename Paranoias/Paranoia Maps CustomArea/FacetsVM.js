/**
 * The view model controlling the facets panel on the search page.
 * @param {Search} search - The search object used for performing update requests.
 */
var FacetsVM = function(search, options) {
  var self = this;

  self.search = search;

  self.options = $.extend(
    {
      facetQueryKey: self.search.queryProperty.facet,
      redirect: false,
      onlyRenderAndAutoOpen: "",
      disableLabelClick: false,
      categoryUrlKey: undefined,
      enableFacetPanel: true
    },
    options
  );

  self.isPanelHeadersVisible = ko.observable(true);

  self.hiddenFacetGroups = [];

  self.facetPanels = ko.observableArray([]);

  self.breadcrumbs = ko.observableArray([]);

  self.selectedItems = ko.observableArray();
  self.removedItems = ko.observableArray();

  self.openedTrees = [];

  /* Trees which has been manually closed by the user. */
  self.closedTrees = [];

  self.disableFilterButtons = ko.computed(function() {
    return (
      self.selectedItems().length === 0 && self.removedItems().length === 0
    );
  }, this);

  self.search.registerFinishedCallback(
    function(result) {
      if (result.MetaData && self.options.enableFacetPanel) {
        self.processFacets(
          result.MetaData.AvailableFacets,
          result.MetaData.HiddenFacets,
          self.options.onlyRenderAndAutoOpen
        );
        self.populateBreadcrumbs(result.MetaData.AppliedFacets);
      }
    },
    [
      self.search.updateRequestSender.pagination,
      self.search.updateRequestSender.sort
    ]
  );

  // Flag each facet where it is the first of its indexer, useful for facetExplorer
  self.markUniqueFacets = function() {
    var keys = [];
    _.each(
      self.facetPanels(),
      function(fp) {
        _.each(
          fp.facets(),
          function(f) {
            if (keys.indexOf(f.facetKey) > -1) {
              f.firstInstanceOfKey(false);
            } else {
              keys.push(f.facetKey);
              f.firstInstanceOfKey(true);
            }
          },
          keys
        );
      },
      keys
    );
  };
};

/**
 * Registers the selected (checked) facets in order to perform the search
 * @param {} item - the checked (or unchecked) facet
 */
FacetsVM.prototype.registerSelected = function(item) {
  var self = this;

  if (item.isActive()) {
    if (!item.isSelected()) {
      self.removedItems.push(item);
    } else {
      self.removedItems.remove(item);
    }
  } else {
    if (item.isSelected()) {
      self.selectedItems.push(item);
    } else {
      self.selectedItems.remove(item);
    }
  }
};
/*
* Remove and breadcrumbs marked as pendingRemoval, called before apply facets etc
* Allows us to not have to add more constraints then wait a whole search before removing others.
* Notice we do not send this to the server, it is expected the calling function will do this.
*/
FacetsVM.prototype.RemovePendingBreadcrumbs = function(facets) {
  var self = this;
  _.each(self.breadcrumbs(), function(crumb) {
    if (crumb.pendingRemoval()) {
      console.log("remove pending => ", crumb.indexer, crumb.value);
      var exclude = "";
      if (crumb.excluded) {
        exclude = "!!";
      }
      self.removeFacet(crumb.indexer + exclude, crumb.value, facets, true);
    }
  });
};

/*
* Adds the selected facets and removes un-ticked ones and applies them to the search parameters
*/
FacetsVM.prototype.applyFacets = function() {
  var self = this;

    var facets = self.getFacetsFromSearch();
  self.RemovePendingBreadcrumbs(facets);

  var search = null;

  for (var i = 0; i < self.removedItems().length; i++) {
    var removedItem = self.removedItems()[i];
    self.removeFacet(removedItem.indexer, removedItem.value, facets, true);
  }

  for (var i = 0; i < self.selectedItems().length; i++) {
    var f = self.selectedItems()[i];
    var overridden =
      f.facetType === self.facetType.numberRange ||
      f.facetType === self.facetType.dateRange ||
      f.facetType === self.facetType.rangeSlider ||
      f.facetType === self.facetType.date; //range facets

    var exclude = "";
    if (f.parentPanel != null && f.parentPanel.isExcluding() == true) {
      exclude = "!!";
    }

    switch (f.queryKey) {
      case "q":
        search = search || self.getSearchFromSearch() || {};
        self.addQuery(
          f.dynamicIndex + exclude,
          f.value,
          overridden,
          search,
          true,
          operator
        );
        break;
      case self.options.facetQueryKey:
      default:
            self.applyFacet(f.indexer + exclude, f.value, overridden, facets, true, operator);
        break;
    }

    if (f.onApplyFilter && typeof f.onApplyFilter == "function") {
      (function(f) {
        window.setTimeout(function() {
          f.onApplyFilter();
        });
      })(f);
    }
  }

  self.submitFacets(facets, search);

  self.selectedItems.removeAll();
  self.removedItems.removeAll();
};

/**
 * Convert a collection of server facet into a new panel view model.
 * @param {array} facets - A collection of server facets as JSON.
 * @param {array} hiddenFacetGroups - Facets that are to be hidden on the GUI, but could still be used for other parts of the page.
 */
FacetsVM.prototype.processFacets = function(facets, hiddenFacetGroups) {
  var self = this;
  facets = facets || [];
  self.hiddenFacetGroups = hiddenFacetGroups || [];

  self.facetPanels([]);

  var facetGroupVMs = [];

  //FACET GROUPS
  for (var i = 0; i < facets.length; i++) {
    var facetGroup = facets[i];

    var facetPanels = facetGroup.Panels;
    var facetPanelVMs = [];

    //FACET PANELS
    for (var j = 0; j < facetPanels.length; j++) {
      var facetPanel = facetPanels[j];

      var shouldRender = !self.isHiddenFacetGroup(facetPanel.FacetKey);

      //MAGICAL ENERGY STUFF - WHY IS THERE A SPECIAL CASE?!?!?!?!
      if (
        self.options.onlyRenderAndAutoOpen != undefined &&
        self.options.onlyRenderAndAutoOpen !== ""
      ) {
        shouldRender = false;
        if (
          self.options.onlyRenderAndAutoOpen
            .toLowerCase()
            .indexOf(facetPanel.FacetKey.toLowerCase()) > -1
        ) {
          shouldRender = true;
          facetPanel.AutoOpen = true;
        }
      }

      if (shouldRender) {
        var vm = new FacetPanelVM(facetPanel, self.search, self);
        facetPanelVMs.push(vm);
      }
    }

    var facetGroupVM = new FacetPanelGroupVM(facetGroup, facetPanelVMs);
    facetGroupVMs.push(facetGroupVM);
  }

  self.facetPanels(facetGroupVMs);

  if (typeof SetupHelpClick === "function") {
    SetupHelpClick($(".facetsContainer"));
  }

  self.markUniqueFacets();
  $(document).trigger("FacetsProcessed");
};

/**
 * Inserts facet into list before existing facet.
 */
FacetsVM.prototype.insertFacet = function(facet, before) {
  var self = this;
  for (
    var panelgroupCount = 0;
    panelgroupCount < self.facetPanels().length;
    panelgroupCount++
  ) {
    var index = self.facetPanels()[panelgroupCount].facets.indexOf(before);
    if (index < 0) {
      continue;
    }

    self.facetPanels()[panelgroupCount].facets.splice(index, 0, facet);
  }
};
/**
 * Inserts facet into list before existing facet.
 */
FacetsVM.prototype.removeFacetPanel = function(facet) {
  var self = this;
  for (
    var panelgroupCount = 0;
    panelgroupCount < self.facetPanels().length;
    panelgroupCount++
  ) {
    var index = self.facetPanels()[panelgroupCount].facets.indexOf(facet);
    if (index < 0) {
      continue;
    }

    self.facetPanels()[panelgroupCount].facets.splice(index, 1);
  }
};

/**
 * Toggles the visibility of a facet panel. Or if param *visible is specified does that.
 */
FacetsVM.prototype.toggleFacetPanelVisibility = function(key, visible) {
  var self = this;
  for (
    var panelgroupCount = 0;
    panelgroupCount < self.facetPanels().length;
    panelgroupCount++
  ) {
    for (
      var facetNum = 0;
      facetNum < self.facetPanels()[panelgroupCount].facets().length;
      facetNum++
    ) {
      var a = self.facetPanels()[panelgroupCount].facets()[facetNum];
      if (a.facetKey == key) {
        if (visible == undefined) {
          a.isVisible(!a.isVisible());
        } else {
          a.isVisible(visible);
        }
      }
    }
  }
};

/**
 * Retrieve the values stored against the facet. Ignores any operators e.g. OR, AND, NOT etc.
 * @param {string} indexer - The indexer for the facets.
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @returns {boolean} - The facet's values if it exists. Returns an empty array if not.
 */
FacetsVM.prototype.getFacetValues = function(indexer, facets) {
  var self = this;
  var result = [];
  facets = facets || self.getFacetsFromSearch();

  if (facets.hasOwnProperty(indexer)) {
    result = facets[indexer].values;
  }

  return result;
};

/**
 * Generate the breadcrumb menu using a list of active facets.
 */
FacetsVM.prototype.populateBreadcrumbs = function(facets) {
  var self = this;
  var breadcrumbs = [];
  facets = facets || [];

  var searches = {};
  if (self.hasSearchBar()) {
    searches = self.getSearchFromSearch();
    if (searches.hasOwnProperty("")) searches["FullText"] = searches[""];
  }
  for (var i = 0; i < facets.length; i++) {
    if (
      searches.hasOwnProperty(facets[i].Key) &&
      !!~searches[facets[i].Key].values.indexOf(
        self.decodeValue(facets[i].Value)
      )
    ) {
      continue;
    }

    if (self.isHiddenFacetGroup(facets[i].Key)) {
      continue;
    }

    var vm = new BreadcrumbVM(facets[i], self);
    breadcrumbs.push(vm);
  }

  self.breadcrumbs(breadcrumbs);
};

/**
 * An enumeration for the search operators used in the search query.
 */
FacetsVM.prototype.operator = {
  or: "||",
  range: "::"//"%3a%3a"
};

/**
 * An enumeration for the type of facet that could be displayed. Used to select which template to render for it.
 */
FacetsVM.prototype.facetType = {
  taxonomyTree: 0,
  numberRange: 1,
  dateRange: 2,
  facetTree: 3,
  facetLeaf: 4,
  checkbox: 5,
  typeAhead: 6,
  rangeSlider: 7,
  dropdown: 8,
  textbox: 9,
  date: 10
};

/**
 * Retrieve the facets from the query string as an object.
 * @returns {object}
 */
FacetsVM.prototype.getFacetsFromSearch = function() {
  var self = this;
  var facetsString = self.search.getQueryValue(self.options.facetQueryKey);
  var result = self.decodeFacets(facetsString);
  return result;
};

/**
 * Retrieve the facets from the query string as an object.
 * @returns {object}
 */
FacetsVM.prototype.getSearchFromSearch = function() {
  var self = this;
  var facetsString = self.search.getQueryValue(
    self.search.queryProperty.search
  );
  var result = self.decodeFacets(facetsString, true);
  return result;
};

/**
 * Retrieve the facets as a query string..
 * @param {object} facets - Facets to parse, otherwise it will use the search facets.
 * @returns {string} - Facets as a query string.
 */
FacetsVM.prototype.getFacetString = function(facets) {
  var self = this;

  facets = facets || self.getFacetsFromSearch();

  var result = self.encodeFacets(facets);
  return result;
};

/**
 * Called when a facet is clicked. Will apply the facet to the search and refresh. Will result in the search results being updated.
 * @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to apply for the given indexer.
 * @param {bool} overridden - Indicates whether the value should be added or overridden
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @param {boolean} stopSearch - [Optional] Will postpone the search from updating. Defaults to false.
 * @param {string} operator - [Optional] Will define the operator. Defaults to "<and>".
 */
FacetsVM.prototype.applyFacet = function(
  indexer,
  value,
  overridden,
  facets,
  stopSearch,
  operator
) {
  var self = this;

  Analytics.event("Facets", "Add", indexer + " = " + self.decodeValue(value));

  facets = facets || self.getFacetsFromSearch();

  self.RemovePendingBreadcrumbs(facets);

  for (var i = 0; i < self.removedItems().length; i++) {
    var removedItem = self.removedItems()[i];
    self.removeFacet(removedItem.indexer, removedItem.value, facets, true);
  }

    self.addFacetQuery(indexer, value, overridden, facets, undefined, operator);

  self.removedItems.removeAll();
  self.submitFacets(facets, null, stopSearch);
};

/**
 * Apply a facet model from another facet vm.
 * @param {facetObject} facetObject - The facet object to add. This is an internal facet object used by facets vm.
 * @param {boolean} stopSearch - [Optional] Will postpone the search from updating. Defaults to false.
 */
FacetsVM.prototype.applyFacetObject = function(facetObject, stopSearch) {
  var self = this;

  var facets = self.getFacetsFromSearch();

  for (var f in facetObject) {
    facets[f] = facetObject[f];
  }

  self.submitFacets(facets, null, stopSearch);
};

/**
 * Called when a full text search facet is clicked. Will apply the search query to the search and refresh. Will result in the search results being updated.
 * @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to apply for the given indexer.
 * @param {bool} overridden - Indicates whether the value should be added or overridden
 * @param {object} search - [Optional] The collection of active search facets. If left blank then it will be calculated.
 * @param {boolean} stopSubmit - [Optional] Will postpone the search from updating. Defaults to false.
 */
FacetsVM.prototype.addQuery = function(
  indexer,
  value,
  overridden,
  search,
  stopSubmit
) {
  var self = this;
  search = search || self.getSearchFromSearch();
  if (indexer === "undefined") {
    indexer = "";
  }

  self.addFacetQuery(indexer, value, overridden, search, true, "undefined");

  if (stopSubmit !== true) {
    self.submitFacets(null, search);
  }
};

/**
 * Applies the search or facet indexer and value to the current facet object.
 * @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to apply for the given indexer.
 * @param {bool} overridden - Indicates whether the value should be added or overridden
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @param {bool} isSearch - Indicates whether the value is a query search, as opposed to traditional facet.
 * @param {string} operator - [Optional] Will define the operator. Defaults to "<and>".
 */
FacetsVM.prototype.addFacetQuery = function(
  indexer,
  value,
  overridden,
  facets,
  isSearch,
  operator
) {
  var self = this;

  facets = facets || self.getFacetsFromSearch();

  if (facets.hasOwnProperty(indexer)) {
    var facetValues = facets[indexer].values;
    facetValues = facetValues.map(function(p) {
      return self.decodeValue(p).toLowerCase();
    });

    if (facetValues.indexOf(self.decodeValue(value).toLowerCase()) === -1) {
      if (overridden) {
        if (value === "" || value === undefined || value === null) {
          delete facets[indexer];
        } else {
          facets[indexer].values = [value];
        }
      } else {
        facets[indexer].values.push(value);
      }
    }
  } else {
      var oper = (typeof operator == "undefined")? "<and>": operator;
      facets[indexer] = { operator: oper, values: [value] };
    if (isSearch) facets[indexer].isSearch = true;
  }
};

/**
 * Check to see whether a facet has been defined and whether it has a value.
 * @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to apply for the given indexer.
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @returns {boolean} - Whether or not the facet exists.
 */
FacetsVM.prototype.hasFacet = function(indexer, value, facets) {
  var self = this;
  var result = false;
  facets = facets || self.getFacetsFromSearch();

  if (facets.hasOwnProperty(indexer)) {
    var facetValues = facets[indexer].values;

    if (value !== undefined) {
      for (var i = 0; i < facetValues.length; i++) {
        result = self.decodeValue(facetValues[i]) === self.decodeValue(value);
        if (result) break;
      }
    } else {
      result = facetValues.length > 0;
    }
  }

  return result;
};

/**
* Called when a facet is chosen to be removed. Will remove the facet from the search and refresh. Will result in the search results being updated.
* @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to remove for the given indexer.
* @param {object} FacetsVM.prototype.removeQuery = function (indexer, value, search, stopSubmit) {
 - [Optional] The collection of active facets. If left blank then it will be calculated.
* @param {boolean} stopSubmit - [Optional] Will postpone the search from updating. Defaults to false.
*/
FacetsVM.prototype.removeQuery = function(indexer, value, search, stopSubmit) {
  var self = this;
  search = search || self.getSearchFromSearch();

  if (indexer === "undefined") {
    indexer = "";
  }

  if (!self.removeFacetQuery(indexer, value, search) && !indexer) {
    self.removeFacetQuery("FullText", value, search);
  }

  if (stopSubmit !== true) {
    self.submitFacets(null, search);
  }
};

/**
 * Remove a specific indexer and all of its values from the search.
 * @param {string} indexer - The indexer for the facets.
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @param {boolean} stopSubmit - [Optional] Will postpone the search from updating. Defaults to false.
 */
FacetsVM.prototype.removeIndexer = function(indexer, facets, stopSubmit) {
  var self = this;

  facets = facets || self.getFacetsFromSearch();
  var change = false;
  if (facets.hasOwnProperty(indexer)) {
    delete facets[indexer];
    change = true;
  }

  if (facets.hasOwnProperty(indexer.replace("!!", ""))) {
    delete facets[indexer.replace("!!", "")];
    change = true;
  }

  if (facets.hasOwnProperty(indexer + "!!")) {
    delete facets[indexer + "!!"];
    change = true;
  }
  if(change){
    self.submitFacets(facets, null, stopSubmit);
  }
};

/**
 * Called when a facet is chosen to be removed. Will remove the facet from the search and refresh. Will result in the search results being updated.
 * @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to remove for the given indexer.
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @param {boolean} stopSubmit - [Optional] Will postpone the search from updating. Defaults to false.
 */
FacetsVM.prototype.removeFacet = function(indexer, value, facets, stopSubmit) {
  var self = this;

  facets = facets || self.getFacetsFromSearch();

  if (!self.removeFacetQuery(indexer, value, facets)) {
    self.removeQuery(indexer, value, null, stopSubmit);
  }

  self.submitFacets(facets, null, stopSubmit);
};

/**
 * Removes search of facet from current facet object.
 * @param {string} indexer - The indexer for the facets.
 * @param {string} value - The value to remove for the given indexer.
 * @param {object} facets - [Optional] The collection of active facets. If left blank then it will be calculated.
 * @returns {bool} A value indicating whether the item has been removed.
 */
FacetsVM.prototype.removeFacetQuery = function(indexer, value, facets) {
  var self = this;

  facets = facets || self.getFacetsFromSearch();

  if (!facets.hasOwnProperty(indexer)) {
    return false;
  }

  var facetValues = facets[indexer].values || [];
  var valueIndex = -1;

  for (var i = 0; i < facetValues.length; i++) {
    var facetValue = facetValues[i];
    var newValue = value;
    if (typeof facetValue === "string" && typeof value === "string") {
      facetValue = self.decodeValue(facetValue).toLowerCase();
      newValue = self.decodeValue(newValue).toLowerCase();
    }

    if (facetValue === newValue) {
      valueIndex = i;
      break;
    }
  }

  if (valueIndex > -1) {
    facetValues.splice(valueIndex, 1);
  }

  if (
    facetValues.length === 0 ||
    value === "" ||
    value === undefined ||
    value === null
  ) {
    delete facets[indexer];
  }

  return true;
};

/**
 * Replaces url encoded values with the "real life" characters.
 * @param {string} value - The value to decode.
 * @returns {string} - A decoded string value.
 */
FacetsVM.prototype.decodeValue = function(value) {
  if (value !== undefined && value !== null && typeof value == "string") {
    value = value.replace(/\+/g, "%20"); //decodeURI component won't decode +
    value = decodeURIComponent(value);
  }

  return value;
};

/**
 * Removes all of the applied facets from the search and refresh. Will result in the search results being updated.
 */
FacetsVM.prototype.clearAppliedFacets = function(stopSearch) {
  var self = this;

  var search = null;
  if (!self.hasSearchBar()) {
    search = {};
  }

  var facets = {};

  var appliedFacets = self.getFacetsFromSearch();

  var facetsToApply = {};

  for (var key in appliedFacets) {
    if (self.isHiddenFacetGroup(key)) {
      facetsToApply[key] = appliedFacets[key];
    }
  }

  // Note the last argument, sometimes other arguments are passed in via knockout etc.
  // Need to check it really is a message to block/ stop search going back to server yet.
  self.submitFacets(facetsToApply, search, stopSearch === true);
};

/*
* Sends of the facets to the server in order to get the results
* @param {object} facets - The object containing all of the facet names and values.
* @param {object} search - The object containing all of the search names and values.
* @param {boolean} stopSearch - Whether or not to perform the search.
*/
FacetsVM.prototype.submitFacets = function(facets, search, stopSearch) {
  var self = this;

  if (facets) {
    var facetString = self.encodeFacets(facets);
    self.search.setQueryValue(self.options.facetQueryKey, facetString);
  }

  if (search) {
    var newQuery = self.encodeFacets(search);
    self.search.setQueryValue(self.search.queryProperty.search, newQuery);
  }

  self.search.setQueryValue(self.search.queryProperty.page, 1);

  if (stopSearch) {
    return;
  }

  if (self.options.redirect) {
    var queryString = self.search.calculateQueryString();

    if (queryString.startsWith("&")) {
      queryString = queryString.substring(1);
    }

    var url = "search?".concat(queryString);

    if (self.search.urlPrefix != undefined) {
      url = self.search.urlPrefix + url;
    }

    window.location.href = url;
  } else {
    self.search.updateResults(self.search.updateRequestSender.facetPanel);
  }
};

/**
 * Turn the facet object into a string to be used within the query string.
 * @param {object} facetObject - The object containing all of the facet names and values.
 * @returns {string}
 */
FacetsVM.prototype.encodeFacets = function(facetObject) {
  var self = this;
  var result = "";

  var i = 0;

  var encodeFacet = function(facetKey, valueNo) {
    //If it is the first facet, assume it is an AND and ignore it.
    var operator = i === 0 ? "" : facetObject[facetKey].operator;
    var facetValues = facetObject[facetKey].values;
    var format = facetKey ? "{0}{3}{1}({2}){4}" : "{0}{3}{2}{4}";
    if (typeof valueNo !== "undefined") {
      if (facetValues.length > valueNo) {
        facetValues = [facetValues[valueNo]];
      } else {
        facetValues = [];
      }
    }
    if (!facetValues.length) {
      return "";
    }
    if (
      facetObject[facetKey].isSearch &&
      facetValues.length > 1 &&
      typeof valueNo == "undefined"
    ) {
      var result = "";
      for (var j = 0; j < facetValues.length; j++) {
        result += encodeFacet(facetKey, j);
        i++;
      }
      return result;
    }

    return String.format(
      format,
      operator,
      facetKey,
      facetValues.join(self.operator.or),
      facetObject[facetKey].isSearch ? "[" : "",
      facetObject[facetKey].isSearch ? "]" : ""
    );
  };

  for (var facetKey in facetObject) {
    if (facetObject.hasOwnProperty(facetKey)) {
      result += encodeFacet(facetKey);
    }
    i++;
  }

  return result;
};

/**
 * When a facet tree is opened, mark it as so.
 * @param {string} indexer - The facet indexer.
 * @param {object} value  - The value of the facet.
 */
FacetsVM.prototype.markAsOpened = function(indexer, value) {
  var self = this;

  var key = indexer + "~" + value;

  if (self.openedTrees.indexOf(key) === -1) {
    self.openedTrees.push(key);
  }

  var openedTreeIndex = self.closedTrees.indexOf(key);
  if (openedTreeIndex > -1) {
    self.closedTrees.splice(openedTreeIndex, 1);
  }
};

/**
 * When a facet tree is closed, mark it as so.
 * @param {string} indexer - The facet indexer.
 * @param {object} value  - The value of the facet.
 */
FacetsVM.prototype.markAsClosed = function(indexer, value) {
  var self = this;

  var key = indexer + "~" + value;

  if (self.closedTrees.indexOf(key) === -1) {
    self.closedTrees.push(key);
  }

  var openedTreeIndex = self.openedTrees.indexOf(key);
  if (openedTreeIndex > -1) {
    self.openedTrees.splice(openedTreeIndex, 1);
  }
};

/**
 * Determines whether the facet tree was open or not.
 * @param {string} indexer - The facet indexer.
 * @param {object} value  - The value of the facet.
 * @returns {boolean}
 */
FacetsVM.prototype.checkIfOpened = function(indexer, value) {
  var self = this;

  var key = indexer + "~" + value;
  var openedTreeIndex = self.openedTrees.indexOf(key);
  return openedTreeIndex > -1;
};

/**
 * Determines whether the facet tree was manually closed or not.
 * @param {string} indexer - The facet indexer.
 * @param {object} value  - The value of the facet.
 * @returns {boolean}
 */
FacetsVM.prototype.checkIfClosed = function(indexer, value) {
  var self = this;

  var key = indexer + "~" + value;
  var closedTrees = self.closedTrees.indexOf(key);
  return closedTrees > -1;
};

/**
 * Turn the facets property of the query string into an object.
 * @param {string} facetString - The part of the query string containing the facets details.
 * @param {bool} isSearch - A value indicating whether the facest are part of the search query.
 * @returns {object}
 */
FacetsVM.prototype.decodeFacets = function(facetString, isSearch) {
  var self = this;
  var result = {};

  if (facetString === undefined || facetString === null) {
    return result;
  }
  facetString = decodeURI(facetString);
  var facets = facetString.split(/(<and>|<or>)/g);

  for (var i = 0; i < facets.length; i += 2) {
    var facet = facets[i];

    if (facet === "") {
      continue;
    }

    var operator = "<and>";
    if (i > 0) {
      operator = facets[i - 1];
    }
    var isSearchRgx = /^\[(.+)\]$/.exec(facet);
    if (!!isSearchRgx) {
      facet = isSearchRgx[1];
      isSearch = true;
    }

    var facetKey = facet.substr(0, facet.indexOf("("));

    if (isSearch && !facetKey) {
      facetKey = "FullText";
    }

    //Get the facet values out. e.g. facetKey(facetValues)
    var regexString = /\((.*)\)/g;
    var regexMatch = regexString.exec(facet);
    var facetValues = [];

    if (regexMatch && regexMatch.length > 1) {
      //Get the first GROUP, not the match.
      facetValues = regexMatch[1].split(self.operator.or);
    } else if (isSearch) {
      facetValues = facet.split(self.operator.or);
    }

    if (result.hasOwnProperty(facetKey)) {
      result[facetKey].values = result[facetKey].values.concat(
        facetValues || []
      );
    } else {
      result[facetKey] = { operator: operator, values: facetValues || [] };
    }

    if (isSearch) {
      result[facetKey].isSearch = true;
    }
  }

  return result;
};

/**
 * Remove selected ids from the current search
 */
FacetsVM.prototype.removeSelectIds = function(ixrKey, facetVm) {
  var facets = facetVm.getFacetsFromSearch();
  var num = this.selectedRecords().length;
  for (var i = 0; i < num; i++) {
    var facetValue = this.selectedRecords()[i];
    facetVm.applyFacet(
      ixrKey + "!!",
      this.selectedRecords()[i],
      false,
      facets,
      num > i + 1
    );
  }
};
/**
 * Add selected ids from the current search
 */
FacetsVM.prototype.addSelectIds = function(ixrKey, facetVm) {
  var facets = facetVm.getFacetsFromSearch();
  var num = this.selectedRecords().length;
  for (var i = 0; i < num; i++) {
    var facetValue = this.selectedRecords()[i];
    facetVm.applyFacet(
      ixrKey,
      this.selectedRecords()[i],
      false,
      facets,
      num > i + 1
    );
  }
};

/** Gets the Facet view model for a given type. */
FacetsVM.prototype.childVM = function(facetType) {
  switch (facetType) {
    case FacetsVM.prototype.facetType.taxonomyTree:
      return FacetTreeVM;
    case FacetsVM.prototype.facetType.numberRange:
      return FacetNumberRangeVM;
    case FacetsVM.prototype.facetType.dateRange:
      return FacetDateRangeVM;
    case FacetsVM.prototype.facetType.facetTree:
      return FacetTreeVM;
    case FacetsVM.prototype.facetType.facetLeaf:
      return FacetLeafVM;
    case FacetsVM.prototype.facetType.checkbox:
      return FacetCheckboxVM;
    case FacetsVM.prototype.facetType.typeAhead:
      return FacetTypeAheadVM;
    case FacetsVM.prototype.facetType.rangeSlider:
      return FacetRangeSliderVM;
    case FacetsVM.prototype.facetType.dropdown:
      return FacetDropdownVM;
    case FacetsVM.prototype.facetType.textbox:
      return FacetTextboxVM;
    case FacetsVM.prototype.facetType.date:
      return FacetDateVM;
    default:
      break;
  }
};

/* Checks if the page has a visible searchbar */
FacetsVM.prototype.hasSearchBar = function() {
  var vm = window.vm || (window.Dashboard && window.Dashboard.dashboardVM);
  if (!vm) {
    return false;
  }
  return vm.searchBarVM && vm.searchBarVM.isVisible();
};

/**
 * Determine whether a facet group should be excluded from the GUI. Will also exclude the facet group from the clear all operation.
 * @param {string} facetGroupKey - The facet
 * @returns {boolean} - Whether or not the facet should be hidden from the GUI.
 */
FacetsVM.prototype.isHiddenFacetGroup = function(facetGroupKey) {
  var self = this;

  var shouldBeHidden =
    self.hiddenFacetGroups.filter(function(p) {
      return p.toLowerCase() === facetGroupKey.toLowerCase();
    }).length > 0;

  return shouldBeHidden;
};

/**
 * Load the modal facets template.
 * @returns null;
 */
FacetsVM.prototype.showFacetsModal = function() {
  showPopup(
    "All filters",
    "<div data-bind=\"template: 'template-facet-popup-all-filters'\"></div>",
    window.vm,
    function(modalBody) {},
    function(modalBody) {
      modalBody = $(modalBody);
      var height = modalBody.height();
      modalBody.find(".facet-modal > .grid").css({ height: height - 50 });
      modalBody.find(".facetList,.category-list").css({ height: height - 100 });
      modalBody.find(".selectedList").css({ height: height - 80 });
    }
  );
};
