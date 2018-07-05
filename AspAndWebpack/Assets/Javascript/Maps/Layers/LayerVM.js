/**
 * The abstract view model for a layer within the map.
 * @param {object} options - A collection of properties that are to be used to set-up the layer.
 * @param {object} defaultOptions - A collection of default properties specific to the inherited object.
 */
var LayerVM = function(options, defaultOptions) {
  var self = this;

  if (self.constructor === LayerVM) {
    throw new Error("Can't instantiate the abstract class 'LayerVM'!");
  }

  if (defaultOptions) {
    options = $.extend({}, defaultOptions, options);
  }

  self.options = $.extend(
    {
      isVisible: false,
      title: "No Title",
      id: undefined,
      layerType: "MarkerLayer",
      xOffSet: 0,
      categoryName: "",
      providerName: "",
      parentServiceId: "",
      urlKey: undefined,
      startLoadingCallback: function() {},
      finishedLoadingCallback: function() {},
      showFacetsCallback: function() {},
      getGlobalConstraints: function() {
        return {};
      },
      applyMapExtent: function(minX, minY, maxX, maxY, wgs) {},
      hasFacets: false,
      layerManagerVm: undefined,
      searchUrl: "/Map/GetResults",
      contentUrl: "/Map/GetMarkerContent",
      modalId: "dragModal",
      subLayerKey: "",
      isTextSearchable: false,
      type: layerTypeEnum.none
    },
    options
  );

  self.layerManagerVm = self.options.layerManagerVm;

  self.map = self.layerManagerVm.map;

  /**
   * Gets or sets a value indicating whether the layer is visible on map or not. Does not affect the legend.
   */
  self.isVisible = ko.observable(self.options.isVisible);

  self.isHidden = ko.computed(function() {
    return self.options.hidden;
  });

  /**
   * Gets or sets the friendly name of the layer.
   */
  self.title = ko.observable(self.options.title);

  /**
   * Gets or sets the relative path to image file used to represent the layer.
   */
  self.icon = self.options.icon;
  self.hasFacets = !!self.options.hasFacets;
  self.hasPopover = ko.observable(false);
  self.detailImage = self.options.detailImage;

  self.id = self.options.id;
  self.breadcrumbs = [];
  self.isTextSearchable = self.options.isTextSearchable;
  self.canExportData = self.options.exportData;

  self.help = self.options.help;
  self.showHelp = function(data, e) {
    if (!self.help || !self.help.Group || !self.help.Item || !self.help.App)
      return;
    LoadHelp(
      $(e.delegateTarget),
      self.help.Group,
      self.help.Item,
      self.help.App
    );
  };

  self.onToggleFocus = function(self, e) {};

  self.type = self.options.type;
  //self.typeDisplay = ko.observableArray(self.type.filter(function(t,i,a){return t & layerTypeEnum.Marker || t & layerTypeEnum.Esri || a.length === 1}));

  /* The total number of results that have come back from the server. */
  self.totalResults = ko.observable();

  self.isLoading = ko.observable(false);

  self.subLayerKey = ko.observable(self.options.subLayerKey);
  self.subLayers = ko.observableArray();
  self.children = ko.observableArray();
  self.parentLayer = null;

  self.legend = ko.observable();

  self.mapRect = 0;

  self.popupData = ko.observable();

  self.passive = false;

  var onVisibleChange = function(visible, type, constraints) {
    type = type || self.type;
    if (type == layerTypeEnum.Group) return;
    if (!visible) {
      self.clear(type);
    } else {
      var geo = self.map.geographicExtent;
      var zoom = self.map.getZoom();
      var globalFacets = self.options.getGlobalConstraints();
      switch (type) {
        case layerTypeEnum.Esri:
          globalFacets["type"] = "Esri";
          break;
        case layerTypeEnum.Choropleth:
          globalFacets["type"] = "Choropleth";
          break;
        case layerTypeEnum.Heatmap:
          globalFacets["type"] = "Heatmap";
          break;
        case layerTypeEnum.Combined:
          globalFacets["type"] = "Combined";
          break;
        case layerTypeEnum.Marker:
        default:
          globalFacets["type"] = "Marker";
          break;
      }

      self.update("mapLayer", self.map, geo, zoom, globalFacets);

      if (
        globalFacets["type"] == "Marker" &&
        self.type == layerTypeEnum.Marker
      ) {
        self.map.reorderLayer(
          self.getLayer(layerTypeEnum.Marker),
          self.map.graphicsLayerIds.length
        );
      }
    }
    self.layerManagerVm.updateLayerQuerystring(true);
  };

  self.isVisible.subscribe(onVisibleChange);
  $(window).resize(function() {
    self.mapRect = 0;
  });

  //self.typeDisplay.subscribe(function(type){
  //    type.forEach(function(t){
  //        onVisibleChange(t.status === 'added', t.value);
  //    })
  //}, null, "arrayChange")
};

