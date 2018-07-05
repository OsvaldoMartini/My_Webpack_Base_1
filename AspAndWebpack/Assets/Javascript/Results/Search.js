/**
 * A function view model to handle changes within a results view.
 * @param {Object} options - The properties that will set up the search.
 */
var Search = function(options) {
  var self = this;

  self.options = $.extend(
    {
      // Store this as we might want to hit something else like chartController.
      serviceUrl: "search/getResults?",

      //The search query that is currently active.
      queryString: undefined,

      //Added to the beginning of the get results call so that you can target specific results.
      urlPrefix: undefined,

      //Whether or not to update the url within the browser once a search is performed.
      updateQueryString: true,

      //Whether or not the search can abort requests. If a new search is performed, then any old requests are aborted.
      abortableRequests: true
    },
    options
  );

  //in case the url contains the hash bang, fix the query string.
  //The static part of the url. i.e. not the hash.
  self.urlQuery = {};

  // Store this as we might want to hit something else like chartController.
  self.serviceUrl = self.options.serviceUrl;

  //make the url a proper url. i.e remove the hash bang.
  self.newQuery = {};

  self.urlPrefix = self.options.urlPrefix;
  self.startCallbacks = [];
  self.finishedCallbacks = [];
  self.CustomCallbacks = [];
  self.errorCallbacks = [];
  self.queryStringExtendCallbacks = [];
  self.propertyChangedCallbacks = {};
  self.metaData = {};
    self.specialCharacters = { "&": "%26", ":":"%3A" };

  var queryString = self.options.queryString;
  if (queryString) {
    //url query - only use the query before the hash.
    var indexOfHash = queryString.indexOf("#");
    var indexToCut = indexOfHash === -1 ? queryString.length : indexOfHash;
    self.urlQuery = self.queryStringToObject(queryString.substr(0, indexToCut));

    //new query - use everyting, even the hash query
      self.newQuery = self.queryStringToObject(queryString.replace("#", "&"));
  }
};

/**
 * Register for a callback when a property in the query string is changed.
 * @param {string} queryProperty - The querty string property. See "Search.prototype.queryProperty".
 * @param {Function} callback - The function to call when the property changed. Will pass the new value as an argument.
 */
Search.prototype.registerPropertyChangedCallback = function(
  queryProperty,
  callback
) {
  var self = this;

  if (self.propertyChangedCallbacks.hasOwnProperty(queryProperty)) {
    self.propertyChangedCallbacks[queryProperty].push(callback);
  } else {
    self.propertyChangedCallbacks[queryProperty] = [callback];
  }
};

/**
 * Notify all interested members that a specific property has changed it's value.
 * @param {string} queryProperty - The querty string property. See "Search.prototype.queryProperty".
 * @param {object} value - The value that the property has changed to.
 */
Search.prototype.notifyPropertyChanged = function(queryProperty, value) {
  var self = this;

  if (self.propertyChangedCallbacks.hasOwnProperty(queryProperty)) {
    var callbacks = self.propertyChangedCallbacks[queryProperty];

    for (var i = 0; i < callbacks.length; i++) {
      var callback = callbacks[i];
      callback(value);
    }
  }
};

/**
 * Allows the a callback to be sent to the requester once the search results are about to be updated.
 * @param {function} callback - The callback that will be called.
 * @param {array} ignoreUpdatesFrom - A list of "update request senders" that the callback wants to ignore.
 */
Search.prototype.registerStartCallback = function(callback, ignoreUpdatesFrom) {
  var self = this;
  self.startCallbacks.push({
    func: callback,
    ignoreUpdatesFrom: ignoreUpdatesFrom || []
  });
};

/**
 * Allows the a callback to be sent to the requester once the search results have been retrieved.
 * @param {function} callback - The callback that will be called.
 * @param {array} ignoreUpdatesFrom - A list of "update request senders" that the callback wants to ignore.
 */
Search.prototype.registerFinishedCallback = function(
  callback,
  ignoreUpdatesFrom
) {
  var self = this;
  self.finishedCallbacks.push({
    func: callback,
    ignoreUpdatesFrom: ignoreUpdatesFrom || []
  });
};

