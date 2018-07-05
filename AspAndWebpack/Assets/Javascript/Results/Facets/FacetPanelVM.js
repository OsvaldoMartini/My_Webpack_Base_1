/**
 * A view model to represent a facet panel. e.g. the highest level of a Taxonomy tree.
 * @param {object} model - The model used to populate the facet panel.
 * @param {Search} search - The search object used for performing update requests.
 * @param {FacetsVM} facetsVM - The view model containing the functionality for all facets.
 */
var FacetPanelVM = function(model, search, facetsVM) {
  var self = this;
  var activeFilter = "";

  self.isVisible = ko.observable(!model.Hidden);
  self.isBackToAllEnabled = ko.observable(false);

  self.search = search;
  self.autoOpen = model.AutoOpen;
  self.displayText = model.Name;
  self.dataType = model.DataType;

  // if the panel is marked as out of date, it will try to update itself when it is next expanded.
  self.isOutOfDate = false;

  self.helpAppName = model.HelpAppName;
  self.helpGroupId = model.HelpGroupId;
  self.helpItemId = model.HelpItemId;
  if (
    !self.helpItemId &&
    window.helpLinks &&
    window.helpLinks[self.helpGroupId] &&
    window.helpLinks[self.helpGroupId][model.FacetKey]
  ) {
    self.helpItemId = model.FacetKey;
  }
  self.hasHelp = ko.computed(function() {
    return (
      self.helpAppName != null &&
      self.helpGroupId != null &&
      self.helpItemId != null
    );
  });
  self.showHelp = function(data, e) {
    HookUpClick($(e.delegateTarget));
  };

  self.facetKey = model.FacetKey;
  self.isExpanded = ko.observable(false);
  self.children = ko.observableArray([]);
  self.facetsVM = facetsVM;
  self.filterText = ko.observable("");
  self.errorOccured = ko.observable(false);
  self.filterTextPlaceHolder = "Search within " + self.displayText + " filter";
  self.showAll = model.ShowAll;
  self.countDescendants = ko.computed(function() {
    var children = self.children();
    var result = 1;

    self.loopChildren(function(p) {
      result += p.countDescendants();
    });

    return result;
  });

  /**
   * Is the search filter box allowed for this panel?
   */
  self.isFilterBoxEnabled = ko.computed(function() {
    if (model.ShowFilterBox && self.isExpanded()) return true;
    var descendants = self.countDescendants();

    return descendants > 15 && self.isExpanded();
  });

  self.isFilterBoxOpen = ko.observable(false);
  self.filterBoxFocus = ko.observable(false);

  self.toggleFilterBox = function() {
    //If a search box is allowed for this panel...
    if (
      self.isFilterBoxEnabled() &&
      self.children().length > 0 &&
      self.isExpanded()
    ) {
      var isEnabled = self.isFilterBoxOpen();
      self.isFilterBoxOpen(!isEnabled);
    } else {
      self.isFilterBoxOpen(false);
    }

    if (!self.isFilterBoxOpen()) {
      self.filterText("");
    } else {
      self.filterBoxFocus(true);
    }
  };

  self.showExclude = ko.computed(function() {
    return (
      (model.ShowExcludeOption || false) &&
      self.children().length > 0 &&
      self.isExpanded()
    );
  });

  self.isMouseOver = ko.observable(false);

  self.isExcluding = ko.observable(false);

  self.isLoading = ko.observable(false);
  self.isCustomSegment = !!model.isCustomSegment;

  self.isViewMoreOpen = ko.observable(false);
  self.numViewableItems = 15;
  self.isViewMoreEnabled = ko.observable(false);

  self.filteredChildren = ko.computed(function() {
    var result = [];
    var filterText = self.filterText();

    filterText =
      filterText === undefined || filterText === null || filterText.length === 0
        ? ""
        : filterText.toLowerCase();

    var filterChanged = activeFilter !== filterText;

    activeFilter = filterText;

    self.loopChildren(function(p) {
      if (p.applyFilter(filterText, filterChanged)) {
        result.push(p);
      }
    });

    self.isViewMoreEnabled(result.length > self.numViewableItems);

    //If the view more is not open and the number of results exceeds the limit, just stop.
    if (
      !self.isViewMoreOpen() &&
      self.isViewMoreEnabled() &&
      result.length >= self.numViewableItems
    ) {
      result = result.slice(0, self.numViewableItems);
    }

    return result;
  });

  if (model.Items.length > 0) {
    self.processChildren(model.Items[0]);
  }

  if (model.IsCustomFilters) {
    self.isVisible(false);
    self.generatedFacets = [];
    self.loadCustomFacets(true);
  }

  self.panelLoadedCallbacks = [];
  self.activeInFacetExplorer = ko.observable(false);
  // when we have multiple facets with the same key, watch which is the first so we can reduce unique lists.
  self.firstInstanceOfKey = ko.observable(false);

  var wasPreviouslyOpened = self.facetsVM.checkIfOpened(self.facetKey, "");
  var wasPreviouslyClosed = self.facetsVM.checkIfClosed(self.facetKey, "");
  if (
    (self.autoOpen && !self.isExpanded() && !wasPreviouslyClosed) ||
    wasPreviouslyOpened
  ) {
    self.expand();
  }
};

