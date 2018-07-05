/**
 * A view model to represent the type ahead node. Used search on a particular indexer when a users starts typing.
 * @param {object} model - The object used to populate the leaf node.
 * @param {FacetsVM} facetsVM - The object responsible for the facets.
 * @param {FacetPanelVM} parentPanel - The view model of the parent panel.
 */
var FacetTypeAheadVM = function(model, facetsVM, parentPanel) {
  var self = this;

  //Call the super constructor
  FacetItemVM.call(self, model, "template-facet-type-ahead", facetsVM);
  self.reloadOnSearch = true;

  self.placeholderText = "Search for more " + model.PlaceHolder;
  self.selectedItems = ko.observableArray([]);
  self.topLinks = self.mapDictionaryToTopLinks(model.TopLinks);
  self.showSearchBox = model.ShowSearchBox;
  self.MaxItems = model.MaxItems || 0;
  /**** Popup */
  self.fullList = [];
  self.categorisedList = ko.observableArray([]).extend({ deferred: true });
  self.activeValue = ko.observable();
  self.searchValue = ko.observable();
  self.headers = null;
  self.onscroll = function() {
    if (!self.headers) {
      self.headers = $("h4[data-name]", ".facet-modal");
    }
    var parentOffset = $(this).offset().top;
    var current;
    self.headers.each(function() {
      var nextcurrent = $(this);
      if (nextcurrent.offset().top - parentOffset - nextcurrent.height() > 0) {
        return false;
      }
      current = nextcurrent;
    });

    self.activeValue(current.data("name"));
  };
  self.scrollTo = function(data, e) {
    var target = $('h4[data-name="' + data.name + '"]', ".facet-modal");
    //var scroll = $(".facetList .scroller");
    //var pos = target.position().top + scroll.scrollTop();
    target[0].scrollIntoView({ behavior: "smooth", block: "start" });
    //scroll.mCustomScrollbar('scrollTo', target, { scrollInertia: 500 });
  };
  self.removeItem = function(item) {
    self.selectedItems.remove(item);
  };

  /**** END Popup */

  self.isActive = ko.observable(false);
  self.isLoading = ko.observable(false);
  self.isModalLoading = ko.observable(false);
  self.parentPanel = parentPanel;
  self.isExcluding = ko.observable(parentPanel.isExcluding());
  self.sortBy = ko.observable("az");

  self.sort = function(sortby) {
    self.sortBy(sortby);
    self.categorisedList(self.categoriseList());
  };

  var searchTimer;
  self.searchList = function(searchVal) {
    self.searchValue(searchVal);

    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(
        function () { self.categorisedList(self.categoriseList()) },
      600
    );
  };

  self.categoriseList = function() {
    self.headers = null;
    var data = _.filter(self.fullList, function(d) {
      return (
        !self.searchValue() ||
        d[0].toLowerCase().indexOf(self.searchValue().toLowerCase()) > -1
      );
    });
    if (self.sortBy() == "az") {
      return _.toArray(
        _.mapObject(
          _.groupBy(
            _.sortBy(data, function(d) {
              return d[0];
            }),
            function(d) {
              return d[0].substr(0, 1).toUpperCase();
            }
          ),
          function(val, key) {
            return self.buildListItems(val, key);
          }
        )
      );
    }

    return self.buildListItems(
      _.sortBy(data, function(d) {
        return -d[1];
      }),
      ""
    );
  };

  self.buildListItems = function(val, key) {
    var myHtml = "";
    for (var i = 0; i < val.length; i++) {
      var name = val[i][0];
      var count = val[i][1];
      // Only show count if a count has been provided
      var countString = parseInt(count) ? "(" + count + ")" : "";
      myHtml =
        myHtml +
        "<li><input data-bind=\"validatable: false, checkedValue: '" +
        $("<div>")
          .text(name)
          .html()
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'")
          .trim() +
        '\',checked: $parent.selectedItems, uniqueId: true" class="checkbox" type="checkbox">';
      myHtml =
        myHtml +
        '<label data-bind="uniqueFor: \'after\'" class="u-margin-An"></label><label data-bind="uniqueFor: \'after\'"><span>' +
        name +
        '</span><span class="count">' +
        countString +
        "</span></label></li>";
    }

    return {
      name: key,
      childListItems: myHtml
    };
  };

  self.prepareList = function() {
    if (!self.fullList.length) {
      self.isModalLoading(true);

      function processList(data) {
        data = _.pairs(data.TopLinks);

        self.fullList = data;
        self.categorisedList(self.categoriseList());
      }
      self.loadFullList(processList);
    }
  };

  self.showList = function(self) {
    self.prepareList();

    showPopup(
      self.parentPanel.displayText,
      "<div data-bind=\"template: 'template-facet-popup-all-filters'\"></div>",
      self,
      function(modalBody) {},
      function(modalBody) {
        modalBody = $(modalBody);
        var modalHeight = modalBody.height();

        if (modalHeight < 500) {
          modalHeight = 500;
        }

        self.parentPanel.showDataInFacetExplorer();
        // set sizes after display as in some browsers (IE, FF) the elements do not exist to locate until this point
        modalBody
          .find(".facet-modal > .grid")
          .css({ "max-height": modalHeight - 50 });
        modalBody
          .find(".facetList,.category-list")
          .css({ "max-height": modalHeight - 100 });
        modalBody.find(".selectedList").css({ "max-height": modalHeight - 80 });
      }
    );
  };

  self.selectedItems.subscribe(function() {
    self.updateApplyButton();
  });

  self.addItem = function(item) {
    if ($.inArray(item, self.selectedItems()) === -1) {
      self.selectedItems.push(item);
    }
  };

  self.removeItem = function(item) {
    self.selectedItems.splice($.inArray(item, self.selectedItems()), 1);
  };

  /**
   * Applies the facet to the url.
   */
  self.applyFacet = function(item) {
    var keyToUse;
    if (typeof item === "object") {
      keyToUse = item.displayText;
    } else {
      keyToUse = item;
    }

    var exclude = "";
    if (self.parentPanel != null && self.parentPanel.isExcluding() == true) {
      exclude = "!!";
    }

    self.facetsVM.applyFacet(self.indexer + exclude, keyToUse, true);
  };

  self.updateApplyButton();
};