/**
 * Allows the a callback to be sent to the requester once something in the chain has fired the event.
 * @param {function} callback - The callback that will be called.
 */
Search.prototype.registerCustomCallback = function(callback) {
  var self = this;
  self.CustomCallbacks.push({
    func: callback
  });
};

/**
 * Allows a single (change if needed) review step of the url from some code other
 * than the search. This initially is to edit the url before sending to add hints
 * not important enough to exist on the browser url proper.
 **/
Search.prototype.registerReviewUrlCallback = function(callback) {
  var self = this;
  self.ReviewUrlCallback = callback;
};

Search.prototype.raiseReviewUrlCallback = function(url) {
  var self = this;
  if (self.ReviewUrlCallback) {
    return self.ReviewUrlCallback(url);
  }
  return url;
};
/**
 * Allows the a callback to be sent to the requester if the request to retrieve the search results has failed.
 * @param {function} callback - The callback that will be called.
 * @param {array} ignoreUpdatesFrom - A list of "update request senders" that the callback wants to ignore.
 */
Search.prototype.registerErrorCallback = function(callback, ignoreUpdatesFrom) {
  var self = this;
  self.errorCallbacks.push({
    func: callback,
    ignoreUpdatesFrom: ignoreUpdatesFrom || []
  });
};
/**
 * Allows the a callback to be sent to extend the query string.
 * @param {function} callback - The callback that will be called.
 */
Search.prototype.registerQueryStringExtendCallback = function(callback) {
  var self = this;
  self.queryStringExtendCallbacks.push(callback);
};

/**
 * Request for the results to be updated.
 * @param {updateRequestSender} updateRequestSender - An enum item to identify what sent the update request. [Optional]
 */
Search.prototype.updateResults = function(updateRequestSender) {
  var self = this;
  var queryString = self.calculateQueryString();
  self.updateHash(
    self.sendUpdateRequest.bind(self, queryString, updateRequestSender)
  );

  if (typeof ga !== "undefined") {
    ga("send", {
      hitType: "event",
      eventCategory: "Search",
      eventAction: updateRequestSender,
      eventLabel: queryString,
      nonInteraction: 0
    });
  }
  self.sendUpdateRequest(queryString, updateRequestSender);
};

/**
 * Request for the results to be updated. The same as UpdateResults but a more "public" function.
 * @param {updateRequestSender} updateRequestSender - An enum item to identify what sent the update request. [Optional]
 */
Search.prototype.submit = function(updateRequestSender) {
  var self = this;
  self.updateResults(updateRequestSender);
};

/**
 * Sends a request to the server to fetch the new results partial view.
 * @param {string} queryString - The search string to search by.
 * @param {function} callback - The completed callback containing the html data to populate.
 * @param {updateRequestSender} updateRequestSender - An enum item to identify what sent the update request. [Optional].
 */
Search.prototype.sendUpdateRequest = function(
  queryString,
  updateRequestSender
) {
  var self = this;

  queryString = queryString || "";
  updateRequestSender = updateRequestSender || self.updateRequestSender.unkown;

  if (self.options.abortableRequests && self.activeRequest) {
    self.activeRequest.abort();
    self.activeRequest = undefined;
  }

  if (queryString.startsWith("&")) {
    queryString = queryString.substring(1);
  }

  var url = self.serviceUrl;

  //if the scroller is calling the update, do not request another table header as we will be appending the results.
  //we need to clean this up as it is messy...
  if (updateRequestSender === self.updateRequestSender.scroller) {
    url = "search/getResultsWithoutHeader?";
  }

  if (url.indexOf("?") === -1) {
    url += "?";
  }

  if (
    updateRequestSender === self.updateRequestSender.pagination ||
    updateRequestSender === self.updateRequestSender.sort
  ) {
    url += "excludeNavigators=true&";
  }

  if (updateRequestSender === self.updateRequestSender.dontSearch) {
    url += "SD=dontSearch&";
  }

  url += queryString;

  if (self.urlPrefix != undefined) {
    url = self.urlPrefix + url;
  }

  self.raiseStartCallbacks(updateRequestSender);

  url = self.raiseReviewUrlCallback(url);

  var request = $.get(url, function(result) {
    self.raiseFinishedCallbacks(updateRequestSender, result);
  }).fail(function() {
    self.raiseErrorCallbacks(updateRequestSender);
  });

  self.activeRequest = request;
};