/**
 * Toggles the status of the view more link.
 */
FacetPanelVM.prototype.toggleViewMore = function() {
  var self = this;
  var isOpen = self.isViewMoreOpen();
  self.isViewMoreOpen(!isOpen);
};

/**
 * Reloads the contents of the panel
 */
FacetPanelVM.prototype.reload = function() {
  var self = this;

  self.isExcluding(false);

  // if all children are of certain types (e.g. ranges) then we actually don;t need to do anything as there's nothing to reload.
  var doReload = true;

  for (var i = 0; i < self.children().length; i++) {
    var child = self.children()[i];
    if (child.reloadOnSearch) {
      break;
    }

    // if we've got this far then we don't have anything to reload.
    doReload = false;
  }

  if (doReload) {
    self.discoverChildren();
  }
};

/**
 * Expands the facet panel and discovers its children if required.
 */
FacetPanelVM.prototype.expand = function() {
  var self = this;

  var isExpanded = self.isExpanded();

  if ((self.children().length === 0 && !isExpanded) || self.isOutOfDate) {
    self.discoverChildren();
  }

  if (!isExpanded) {
    self.facetsVM.markAsOpened(self.facetKey, "");
  } else {
    self.facetsVM.markAsClosed(self.facetKey, "");
    self.loopChildren(function(p) {
      if (typeof p.collapse !== "undefined") p.collapse();
    });

    self.isLoading(false);
  }

  self.isExpanded(!isExpanded);
  return self;
};

/**
 * Loop through the children.
 * @param {Function} callback - The function to run with each child as an argument.
 */
FacetPanelVM.prototype.loopChildren = function(callback) {
  var self = this;
  var children = self.children();

  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    callback(child);
  }
};

/**
 * Find any children facets for this facet panel and process them.
 */
FacetPanelVM.prototype.discoverChildren = function(includeAll, callback) {
  var self = this;
  var url = "facets/Expand?";

  if (self.wasOpen && self.wasOpen == true) {
    //ignore, been turned off as on another tab at the moment.
    return;
  }

  if (self.facetsVM.options.categoryUrlKey) {
    url = "/" + self.facetsVM.options.categoryUrlKey + "/" + url;
  }

  var queryString = self.facetsVM.search.calculateQueryString();

  self.isLoading(true);

  $.post2(
    url,
    {
      query: queryString,
      facet: self.facetKey,
      value: null,
      dataType: self.dataType,
      includeAllFacets: includeAll || self.showAll || false
    },
    function(children) {
      self.errorOccured(false);
      self.isLoading(false);
      self.isOutOfDate = false;
      self.processChildren(children);

      self.panelLoadedCallbacks.forEach(function(c) {
        c(self);
      });
    }
  ).fail(function() {
    self.errorOccured(true);
  });
};

FacetPanelVM.prototype.processChildren = function(children) {
  var childVMs = [];
  var self = this;
  var childVM;

  self.isBackToAllEnabled(children.IsClearEnabled);

  if (children.Facets) {
    for (var i = 0; i < children.Facets.length; i++) {
      var child = children.Facets[i];

      if (
        children.SingleSelect !== undefined &&
        child.SingleSelect === undefined
      ) {
        child.SingleSelect = children.SingleSelect;
      }

      childVM = self.processChild(child);
      if (childVM) {
        childVMs.push(childVM);
      }
    }
  } else {
    childVM = self.processChild(children);
    if (childVM) {
      childVMs.push(childVM);
    }
  }
  self.children(childVMs);
};

/**
 * Determine which chld model to create based upon the child's model.
 * @param {object} child - The server model containing the information about the facet.
 * @returns {FacetItemVM} - A facet item view model or any view model inheriting off of it.
 */
FacetPanelVM.prototype.processChild = function(child) {
  var self = this;
  var childVM = new (self.facetsVM.childVM(child.FacetType))(
    child,
    self.facetsVM,
    self
  );

  return childVM;
};

FacetPanelVM.prototype.toggleExclude = function() {
  var self = this;

  var isExcluding = self.isExcluding();
  self.isExcluding(!isExcluding);

  return true;
};