/**************************************************************************************************/
/*********************************** "ABSTRACT" FUNCTION ************************************/
/**************************************************************************************************/

/**
 Update function called on map change or filters change. 
 * @param {string} updateRequestSender - The type of update such as facetPanel.
 * @param {object} map - esri map.
 * @param {object} geo - geographic extent.
 * @param {object} zoom - The zoom level of the map.
 * @param {object} globalConstraints - All search constraints that will be applied to all layers (according to their individual rules).
 **/
LayerVM.prototype.update = function(
  updateRequestSender,
  map,
  geo,
  zoom,
  globalConstraints,
  removals
) {
    throw new "Need to implement the abstract  method 'update'!";
};

/**
 * Clear the layer.
 */
LayerVM.prototype.clear = function(type) {
  throw new "Need to implement the abstract  method 'clear'!";
};

/**************************************************************************************************/
/************************************ "VIRTUAL" FUNCTIONS *************************************/
/**************************************************************************************************/

LayerVM.prototype.ApplyFacetsForAnyPopupWindows = function(undo) {
  //do nothing, can be overridden.
};

LayerVM.prototype.resetPopupArrays = function() {
  //do nothing, can be overridden.
};

/**
 * Display all available facets for the given layer so that the results can be filtered down.
 * @param {EventArgs} e - The click event
 */