/**
 * Call all registered callbacks that were interested in the start of the results retrieval.
 * @param {updateRequestSender} updateRequestSender - An enum item to identify what sent the update request. [Optional].
 */
Search.prototype.raiseStartCallbacks = function(updateRequestSender) {
  var self = this;
  var result = true;
  for (var i = 0; i < self.startCallbacks.length; i++) {
    var startCallback = self.startCallbacks[i];

    if (startCallback.ignoreUpdatesFrom.indexOf(updateRequestSender) === -1) {
      var res = startCallback.func(updateRequestSender);
      if (res != undefined) result = result && res;
    }
  }

  return result;
};

/**
 * Call all registered callbacks that were interested in the end of the results retrieval.
 * @param {updateRequestSender} updateRequestSender - An enum item to identify what sent the update request. [Optional].
 * @param {string} result - The result of the results fetch.
 */
Search.prototype.raiseFinishedCallbacks = function(
  updateRequestSender,
  result
) {
  var self = this;
  for (var i = 0; i < self.finishedCallbacks.length; i++) {
    var finishedCallback = self.finishedCallbacks[i];

    if (
      finishedCallback.ignoreUpdatesFrom.indexOf(updateRequestSender) === -1
    ) {
      finishedCallback.func(result, updateRequestSender);
    }
  }
};

/**
 * Call all registered callbacks that were interested in custom events.
 * @param {string} id - The id argument to pass through.
 * @param {string} result - The data argument to pass through.
 */
Search.prototype.raiseCustomCallback = function(id, data) {
  var self = this;
  for (var i = 0; i < self.CustomCallbacks.length; i++) {
    var customCallback = self.CustomCallbacks[i];
    customCallback.func(id, data);
  }
};

/**
 * Call all registered callbacks that were interested in any errors that were occured during results retrieval.
 * @param {updateRequestSender} updateRequestSender - An enum item to identify what sent the update request. [Optional].
 */
Search.prototype.raiseErrorCallbacks = function(updateRequestSender) {
  var self = this;
  for (var i = 0; i < self.errorCallbacks.length; i++) {
    var errorCallback = self.errorCallbacks[i];

    if (errorCallback.ignoreUpdatesFrom.indexOf(updateRequestSender) === -1) {
      errorCallback.func(updateRequestSender);
    }
  }
};

/**
 * Updated the browser url with current query selections using a hash to prevent
 * a browser refresh.
 */
Search.prototype.updateHash = function(action, replaceState) {
  var self = this;
  var hash = {};

  if (self.options.updateQueryString) {
    for (var key in self.newQuery) {
      if (self.newQuery.hasOwnProperty(key)) {
        var newValue = self.newQuery[key];
        var oldValue = self.urlQuery[key];
        var isInOriginal = self.urlQuery.hasOwnProperty(key);

        //use Javascript's "==" rather than "===" as it needs to attempt a conversion. The query string will store everything in string format.
        if (isInOriginal && newValue == null) {
          hash[key] = null;
        } else if (isInOriginal && newValue != oldValue) {
          hash[key] = newValue;
        } else if (!isInOriginal && newValue != null && newValue !== "") {
          hash[key] = newValue;
        }
      }
    }
    var hashString = self.objectToQueryString(hash);
    if (replaceState && window.history && window.history.replaceState) {
      window.history.replaceState(hashString, document.title, "#" + hashString);
    } else if (window.history && window.history.pushState) {
      window.history.pushState(hashString, document.title, "#" + hashString);
      if (action) window.historyState[hashString] = action;
    } else {
      window.location.hash = hashString;
    }
  }
};
window.historyState = {};
window.onpopstate = function(event) {
  if (window.historyState[event.state]) {
    window.historyState[event.state]();
  }
};
/**
 * Sets a query value within the search query.
 * @param {string} propertyName - The property to set.
 */