FacetPanelVM.prototype.loadCustomFacets = function(replace) {
  var self = this;

  var url =
    "CustomSegments?key=" +
    self.facetKey +
    "&" +
    self.search.calculateQueryString();
  $.get(url, function(data) {
    self.search.raiseCustomCallback(self.facetKey, data);

    while (self.generatedFacets.length) {
      self.facetsVM.removeFacetPanel(self.generatedFacets.splice(0, 1)[0]);
    }

    for (var i = 0; i < data.length; i++) {
      var segment = data[i];
      segment.isCustomSegment = true;
      var newPanel = new FacetPanelVM(segment, self.search, self.facetsVM);
      self.generatedFacets.push(newPanel);
      self.facetsVM.insertFacet(newPanel, self);
    }
  });
};

FacetPanelVM.prototype.viewAllFacets = function() {
  var self = this;

  self.loopChildren(function(p) {
    if (typeof p.collapse !== "undefined") p.collapse();
  });

  self.facetsVM.removeIndexer(self.facetKey);
};

/*
 * Show the data in facet explorer modal.
 * @returns nothing
 */

FacetPanelVM.prototype.showDataInFacetExplorer = function(_self, waited) {
  //make sure this call is not a waited call when user has already changed the facet to view
  if (waited == true) {
    if (!_self.activeInFacetExplorer()) return;
  }

  var self = _self || this;

  resetAllActiveInExplorerStatuses(self.facetsVM);

  //little bit fiddly here for the mo.
  // the facet clicked may not be on the modal, due to showing unique facets on the modal versus possibly multiples in the various
  // FacetPanelGroupVMs
  // we can check the flag firstInstanceOfKey
  if (!self.firstInstanceOfKey()) {
    _.each(self.facetsVM.facetPanels(), function(fp) {
      var existsOnModal = _.find(fp.facets(), function(f) {
        return f.facetKey == self.facetKey && f.firstInstanceOfKey();
      });
      if (existsOnModal) {
        self = existsOnModal;
      }
    });
  }

  self.activeInFacetExplorer(true);

  //// Check expanded in the facets
  if (!self.isExpanded()) {
    //undo an wasOpen flags as these inhibit dicsoverChildren aka getdata.
    self.wasOpen = false;
    self.expand();
  }

  if (self.children().length == 0) {
    //expand hasnt happened yet.
    _.delay(function() {
      self.showDataInFacetExplorer(self, true);
    }, 500);
  } else {
    var f = self.children()[0];
    var displayText = self.displayText;
    var template = "";

    switch (f.facetType) {
      case FacetsVM.prototype.facetType.numberRange:
        template = "template-facet-range-number";
        break;
      case FacetsVM.prototype.facetType.dateRange:
        template = "template-facet-range-date";
        break;
      case FacetsVM.prototype.facetType.facetTree:
        template = "template-facet-tree";
        break;
      case FacetsVM.prototype.facetType.taxonomyTree:
        f = self;
        template = "template-taxonomy-tree";
        break;
      case FacetsVM.prototype.facetType.facetLeaf:
        template = "template-facet-leaf";
        if (self.children().length > 1) {
          f = self;
          template = "template-taxonomy-tree";
        }
        break;
      case FacetsVM.prototype.facetType.checkbox:
        template = "template-facet-checkbox";
        break;
      case FacetsVM.prototype.facetType.typeAhead:
        //template = "template-facet-popup";
        f.prepareList();
        template = "template-facet-popup-light";
        break;
      case FacetsVM.prototype.facetType.rangeSlider:
        template = "template-facet-range-slider";
        break;
      case FacetsVM.prototype.facetType.dropdown:
        template = "template-facet-dropdown";
        break;
      case FacetsVM.prototype.facetType.textbox:
        template = "template-facet-textbox";
        break;
      default:
        ShowError("FacetPanelVM - unknown type");
        break;
    }

    showPopup(
      self.displayText,
      "<div data-bind=\"template: '" +
        template +
        "'\" style='height:100%'></div>",
      f,
      null,
      function(modalBody) {
        modalBody = $(modalBody);
        var height = modalBody.height();
        modalBody.find(".facet-modal > .grid").css({
          height: height - 50
        });
        modalBody.find(".facetList,.category-list").css({
          height: height - 100
        });
        modalBody.find(".selectedList").css({
          height: height - 80
        });
      },
      "#datalist_tfpaf"
    );
    f.onShow();
  }

  function resetAllActiveInExplorerStatuses(facetsVM) {
    _.each(facetsVM.facetPanels(), function(fpgroup) {
      _.each(fpgroup.facets(), function(f) {
        f.activeInFacetExplorer(false);
      });
    });
  }
};

FacetPanelVM.prototype.onShow = function() {
  
};