LayerVM.prototype.getFacetsVM = function(e) {
  var self = this;

  if (e) {
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  if (self.facets) {
    self.options.showFacetsCallback(self.facets);
  }
};

/**
 * Apply a facet to the current layer.
 * @param {string} indexer - The name of the indexer to apply the facet value to.
 * @param {object} value - The value to filter by for the given indexer.
 */
LayerVM.prototype.applyFacet = function(indexer, value) {
  return null;
};

/**************************************************************************************************/
/****************************************** FUNCTIONS ******************************************/
/**************************************************************************************************/

LayerVM.prototype.hideTooltip = function(options) {
  var self = this;
  var tooltip = $(".map-bubble-tip", self.map.container);

  if (tooltip.length) {
    tooltip.hide();
  }
};

LayerVM.prototype.showTooltip = function(options) {
  var self = this;

  options = $.extend(
    {},
    {
      heading: "",
      content: "",
      target: null,
      event: null,
      offset: { X: 0, Y: 0 },
      track: false
    },
    options
  );

  if (!(options.target instanceof jQuery)) {
    options.target = $(options.target);
  }

  var tooltip = $(".map-bubble-tip", self.map.container);

  var direction = "w";

  if (!tooltip.length)
    tooltip = $(
      '<div class="tipsy map-bubble-tip" id="map-bubbleTip" style="display: none;"><div class="tipsy-arrow"></div><div class="tipsy-inner"></div></div>'
    ).appendTo(self.map.container);

  var existingDirection = (tooltip[0].className.match(
    /\btipsy-([news]+)\b/
  ) || ["", ""])[1];

  var html = "";

  //Heading
  html += options.heading ? "<h5>" + options.heading + "</h5>" : "";

  //Content
  html += options.content || "";

  if (tooltip.data("html") !== html) {
    tooltip.find(".tipsy-inner").html(html);
    tooltip.data("html", html);
  }

  var targetRect = options.track
    ? {
        top: options.event.clientY,
        left: options.event.clientX,
        right: options.event.clientX,
        height: 0,
        width: 0
      }
    : options.target.get(0).getBoundingClientRect();
  var mapRect = self.map.container.getBoundingClientRect();

  //Show
  tooltip.show();
  var tooltipRect = tooltip[0].getBoundingClientRect();

  var tooltipPos = {
    left: targetRect.right - mapRect.left + 5 + options.offset.X,
    top:
      targetRect.top -
      mapRect.top +
      targetRect.height / 2 -
      tooltipRect.height / 2 +
      options.offset.Y
  };

  //Position
  if (tooltipPos.left + tooltipRect.width > mapRect.width) {
    direction = "e";
    tooltipPos.left =
      targetRect.left -
      mapRect.left -
      (tooltipRect.width + 5) -
      options.offset.X;
  }
  if (tooltipPos.top + tooltipRect.height > mapRect.height) {
    direction = "s" + direction;
    tooltipPos.top =
      targetRect.top -
      mapRect.top -
      (tooltipRect.height + 5) -
      options.offset.Y;
    tooltipPos.left =
      targetRect.left -
      mapRect.left +
      targetRect.width / 2 +
      (/e/.test(direction) ? 10 - tooltipRect.width : -10);
  }
  if (tooltipPos.top < 0) {
    direction = "n" + direction.slice(-1);
    tooltipPos.top =
      targetRect.top - mapRect.top + targetRect.height + options.offset.Y;
    tooltipPos.left =
      targetRect.left -
      mapRect.left +
      targetRect.width / 2 +
      (/e/.test(direction) ? 10 - tooltipRect.width : -10);
  }

  if (existingDirection != direction) {
    tooltip[0].className = existingDirection
      ? tooltip[0].className.replace(/\btipsy-[news]+\b/, "tipsy-" + direction)
      : tooltip[0].className + " tipsy-" + direction;
  }
  var transform =
    "translate(" +
    Math.round(tooltipPos.left) +
    "px, " +
    Math.round(tooltipPos.top) +
    "px)";
  tooltip[0].style.transform = transform;
  if (tooltip[0].style.msTransform !== undefined) {
    tooltip[0].style.msTransform = transform;
  }
};

LayerVM.prototype.getPopupContent = function() {
  var self = this;
  var modal = $("#" + self.options.modalId);

  var modalBody = $(".modal-body", modal);
  return modalBody.html();
};

LayerVM.prototype.showPopup = function(options) {
  var self = this;

  options = $.extend(
    {},
    {
      heading: "",
      content: "",
      url: "",
      footer:
        "<button type='button' class='btn btn-default closePopup' data-dismiss='modal'>Close</button>",
      callback: function() {},
      onClose: function() {}
    },
    options
  );

  var modal = $("#" + self.options.modalId);
  var modalDialog = $(".modal-dialog", modal);
  var modalHeader = $(".map-modal-breadcrumb", modal);
  var modalBody = $(".modal-body", modal);
  var modalLoading = $(".modal-loading", modal);
  var modalFooter = $(".modal-footer", modal);

  modalHeader.html("");
  modalBody.html("");
  modalFooter.html("");
  modalLoading.addClass("loading");

  modal.modal({
    backdrop: false,
    escapeClose: false,
    clickClose: true
  });

  modal.off("hidden.bs.modal");
  modal.on("hidden.bs.modal", function() {
    var highlightLayer = self.map.getLayer("highlightingLayer");
    if (highlightLayer) highlightLayer.hide();
    self.layerManagerVm.mapPageVM.setLayersOpacity(0.9);
  });

  modal.draggable({
    handle: ".modal-header",
    stop: function(e) {
      $(e.target).css({
        bottom: "auto",
        right: "auto"
      });
    },
    containment: "window"
  });

  modalDialog.resizable({
    handles: "all",
    start: function(e) {
      var pos = modal.position();
      modal.css({
        top: pos.top,
        left: pos.left,
        bottom: "auto",
        right: "auto"
      });
    }
  });

  //Breadcrumbs & Header
  var headerHtml = "<ol class='breadcrumb u-margin-Bxxs'>";

  //We don't want to show the "active" breadcrumb.
  for (var i = 0; i < self.breadcrumbs.length - 1; i++) {
    var crumb = self.breadcrumbs[i];
    var crumbTemplate =
      "<li class='u-padding-Hxxs'><a href='javascript:void(0)' data-bind=\"click : function(){ applyBreadcrumb('{KEY}')}\">{LABEL}</a></li>";
    crumbTemplate = crumbTemplate.replace("{KEY}", crumb.id || "N/A");
    crumbTemplate = crumbTemplate.replace("{LABEL}", crumb.title || "N/A");
    headerHtml += crumbTemplate;
  }
  var headingText = options.heading || "";
  if (/^\s*<li\b/.test(headingText)) headerHtml += headingText;
  else
    headerHtml +=
      "<li class='active u-padding-Hxxs'>" + (options.heading || "") + "</li>";
  headerHtml += "</ol>";

  modalHeader.html(headerHtml);

  //Content
  modalBody.html(options.content || "");

  //Data
  self.popupData(options.data);

  var onComplete = function() {
    var modalDom = modal.find(".modal-content").get(0);
    ko.cleanNode(modalDom);
    ko.applyBindings(self, modalDom);

    //knockout seems to destroy bootstrap popups, so let's remake it for now!
    modal.modal({
      backdrop: false,
      escapeClose: false,
      clickClose: true
    });

    modalLoading.removeClass("loading");
    var maxHeight;
    if (
      !modalDialog.is('[style*="height"]') &&
      modalDialog.height() > (maxHeight = $(window).height() * 0.7)
    ) {
      modalDialog.css("height", maxHeight);
    } else {
      modalDialog.css("height", "");
    }

    //Try to hook up any images
    PopupImageCarousel.new({
      thumbnailSelector: ".modal-content .thumbnail",
      title: headingText
    });

    //Try to hook up any carousels.
    CarouselWidget.init("#" + self.options.modalId + " .modal-content");

    modal.focus();
    if (options.callback) options.callback();
  };

  //Footer
  modalFooter.html(options.footer);

  if (options.url) {
    $.get(options.url, function(result) {
      var html = result.Html || result;
      var data = result.Data;

      modalBody.html(html);

      if (Array.isArray(data))
        data = data.map(function(d) {
          return new Marker(d);
        });

      self.popupData(data);

      onComplete();
    });
  } else if (modalBody.html().length === 0) {
    //do nothing, keep loading
  } else {
    onComplete();
  }
};

LayerVM.prototype.highlightPoint = function(point) {
  var self = this;
  var emph = "emphasize";
  var els = self.map.root.getElementsByClassName(emph);
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    el.classList ? el.classList.remove(emph) : $(el).removeClass(emph);
  }
  if (
    point.tagName == "text" &&
    point.previousElementSibling &&
    point.previousElementSibling.tagName == "image"
  ) {
    point = point.previousElementSibling;
  }

  point.classList ? point.classList.add(emph) : $(point).addClass(emph);
};