Search.prototype.setQueryValue = function(propertyName, value) {
  var self = this;

  self.newQuery[propertyName] = value;

  self.notifyPropertyChanged(propertyName, value);
};

/**
 * Gets a value from the query for a specific property.
 * @param {string} propertyName - The property to retrieve.
 * @param {boolean} decode - Whether or not to decode the url value. Defaults to false.
 */
Search.prototype.getQueryValue = function(propertyName, decode) {
  var self = this;
    var result;

  if (self.newQuery.hasOwnProperty(propertyName)) {
    result = self.newQuery[propertyName];

    if (result && decode) {
      result = decodeURIComponent(result);
    }
  }

  return result;
};



/**
 * Checks whether a property exists in the search and whether it has a value.
 * @param {string} propertyName - The property to check.
 */
Search.prototype.hasQueryValue = function(propertyName) {
  var self = this;
  var value = self.getQueryValue(propertyName);

  var result = value !== undefined && value !== null && value.length > 0;

  return result;
};

/**
 * Checks whether the given properties exist within the search and whether they have a value.
 * @param {Array} propertyNames - The collection of properties to check.
 * @param {bool} allMustBeTrue - Ensures all of the properties exist. Default is false.
 */
Search.prototype.hasQueryValues = function(propertyNames, allMustBeTrue) {
  var self = this;

  var result = propertyNames ? true : false;

  propertyNames = propertyNames || [];

  for (var i = 0; i < propertyNames.length; i++) {
    var property = propertyNames[i];
    if (!self.hasQueryValue(property)) {
      result = false;
      if (allMustBeTrue) {
        break;
      }
    } else {
      result = true;
      if (!allMustBeTrue) {
        break;
      }
    }
  }

  return result;
};

/*
 * Checks wether there are any valid search terms in the search query.
 */
Search.prototype.hasSearchCriteria = function() {
  var self = this;
  var result = false;

  var queryKeys = Object.keys(self.newQuery);
  for (var i = 0; i < queryKeys.length; i++) {
    var key = queryKeys[i];
    if (self.newQuery.hasOwnProperty(key)) {
      result = self.hasQueryValue(key);
      if (result) {
        break;
      }
    }
  }

  return result;
};

/**
 * Checks whether a specific key and value pair exists within the query.
 * @param {string} propertyName - The property to check.
 * @param {object} value - The value to check.
 * @param {bool} allowCoercion - Allow values to coerce when comparing (==). Defaults to false.
 * @param {bool} ignoreCase - Allows the same string with different cases to match. Defaults to false.
 * @returns {bool} - Whether or not the key and value exist within the query.
 */
Search.prototype.equalsQueryValue = function(
  propertyName,
  value,
  allowCoercion,
  ignoreCase
) {
  var self = this;
  var result = false;

  if (propertyName in self.newQuery) {
    var queryValue = self.getQueryValue(propertyName);

    if (
      (queryValue === null || queryValue === undefined) &&
      (value === null || value === undefined)
    ) {
      result = true;
    } else if (queryValue === null || queryValue === undefined) {
      result = false;
    } else if (value === null || value === undefined) {
      result = false;
    } else {
      if (allowCoercion) {
        result = ignoreCase
          ? queryValue.toString().toLowerCase() ==
            value.toString().toLowerCase()
          : queryValue == value;
      } else {
        result = ignoreCase
          ? queryValue.toString().toLowerCase() ===
            value.toString().toLowerCase()
          : queryValue === value;
      }
    }
  }

  return result;
};

/**
 * Removes a query value from the search query. Will be set as empty string (which is null in a url).
 * @param {string} propertyName - The property to alter.
 */