/**
 * Inheritance
 */
FacetTypeAheadVM.prototype = Object.create(FacetItemVM.prototype);
FacetTypeAheadVM.prototype.constructor = FacetTypeAheadVM;

/*
* Knockout binding for auto complete
*/
ko.bindingHandlers.typeAheadAutoComplete = {
  init: function(element, valueAccessor, allBindings, viewModel) {
    var self = viewModel;

    var options = valueAccessor();

    $.ui.autocomplete.prototype._renderItem = function(ul, item) {
      item.label = item.label.replace(
        new RegExp(
          "(?![^&;]+;)(?!<[^<>]*)(" +
            $.ui.autocomplete.escapeRegex(this.term) +
            ")(?![^<>]*>)(?![^&;]+;)",
          "gi"
        ),
        "<strong>$1</strong>"
      );
      ul.css("position", "absolute");
      ul.addClass("search-bar-dropdown");

      return $("<li></li>")
        .data("item.autocomplete", item)
        .append("<a>" + item.label + "</a>")
        .appendTo(ul);
    };

    //handle disposal (if KO removes by the template binding)
    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      $(element).autocomplete("destroy");
    });

    var searchTerm;
    $(element).autocomplete({
      messages: {
        noResults: "",
        results: function() {}
      },
      source: function(request, response) {
        self.isLoading(true);
        searchTerm = $(element).val();
        self.loadList(searchTerm, 10, response);
      },
      minLength: options.chars || 3,
      select: function(a, b) {
        if (b.item.value !== "") {
          self.addItem(b.item.value);
          a.preventDefault();
          a.stopPropagation();
        }
      }
    });
  }
};

FacetTypeAheadVM.prototype.onShow = function() {
  this.headers = null;
};

FacetTypeAheadVM.prototype.loadList = function(searchTerm, count, callback) {
  var self = this;
  var urlPath = "Search/GetAutoCompletionList";
  var escapedQueryString = encodeURIComponent(searchTerm);
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: urlPath,
    data: JSON.stringify({
      prefixText: escapedQueryString,
      count: count,
      context: self.indexer
    }),
    dataType: "json",
    async: true,
    success: function(data) {
      if (!data.length) {
        data = [
          {
            label: "No matches found",
            value: ""
          }
        ];
      }
      callback(data);
      self.isLoading(false);
    },
    error: function(result) {
      ShowError(result);
      self.isLoading(false);
    }
  });
};
/**
 * Load full list for popup.
 */
FacetTypeAheadVM.prototype.loadFullList = function(callback) {
  var self = this;
  var urlPath = "facets/Expand";

  if (self.facetsVM.options.categoryUrlKey) {
    urlPath = "/" + self.facetsVM.options.categoryUrlKey + "/" + urlPath;
  }

  var queryString = self.parentPanel.search.calculateQueryString();

  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: urlPath,
    data:
      "{'query':'" +
      queryString +
      "', 'value':'1', 'facet':'" +
      self.indexer +
      "'}",
    dataType: "json",
    async: true,
    success: function(data) {
      callback(data);
      self.isLoading(false);
      self.isModalLoading(false);
    },
    error: function(result) {
      ShowError(result);
      self.isLoading(false);
      self.isModalLoading(false);
    }
  });
};

/*
 * Checks if value is selected and enables the apply button
 */
FacetTypeAheadVM.prototype.updateApplyButton = function() {
  var self = this;

  self.value = self.getFacetValue();
  self.isSelected(false);
  if (self.selectedItems().length > 0) {
    self.isSelected(true);
  }
  self.facetsVM.registerSelected(self);
};

/**
 * Calculate the value to apply to the query string. This will include any upper or lower ranges.
 * @returns {string} - The value to apply to the query string.
 */
FacetTypeAheadVM.prototype.getFacetValue = function() {
  var self = this;

  return self.selectedItems().join(self.facetsVM.operator.or);
};

/**
 * Converts a dictionary to an array of FacetTypeAheadTopLinksVM
 */
FacetTypeAheadVM.prototype.mapDictionaryToTopLinks = function(dictionary) {
  var self = this;
  var result = [];
  for (var key in dictionary) {
    if (dictionary.hasOwnProperty(key)) {
      result.push(new FacetTypeAheadTopLinksVM(self, key, dictionary[key]));
    }
  }

  return result;
};

var FacetTypeAheadTopLinksVM = function(parent, text, count) {
  var self = this;
  self.parent = parent;
  self.displayText = text;
  self.count = count;
};