LayerVM.prototype.getMarker = function(name) {};

/**
 * Creates a summary table of the markers' content
 * @param {Object|Array} marker - the marker to get the summary of.
 * @returns {string} HTML of a summary table.
 */
LayerVM.prototype.getSummary = function(marker) {};

/**
 * Find markers in this layer at a given extent and return the data via the callback.
 * @param {esri.Extent} extent - the extent to search within.
 * @param {function} callback - the callback function to return the markers to.
 */
LayerVM.prototype.findMarkerAt = function(extent, callback) {};

LayerVM.prototype.checkFacet = function(facet) {
  return;
};

LayerVM.prototype.exportData = function() {};
LayerVM.prototype.saveSearch = function() {};

LayerVM.prototype.getSymbol = function() {};

LayerVM.prototype.LayerType = function(id) {
  switch (id) {
      case layerTypeEnum.Marker:
      case layerTypeEnum.RangedMarker:
      return "Points";
    case layerTypeEnum.Choropleth:
      return "Choropleth";
    case layerTypeEnum.Heatmap:
      return "Heatmap";
  }
  return "";
};

LayerVM.prototype.popover = function() {};

function SubLayerVM(name, icon) {
  var self = this;
  self.title = name || "";
  self.isVisible = ko.observable(true);
  self.icon = icon;
}

var layerTypeEnum = {
  none: 0,
  Group: 1,
  Marker: 2,
  Choropleth: 4,
  Heatmap: 8,
  Esri: 16,
  Combined: 32,
  RangedMarker : 64,
  All: [0, 1, 2, 4, 8, 16, 64]
};