Search.prototype.removeQueryValue = function(propertyName) {
  var self = this;

  if (self.newQuery.hasOwnProperty(propertyName)) {
    self.setQueryValue(propertyName, "");
  }
};

/**
 * Calculates a new query string using the latest query parameters. The url's query properties will be used unless overriden by the new query.
 * @returns {string} - The new query string.
 */
Search.prototype.calculateQueryString = function(extraQuery) {
  var self = this;

  //merge the new query with the old query, but not overwrite the original.
  var queryObj = $.extend({}, self.urlQuery, self.newQuery, extraQuery || {});

  // if Extenders defined, add them
  for (var i = 0; i < self.queryStringExtendCallbacks.length; i++) {
    //merge the new query with the old query, but not overwrite the original.
    $.extend(queryObj, self.queryStringExtendCallbacks[0].apply());
  }

  //remove any nulled properties
  for (var key in queryObj) {
    if (
      queryObj.hasOwnProperty(key) &&
      (queryObj[key] === null ||
        queryObj[key] === undefined ||
        queryObj[key].length === 0)
    ) {
      delete queryObj[key];
    }
  }

  var result = self.objectToQueryString(queryObj);

  return result;
};

/**
 * Converts a query string into an object. Note: the query string must comply with the search string rules.
 * @param {string} queryString - The query string to convert.
 * @returns {object} - A new js object.
 */
Search.prototype.queryStringToObject = function(queryString) {
  var result = {};

  if (queryString && queryString.length > 0) {
    $.map(queryString.replace(/(^\?)/, "").split("&"), function(n) {
      if (!n) return result;
      return (n = n.split("=")), (result[n[0]] = n[1]);
    });
  }

  return result;
};

/**
 * Converts an object into a query string (only one level deep).
 * @param {object} obj - The object to convert.
 * @returns {string} - A query string.
 */
Search.prototype.objectToQueryString = function(obj) {
  var self = this;
  var result = "";

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      if (value !== "undefined") {
        if (typeof value === "string") {
          for (var specialCharacter in self.specialCharacters) {
            value = value.replace(
              new RegExp("\\" + specialCharacter, "g"),
              self.specialCharacters[specialCharacter]
            );
          }
        }
        result += String.format("&{0}={1}", key, value);
      }
    }
  }

  if (result.length > 0) {
    result = result.substring(1); //remove the first '&' symbol
  }

  return result;
};

/**
 * Updates the base get results url, sometimes we may not want to hit the search controller.
 * @param {string} newUrl - The new url to set the base url to.
 */
Search.prototype.updateBaseGetResultsUrl = function(newUrl) {
  var self = this;
  self.serviceUrl = newUrl;
};

/**
 * A dictionary to represent the query string properties.
 */
Search.prototype.queryProperty = {
  sort: "sort",
  tab: "tab",
  template: "template",
  number: "num",
  page: "pg",
  search: "q",
  facet: "f",
  zone: "zone",
  searchMode: "mode",
  pageType: "pageType",
  mapZoomAndCentre: "map",
  mapLayers: "ml"
};

/**
 * A dictionary used to identify what requested an update of the results.
 */
Search.prototype.updateRequestSender = {
  unkown: "unknown" /* The request did not say who they were... */,
  facetPanel: "facetPanel",
  filterTab:
    "filterTab" /*The tabs at the top of the page which will apply a collection of facets to the search. */,
  numberOfResults:
    "numberOfResults" /* Choosing how many results to display in each page. */,
  options: "options" /* A generic request sender. */,
  pageLoad:
    "pageLoad" /* Upon the page loading and sending an initial search request. */,
  pagination: "pagination" /* Switching between a result's pages. */,
  scroller:
    "scroller" /* When scrolling to the bottom of the search results, forcing a request for more results. */,
  searchBar: "searchBar" /* Someone has typed a search and submitted it. */,
  sort: "sort",
  template: "template",
  explorer: "explorer",
  map: "map",
  mapLayer: "mapLayer",
  dontSearch:
    "dontSearch" /* Don't actually run a search but do the rest of the update - used if you want to load the facet panel without getting results.*/
};
