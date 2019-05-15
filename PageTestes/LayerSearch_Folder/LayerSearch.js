/* global define, console, setTimeout, clearTimeout */
/* jshint undef: true */
/* jshint unused: true */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/Deferred",
  "dojo/_base/event",
  "dojo/_base/array",
  "dojo/dom-attr",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/keys",
  "dojo/on",
  "dojo/query",
  "dojo/text!./Layer-Search.html",
  "dojo/uacss",
  "dijit/a11yclick",
  "dijit/_TemplatedMixin",
  "dijit/focus",
  "esri/SpatialReference",
  "esri/graphic",
  "esri/dijit/_EventedWidget",
  "esri/geometry/Point",
  "esri/geometry/Extent",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/tasks/FindParameters",
  "esri/tasks/FindTask"
], function(
  declare,
  lang,
  Deferred,
  event,
  arrayUtil,
  domAttr,
  domClass,
  domStyle,
  domConstruct,
  keys,
  on,
  query,
  template,
  has,
  a11yclick,
  _TemplatedMixin,
  focusUtil,
  SpatialReference,
  Graphic,
  _EventedWidget,
  Point,
  Extent,
  esriQuery,
  QueryTask,
  FindParameters,
  FindTask
) {
  var Widget = declare(
    "als.dijit.LayerSearch",
    [_EventedWidget, _TemplatedMixin],
    {
      // Set template file HTML
      templateString: template,
      // On to Connect Event Mapping
      _eventMap: {
        select: ["feature", "resultName"],
        "find-results": ["results"],
        "auto-complete": ["results"],
        "layersearch-select": ["layerSearcher"],
        clear: true,
        "enter-key-select": true,
        load: true
      },
      // init
      constructor: function(options, srcRefNode) {
        // class names
        this._css = {
          LayerSearcherContainerClass: "esriLayerSearcherContainer",
          LayerSearcherClass: "esriLayerSearcher",
          LayerSearcherMultipleClass: "esriLayerSearcherMultiple",
          LayerSearcherIconClass: "esriLayerSearcherIcon",
          LayerSearcherActiveClass: "esriLayerSearcherActive",
          LayerSearcherResultsOpenClass: "esriLayerSearcherResultsOpen",
          LayerSearcherMenuOpenClass: "esriLayerSearcherMenuOpen",
          loadingClass: "esriLayerSearcherLoading",
          resultsContainerClass: "esriLayerSearcherResults",
          resultsItemClass: "esriLayerSearcherResult",
          resultsItemEvenClass: "esriLayerSearcherResultEven",
          resultsItemOddClass: "esriLayerSearcherResultOdd",
          resultsItemFirstClass: "esriLayerSearcherResultFirst",
          resultsItemLastClass: "esriLayerSearcherResultLast",
          resultsPartialMatchClass: "esriLayerSearcherResultPartial",
          searchButtonClass: "esriLayerSearcherSearch",
          clearButtonClass: "esriLayerSearcherReset",
          hasValueClass: "esriLayerSearcherHasValue",
          layerSearcherMenuClass: "esriLayerSearcherMenu",
          layerSearcherMenuHeaderClass: "esriLayerSearcherMenuHeader",
          layerSearcherMenuCloseClass: "esriLayerSearcherMenuClose",
          activeMenuClass: "esriLayerSearcherMenuActive",
          layerSearcherMenuArrowClass: "esriLayerSearcherMenuArrow",
          layerSearcherSelectedClass: "esriLayerSearcherSelected",
          layerSearcherSelectedCheckClass: "esriLayerSearcherSelectedCheck",
          LayerSearcherClearClass: "esriLayerSearcherClearFloat"
        };
        // default settings
        this.options = {
          autoComplete: false, // show autoComplete?
          value: "", // Value of input
          theme: "simpleLayerSearcher", // Theme
          activeLayerSearcherIndex: 0,
          maxLocations: 6, // Maximum result locations to return
          minCharacters: 3, // Minimum amount of characters before searching
          searchDelay: 300, // Delay before doing the query. To avoid being too chatty.
          layerMenu: true,
          autoNavigate: true, // Automatically navigate
          showResults: true, // show result suggestions
          map: null,
          activeLayerSearcher: null,
          zoomScale: 10000,
          // new
          layerSearchers: []
          /*qLayerId: null,
                qLayerLayers: [],
                qFields: [],
                qOIDField: 'OBJECTID',
                qOutfields: [], // qFields and qOIDField automatically included
                qLabelFunction: null // can only use fields that were in qFields, qOIDField, and qOutfields above
*/
        };
        // mix in settings and defaults
        var defaults = lang.mixin({}, this.options, options);
        // settings
        this.set("autoComplete", defaults.autoComplete);
        this.set("value", defaults.value);
        this.set("theme", defaults.theme);
        this.set("activeLayerSearcherIndex", defaults.activeLayerSearcherIndex);
        this.set("maxLocations", defaults.maxLocations);
        this.set("minCharacters", defaults.minCharacters);
        this.set("searchDelay", defaults.searchDelay);
        this.set("layerMenu", defaults.layerMenu);
        this.set("autoNavigate", defaults.autoNavigate);
        this.set("showResults", defaults.showResults);
        this.set("map", defaults.map);
        this.set("activeLayerSearcher", defaults.activeLayerSearcher);
        this.set("layerSearchers", defaults.layerSearchers);
        this.set("zoomScale", defaults.zoomScale);
        // new
        /*this.set("qLayerId", defaults.qLayerId);
            this.set("qLayerLayers", defaults.qLayerLayers);
            this.set("qFields", defaults.qFields);
            this.set("qOIDField", defaults.qOIDField);
            this.set("qOutfields", defaults.qOutfields);
            this.set("qLabelFunction", defaults.qLabelFunction);*/
        // results holder
        this.set("results", []);
        // deferreds
        this._deferreds = [];
        // default Spatial Ref
        this._defaultSR = new SpatialReference(4326);
        // watch updates of public properties and update the widget accordingly
        this.watch("value", this._updateValue);
        this.watch("theme", this._updateTheme);
        this.watch("activeLayerSearcher", this._setActiveLayerSearcher);
        this.watch(
          "activeLayerSearcherIndex",
          this._setActiveLayerSearcherIndex
        );
        this.watch("layerSearchers", this._updateLayerSearcher);
        this.watch("layerMenu", this._updateLayerSearcher);
        this.watch("map", this._setupEvents);
        // widget node
        this.domNode = srcRefNode;
      },
      /* ---------------- */
      /* Public Functions */
      /* ---------------- */
      // start widget
      startup: function() {
        if (!this.layerSearchers.length) {
          console.log("LayerSearch:: No layerSearchers defined.");
          this.destroy();
          return;
        }
        if (!this.domNode) {
          console.log("LayerSearcher:: domNode is undefined.");
          this.destroy();
          return;
        }
        // if map is in options
        if (this.get("map")) {
          // once map is loaded
          if (this.get("map").loaded) {
            this._init();
          } else {
            on.once(
              this.get("map"),
              "load",
              lang.hitch(this, function() {
                this._init();
              })
            );
          }
        } else {
          // lets go
          this._init();
        }
      },
      // post create widget function
      postCreate: function() {
        this.inherited(arguments);
        // submit button
        this.own(
          on(this.submitNode, a11yclick, lang.hitch(this, this._findThenSelect))
        );
        // layerSearcher menu
        this.own(
          on(
            this.layerSearcherMenuArrowNode,
            a11yclick,
            lang.hitch(this, this._toggleLayerSearcherMenu)
          )
        );
        // input click
        this.own(
          on(this.inputNode, a11yclick, lang.hitch(this, this._inputClick))
        );
        // clear text
        this.own(on(this.clearNode, a11yclick, lang.hitch(this, this.clear)));
        // hide menu
        this.own(
          on(
            this.layerSearcherMenuCloseNode,
            a11yclick,
            lang.hitch(this, this._hideLayerSearcherMenu)
          )
        );
        // build layerSearcher list
        this._updateLayerSearcher();
        // setup connections
        this._setupEvents();
        // add clear button if already populated
        if (this.get("value")) {
          this._checkStatus();
        }
        // hide menus
        this._hideMenus();
      },
      destroy: function() {
        this._removeEvents();
        // remove html
        domConstruct.empty(this.domNode);
        this.inherited(arguments);
      },
      // clear the input box
      clear: function() {
        // clear event
        this.onClear();
        // empty input value
        domAttr.set(this.inputNode, "value", "");
        // set current text
        this.set("value", "");
        // empty results
        this.set("results", []);
        // get node of reset button and remove it's active class
        domClass.remove(this.containerNode, this._css.hasValueClass);
        domAttr.set(this.clearNode, "title", "");
        // remove active menus
        this._hideMenus();
        // hide loading
        this._hideLoading();
        // placeholder
        domClass.remove(this.inputNode, "query-error");
        domAttr.set(this.inputNode, "placeholder", this._placeholder);
        this.focus();
      },
      // show widget
      show: function() {
        domStyle.set(this.domNode, "display", "block");
      },
      // hide widget
      hide: function() {
        domStyle.set(this.domNode, "display", "none");
      },
      // submit button selected
      find: function(search) {
        // set deferred variable
        var def = new Deferred();
        if (search) {
          if (typeof search === "string") {
            // search string
            this._findQuery(search).then(function(resp) {
              def.resolve(resp);
            });
          } else {
            def.reject("LayerSearcher:: Invalid find type");
          }
        } else {
          // default use text string of input
          this._findQuery(this.get("value")).then(function(resp) {
            def.resolve(resp);
          });
        }
        // give me my deferred
        return def.promise;
      },
      // focus on input
      focus: function() {
        focusUtil.focus(this.inputNode);
      },
      // blur input
      blur: function() {
        // if current focus exists
        if (focusUtil.curNode) {
          // remove focus
          focusUtil.curNode.blur();
        }
        // remove focus from input node
        this.inputNode.blur();
        // hide any menus
        this._hideMenus();
      },
      // go to a location
      select: function(e) {
        // event
        // hide menus
        this._hideMenus();
        // hide loading spinner
        this._hideLoading();
        // has extent and autoNavigate
        if (e && e.hasOwnProperty("oid") && this.get("map")) {
          var query = new esriQuery();
          query.objectIds = [e.oid];
          query.returnGeometry = true;

          var selectQueryUrl = this.get("map").getLayer(
            this.get("activeLayerSearcher").qLayerId
          ).url;
          if (e.hasOwnProperty("layerNum")) {
            selectQueryUrl += "/" + e.layerNum;
          }
          var selectQueryTask = new QueryTask(selectQueryUrl);
          selectQueryTask.execute(query).then(
            lang.hitch(this, function(response) {
              var selectedFeature;
              if (
                response &&
                response.features &&
                (selectedFeature = response.features[0])
              ) {
                this.onSelect(selectedFeature, e.name);
                if (this.get("autoNavigate")) {
                  this.centerOnFeature(selectedFeature);
                }
              }
            }),
            lang.hitch(this, function(response) {
              console.debug("error");
            })
          );
        }
      },
      centerOnFeature: function(f) {
        var fGeometry = f.geometry;
        if (fGeometry.type === "point") {
          this.get("map").centerAndZoom(fGeometry, 12);
        } else {
          this.get("map").setExtent(fGeometry.getExtent().expand(1.5), true);
        }
      },
      /* ---------------- */
      /* Public Events */
      /* ---------------- */
      // called after search has been selected
      onSelect: function() {},
      // called on results
      onFindResults: function() {},
      // called on results
      onAutoComplete: function() {},
      // when layerSearcher selected
      onLayerSearcherSelect: function() {},
      // when layerSearcher selected
      onClear: function() {},
      // on enter key
      onEnterKeySelect: function() {},
      // widget loaded
      onLoad: function() {},
      /* ---------------- */
      /* Private Functions */
      /* ---------------- */
      _init: function() {
        // set widget ready
        this.set("loaded", true);
        // loaded
        this.onLoad();
      },
      _findQuery: function(search) {
        var def = new Deferred();
        // query and then Locate
        this._query({
          delay: 0,
          search: search
        }).then(
          lang.hitch(this, function(response) {
            // emit event with response
            this.onFindResults(response);
            def.resolve(response);
          }),
          lang.hitch(this, function(error) {
            // emit result error
            this.onFindResults(error);
            def.reject(error);
          })
        );
        return def.promise;
      },

      // sets current locator object
      _setActiveLayerSearcher: function() {
        // set current active layerSearcher object
        this.set(
          "activeLayerSearcher",
          this._layerSearchers[this.get("activeLayerSearcherIndex")]
        );
        var actLyrSrch = this.get("activeLayerSearcher");
        // create query or find task
        if (actLyrSrch.qLayerLayers && actLyrSrch.qLayerLayers.length) {
          this._task = new FindTask(
            this.get("map").getLayer(actLyrSrch.qLayerId).url
          );
        } else {
          this._task = new QueryTask(
            this.get("map").getLayer(actLyrSrch.qLayerId).url
          );
        }
        // update placeholder nodes
        this._updatePlaceholder();
      },
      // Combine and count all layerSearchers
      _setLayerSearcherList: function() {
        this._layerSearchers = this.get("layerSearchers");
      },
      // Update layerSearcher nodes
      _updateLayerSearcher: function() {
        this.set("activeLayerSearcherIndex", 0);
        this._setLayerSearcherList();
        this._setActiveLayerSearcher();
        this._insertLayerSearcherMenuItems();
      },
      // Update placeholder nodes
      _updatePlaceholder: function() {
        // reset placehodler text to nothing
        this._placeholder = "";
        // if placeholder of active layerSearcher is set
        if (
          this.get("activeLayerSearcher") &&
          this.get("activeLayerSearcher").placeholder
        ) {
          // set placeholder to active layerSearcher placeholder
          this._placeholder = this.get("activeLayerSearcher").placeholder;
        }
        // set placeholder onto nodes
        domAttr.set(this.inputNode, "placeholder", this._placeholder);
        domAttr.set(this.submitNode, "title", this._placeholder);
      },
      // update value of text box
      _updateValue: function() {
        var newVal = arguments[2];
        // If we want to update value of input
        if (!this._ignoreUpdateValue) {
          domAttr.set(this.inputNode, "value", newVal);
          // check input box's status
          this._checkStatus();
        }
      },
      // update theme
      _updateTheme: function() {
        var oldVal = arguments[1];
        var newVal = arguments[2];
        domClass.remove(this.domNode, oldVal);
        domClass.add(this.domNode, newVal);
      },
      // change active layerSearcher
      _setActiveLayerSearcherIndex: function() {
        var oldVal = arguments[1];
        var newVal = arguments[2];
        this.set("activeLayerSearcherIndex", newVal);
        // set layerSearcher object
        this._setActiveLayerSearcher();
        this._hideMenus();
        this._insertLayerSearcherMenuItems();
        // event object
        var evt = {
          attr: this.get("activeLayerSearcher"),
          oldVal: oldVal,
          newVal: newVal
        };
        // emit event
        this.onLayerSearcherSelect(evt);
      },
      // clear timeout for query
      _clearQueryTimeout: function() {
        // if timer exists
        if (this._queryTimer) {
          // remove timeout
          clearTimeout(this._queryTimer);
        }
      },
      // query for results and then execute a function
      _query: function(e) {
        // default query object
        if (!e) {
          // immediate, no delay
          e = {
            delay: 0
          };
        }
        // default search query
        if (!e.search) {
          e.search = this.get("value");
        }
        // set deferred variable if needed to cancel it
        var def = new Deferred();
        def.then(
          function() {
            // silent callback.
          },
          function() {
            // less silent errback.
            console.warn("def errback");
            console.warn(arguments);
            return [];
          }
        );
        this._deferreds.push(def);
        // if we have a delay
        if (e.delay) {
          // clear timeout for query
          this._clearQueryTimeout();
          // timeout
          this._queryTimer = setTimeout(
            lang.hitch(this, function() {
              // start the task
              this._performTask(def, e);
              // set timer to null
              this._queryTimer = null;
            }),
            e.delay
          );
        } else {
          // start the task
          this._performTask(def, e);
        }
        return def.promise;
      },
      // when layerSearcher search starts
      _performTask: function(def, e) {
        var actLyrSrch = this.get("activeLayerSearcher");
        // if query isn't empty
        if (e.search) {
          // hide menu to toggle layerSearcher
          this._hideLayerSearcherMenu();
          // show loading spinner
          this._showLoading();
          // query or find parameters
          var params, taskType;
          if (actLyrSrch.qLayerLayers && actLyrSrch.qLayerLayers.length) {
            params = new FindParameters();
            params.layerIds = actLyrSrch.qLayerLayers;
            params.searchFields = actLyrSrch.qFields;
            params.searchText = e.search;
            taskType = "find";
          } else {
            params = new esriQuery();
            params.outFields = actLyrSrch.qFields.concat(actLyrSrch.qOutfields);
            params.outFields.push(actLyrSrch.qOIDField);
            var whereArr = actLyrSrch.qFields.map(function(qField) {
              return "UPPER(" + qField + ") LIKE UPPER('%" + e.search + "%')";
            });
            params.where = whereArr.join(" OR ");
            taskType = "query";
          }
          params.returnGeometry = false;
          // within extent
          /*if (this.get("activeLayerSearcher").searchExtent) {
                    params.geometry = this.get("activeLayerSearcher").searchExtent;
                }*/
          this._task.execute(params).then(
            lang.hitch(this, function(response) {
              this._receivedResults(response, def, taskType, e);
            }),
            lang.hitch(this, function(response) {
              this._receivedResults(response, def, taskType, e);
            })
          );
        } else {
          this._hideLoading();
          def.reject("LayerSearcher:: no search to perform");
        }
      },
      // called on AC Results
      _showResults: function() {
        // hide menu to toggle layerSearcher
        this._hideLayerSearcherMenu();
        // string to set
        var html = "";
        // if results and result node
        if (
          this.get("results") &&
          this.get("results").length &&
          this.resultsNode
        ) {
          // textbox value
          var partialMatch = this.get("value"),
            i;
          // partial match highlight
          var r = new RegExp("(" + partialMatch + ")", "gi");
          html += '<ul role="presentation">';
          // for each result
          for (
            i = 0;
            i < this.get("results").length && i < this.get("maxLocations");
            ++i
          ) {
            // location text
            var text =
              this.get("results")[i].text || this.get("results")[i].name;
            // set layer class
            var layerClass = this._css.resultsItemClass + " ";
            // if it's odd
            if (i % 2 === 0) {
              // set it to odd
              layerClass += this._css.resultsItemOddClass;
            } else {
              // even
              layerClass += this._css.resultsItemEvenClass;
            }
            if (i === 0) {
              // first item
              layerClass += " " + this._css.resultsItemFirstClass;
            } else if (i === this.get("results").length - 1) {
              // last item
              layerClass += " " + this._css.resultsItemLastClass;
            }
            // create list item
            html +=
              '<li title="' +
              text +
              '" data-text="' +
              text +
              '" data-item="true" data-index="' +
              i +
              '" role="menuitem" tabindex="0" class="' +
              layerClass +
              '">' +
              text.replace(
                r,
                '<strong class="' +
                  this._css.resultsPartialMatchClass +
                  '">$1</strong>'
              ) +
              "</li>";
          }
          // close list
          html += "</ul>";
          // insert HTML
          if (this.resultsNode) {
            this.resultsNode.innerHTML = html;
          }
          this._autoCompleteEvent();
          // show!
          this._showResultsMenu();
        } else {
          // set to blank HTML string
          if (this.resultsNode) {
            this.resultsNode.innerHTML = html;
          }
          // hide menu
          this._hideResultsMenu();
        }
      },
      // ac query
      _autoComplete: function() {
        // query with delay set
        this._query({
          delay: this.get("searchDelay"),
          autoComplete: true,
          search: this.get("value")
        }).then(
          lang.hitch(this, function(response) {
            // emit autocomplete event
            this.onAutoComplete(response);
            if (this.get("showResults")) {
              // show results if allowed
              this._showResults(response);
            }
          })
        );
      },
      // received results
      _receivedResults: function(response, def, taskType) {
        // hide loading spinner
        this._hideLoading();
        // convert results to desired format
        var results = this._hydrateResults(response, taskType);
        // save results
        this.set("results", results);
        // results object
        var obj = {
          results: results,
          value: this.get("value")
        };
        def.resolve(obj);
      },
      // show loading spinner
      _showLoading: function() {
        domClass.add(this.containerNode, this._css.loadingClass);
      },
      // hide loading spinner
      _hideLoading: function() {
        domClass.remove(this.containerNode, this._css.loadingClass);
      },
      // show layerSearcher selection menu
      _showLayerSearcherMenu: function() {
        // add class to container
        domClass.add(this.containerNode, this._css.activeMenuClass);
        domClass.add(this.domNode, this._css.LayerSearcherMenuOpenClass);
        // display menu node
        domStyle.set(this.layerSearcherMenuNode, "display", "block");
        // aria
        domAttr.set(this.layerSearcherMenuInsertNode, "aria-hidden", "false");
        domAttr.set(this.layerSearcherMenuArrowNode, "aria-expanded", "true");
      },
      // hide layerSearcher selection menu
      _hideLayerSearcherMenu: function() {
        domClass.remove(this.containerNode, this._css.activeMenuClass);
        domClass.remove(this.domNode, this._css.LayerSearcherMenuOpenClass);
        domStyle.set(this.layerSearcherMenuNode, "display", "none");
        // aria
        domAttr.set(this.layerSearcherMenuInsertNode, "aria-hidden", "true");
        domAttr.set(this.layerSearcherMenuArrowNode, "aria-expanded", "false");
      },
      // toggle layerSearcher selection menu
      _toggleLayerSearcherMenu: function() {
        // hide results
        this._hideResultsMenu();
        var display = domStyle.get(this.layerSearcherMenuNode, "display");
        // if layerSearcher menu is displayed
        if (display === "block") {
          this._hideLayerSearcherMenu();
        } else {
          this._showLayerSearcherMenu();
        }
      },
      // show autolocate menu
      _showResultsMenu: function() {
        // add class to container
        domClass.add(this.containerNode, this._css.LayerSearcherActiveClass);
        domClass.add(this.domNode, this._css.LayerSearcherResultsOpenClass);
        // show node
        domStyle.set(this.resultsNode, "display", "block");
        // aria
        domAttr.set(this.resultsNode, "aria-hidden", "false");
      },
      // hide the results menu
      _hideResultsMenu: function() {
        // hide
        domStyle.set(this.resultsNode, "display", "none");
        // add class to container
        domClass.remove(this.containerNode, this._css.LayerSearcherActiveClass);
        domClass.remove(this.domNode, this._css.LayerSearcherResultsOpenClass);
        // aria
        domAttr.set(this.resultsNode, "aria-hidden", "true");
      },
      // hide both menus
      _hideMenus: function() {
        this._hideLayerSearcherMenu();
        this._hideResultsMenu();
      },
      // create menu for changing active layerSearcher
      _insertLayerSearcherMenuItems: function() {
        if (
          this.get("layerMenu") &&
          this._layerSearchers &&
          this._layerSearchers.length > 1
        ) {
          var html = "";
          var layerClass = "",
            i;
          html += '<ul role="presentation">';
          for (i = 0; i < this._layerSearchers.length; i++) {
            // set layer class
            layerClass = this._css.resultsItemClass + " ";
            // if it's odd
            if (i % 2 === 0) {
              // set it to odd
              layerClass += this._css.resultsItemOddClass;
            } else {
              // even
              layerClass += this._css.resultsItemEvenClass;
            }
            if (i === this.get("activeLayerSearcherIndex")) {
              // currently selected layerSearcher
              layerClass += " " + this._css.layerSearcherSelectedClass;
            }
            if (i === 0) {
              // first in list
              layerClass += " " + this._css.resultsItemFirstClass;
            } else if (i === this._layerSearchers.length - 1) {
              // last in list
              layerClass += " " + this._css.resultsItemLastClass;
            }
            // layerSearcher name
            var layerSearcherName =
              this._layerSearchers[i].name || "Layer Search";
            // create list item
            html +=
              '<li data-index="' +
              i +
              '" data-item="true" role="menuitem" tabindex="0" class="' +
              layerClass +
              '">';
            html +=
              '<div class="' +
              this._css.layerSearcherSelectedCheckClass +
              '"></div>';
            html += layerSearcherName;
            html +=
              '<div class="' + this._css.LayerSearcherClearClass + '"></div>';
            html += "</li>";
          }
          // close list
          html += "</ul>";
          this.layerSearcherMenuInsertNode.innerHTML = html;
          // create menu event
          this._layerSearcherMenuEvent();
          // set display for nodes
          domStyle.set(this.layerSearcherMenuNode, "display", "none");
          domStyle.set(this.layerSearcherMenuArrowNode, "display", "block");
          // add class
          domClass.add(
            this.containerNode,
            this._css.LayerSearcherMultipleClass
          );
        } else {
          // remove html
          this.layerSearcherMenuInsertNode.innerHTML = "";
          // set display for nodes
          domStyle.set(this.layerSearcherMenuNode, "display", "none");
          domStyle.set(this.layerSearcherMenuArrowNode, "display", "none");
          // add class
          domClass.remove(
            this.containerNode,
            this._css.LayerSearcherMultipleClass
          );
        }
      },
      // check input box's status
      _checkStatus: function() {
        // if input value is not empty
        if (this.get("value")) {
          // add class to dom
          domClass.add(this.containerNode, this._css.hasValueClass);
          // set class and title
          domAttr.set(this.clearNode, "title", "Clear Search");
        } else {
          // clear address
          this.clear();
        }
      },
      _autoCompleteEvent: function() {
        // list items
        var lists = query('[data-item="true"]', this.resultsNode);
        // remove event
        if (this._acEvent) {
          this._acEvent.remove();
        }
        // list item click
        this._acEvent = on(
          lists,
          "click, keydown",
          lang.hitch(this, function(e) {
            // clear timeout for query
            this._clearQueryTimeout();
            // index of list item
            var resultIndex = parseInt(
              domAttr.get(e.currentTarget, "data-index"),
              10
            );
            // input box text
            var locTxt = domAttr.get(e.currentTarget, "data-text");
            // next/previous index
            var newIndex;
            if (
              e.type === "click" ||
              (e.type === "keydown" && e.keyCode === keys.ENTER)
            ) {
              // set input text value to text
              domAttr.set(this.inputNode, "value", locTxt);
              // set current text var
              this.set("value", locTxt);
              // we have results and index
              if (this.get("results") && this.get("results")[resultIndex]) {
                // result
                var result = this.get("results")[resultIndex];
                // if result has name
                if (result.name) {
                  // select result
                  this.select(result);
                } else {
                  // its a a suggest result
                  var text = result.text;
                  // new immediate query for result
                  var params = {
                    delay: 0,
                    search: text
                  };
                  // perform query
                  this._query(params).then(
                    lang.hitch(this, function(response) {
                      // select location
                      this.select(response.results[0]);
                    })
                  );
                }
              }
            } else if (
              e.type === "keydown" &&
              (e.keyCode === keys.BACKSPACE || e.keyCode === keys.DELETE)
            ) {
              event.stop(e);
              this.inputNode.focus();
              // backspace from current value
              var newVal = this.inputNode.value.slice(0, -1);
              domAttr.set(this.inputNode, "value", newVal);
              this.set("value", newVal);
            } else if (e.type === "keydown" && e.keyCode === keys.UP_ARROW) {
              event.stop(e);
              // go to previous item
              newIndex = resultIndex - 1;
              // if first item
              if (newIndex < 0) {
                // go back to input
                this.inputNode.focus();
              } else {
                // go to previous item
                lists[newIndex].focus();
              }
            } else if (e.type === "keydown" && e.keyCode === keys.DOWN_ARROW) {
              event.stop(e);
              // go to next item
              newIndex = resultIndex + 1;
              // if last item
              if (newIndex >= lists.length) {
                // go to input node
                this.inputNode.focus();
              } else {
                // go to next item
                lists[newIndex].focus();
              }
            } else if (e.keyCode === keys.ESCAPE) {
              // esc key
              // hide menus
              this._hideMenus();
            }
          })
        );
      },
      _layerSearcherMenuEvent: function() {
        // list items
        var lists = query(
          '[data-item="true"]',
          this.layerSearcherMenuInsertNode
        );
        // remove event
        if (this._gmEvent) {
          this._gmEvent.remove();
        }
        // select layerSearcher item
        this._gmEvent = on(
          lists,
          "click, keydown",
          lang.hitch(this, function(e) {
            // index of list item
            var resultIndex = parseInt(
              domAttr.get(e.currentTarget, "data-index"),
              10
            );
            // next/previous index
            var newIndex;
            if (
              e.type === "click" ||
              (e.type === "keydown" && e.keyCode === keys.ENTER)
            ) {
              // change to layerSearcher
              this._setActiveLayerSearcherIndex(null, null, resultIndex);
              this._hideLayerSearcherMenu();
            } else if (e.type === "keydown" && e.keyCode === keys.UP_ARROW) {
              event.stop(e);
              // go to previous item
              newIndex = resultIndex - 1;
              if (newIndex < 0) {
                this.layerSearcherMenuArrowNode.focus();
              } else {
                lists[newIndex].focus();
              }
            } else if (e.type === "keydown" && e.keyCode === keys.DOWN_ARROW) {
              event.stop(e);
              // go to next item
              newIndex = resultIndex + 1;
              if (newIndex >= lists.length) {
                this.layerSearcherMenuArrowNode.focus();
              } else {
                lists[newIndex].focus();
              }
            } else if (e.keyCode === keys.ESCAPE) {
              // esc key
              this._hideLayerSearcherMenu();
            }
          })
        );
      },
      _removeEvents: function() {
        var i;
        // if delegations
        if (this._events && this._events.length) {
          // disconnect all events
          for (i = 0; i < this._events.length; i++) {
            this._events[i].remove();
          }
        }
        if (this._acEvent) {
          this._acEvent.remove();
        }
        if (this._gmEvent) {
          this._gmEvent.remove();
        }
        // array of all connections
        this._events = [];
      },
      // set up connections
      _setupEvents: function() {
        this._removeEvents();
        // close on click
        var closeOnClick = on(
          document,
          "click",
          lang.hitch(this, function(e) {
            this._hideResultsMenu(e);
          })
        );
        this._events.push(closeOnClick);
        // input key up
        var inputKeyUp = on(
          this.inputNode,
          "keyup",
          lang.hitch(this, function(e) {
            this._inputKeyUp(e);
          })
        );
        this._events.push(inputKeyUp);
        // input key down
        var inputKeyDown = on(
          this.inputNode,
          "keydown",
          lang.hitch(this, function(e) {
            this._inputKeyDown(e);
          })
        );
        this._events.push(inputKeyDown);
        // arrow key down
        var layerSearcherMenuButtonKeyDown = on(
          this.layerSearcherMenuArrowNode,
          "keydown",
          this._layerSearcherMenuButtonKeyDown()
        );
        this._events.push(layerSearcherMenuButtonKeyDown);
        // if map set
        if (this.get("map")) {
          var mapClick = on(
            this.get("map"),
            "click",
            lang.hitch(this, function() {
              this.blur();
            })
          );
          this._events.push(mapClick);
        }
        this._layerSearcherMenuEvent();
        this._autoCompleteEvent();
      },
      // find then immediately select first result
      _findThenSelect: function() {
        this.find().then(
          lang.hitch(this, function(response) {
            // if we have a result
            if (response.results && response.results.length) {
              // select result
              var topResult = response.results[0];
              this.select(topResult);
              domAttr.set(this.inputNode, "value", topResult.name);
              // set current text var
              this.set("value", topResult.name);

              // emit event
              this.onEnterKeySelect();
            } else {
              domClass.add(this.inputNode, "query-error");
              domAttr.set(this.inputNode, "value", "");
              this._ignoreUpdateValue = true;
              this.set("value", "");
              this._ignoreUpdateValue = false;
              domAttr.set(this.inputNode, "placeholder", "No results");
            }
          })
        );
      },
      // key up event on input box
      _inputKeyUp: function(e) {
        if (e) {
          // Reset timer between keys
          this._clearQueryTimeout();
          // get textbox value
          var aquery = this.inputNode.value;
          // don't update input
          this._ignoreUpdateValue = true;
          // update current text variable
          this.set("value", aquery);
          // update input
          this._ignoreUpdateValue = false;
          // length of value
          var alength = 0;
          // if value
          if (aquery) {
            // set length of value
            alength = aquery.length;
          }
          // ignored keys
          if (
            e.ctrlKey ||
            e.shiftKey ||
            e.metaKey ||
            e.altKey ||
            e.keyCode === keys.copyKey ||
            e.keyCode === keys.ALT ||
            e.keyCode === keys.CTRL ||
            e.keyCode === keys.META ||
            e.keyCode === keys.SHIFT ||
            e.keyCode === keys.UP_ARROW ||
            e.keyCode === keys.DOWN_ARROW ||
            e.keyCode === keys.LEFT_ARROW ||
            e.keyCode === keys.RIGHT_ARROW
          ) {
            return e;
          } else if (e && e.keyCode === keys.ENTER) {
            // if enter key was pushed
            this._cancelDeferreds();
            // query then Locate
            this._findThenSelect();
            // if up arrow pushed
          } else if (e && e.keyCode === keys.ESCAPE) {
            // esc key
            this._cancelDeferreds();
            this._hideMenus();
          } else if (e && e.keyCode === keys.TAB) {
            this._cancelDeferreds();
            this._hideMenus();
          } else if (
            this.get("autoComplete") &&
            alength >= this.get("minCharacters")
          ) {
            this._autoComplete();
          } else {
            // hide menus
            this._hideMenus();
          }
          // check status of search box
          this._checkStatus();
        }
      },
      // stop existing queries
      _cancelDeferreds: function() {
        if (this._deferreds.length) {
          arrayUtil.forEach(this._deferreds, function(def) {
            if (!def.isFulfilled() && !def.isResolved()) {
              //TODO: def.preventdefault? event.stop?
              // canceled requests just throw a bunch of errors. it's very sad.
              def.cancel("FeatureFinder:: stop query", true);
            }
          });

          this._deferreds = [];
        }
      },
      // key down event on input box
      _inputKeyDown: function(e) {
        var lists = query('[data-item="true"]', this.resultsNode);
        if (e && e.keyCode === keys.TAB) {
          this._cancelDeferreds();
          // hide menus if opened
          this._hideMenus();
          // stop
          return;
        } else if (e && e.keyCode === keys.UP_ARROW) {
          event.stop(e);
          // get list item length
          var listsLen = lists.length;
          // if not zero
          if (listsLen) {
            // go to previous list item
            lists[listsLen - 1].focus();
          }
        } else if (e && e.keyCode === keys.DOWN_ARROW) {
          event.stop(e);
          // if first item
          if (lists[0]) {
            // focus first item
            lists[0].focus();
          }
        }
      },
      // layerSearcher menu arrow key down
      _layerSearcherMenuButtonKeyDown: function(e) {
        var lists = query(
          '[data-item="true"]',
          this.layerSearcherMenuInsertNode
        );
        if (e && e.keyCode === keys.UP_ARROW) {
          event.stop(e);
          this._showLayerSearcherMenu();
          // get list item length
          var listsLen = lists.length;
          // if not zero
          if (listsLen) {
            // go to previous list item
            lists[listsLen - 1].focus();
          }
        } else if (e && e.keyCode === keys.DOWN_ARROW) {
          event.stop(e);
          this._showLayerSearcherMenu();
          // if first item
          if (lists[0]) {
            // focus first item
            lists[0].focus();
          }
        }
      },
      // input box clicked
      _inputClick: function() {
        // hide layerSearcher switch
        this._hideLayerSearcherMenu();
        // if input value is empty
        if (!this.get("value")) {
          // clear address
          this.clear();
          // hide menus
          this._hideMenus();
        }
        // check status of text box
        this._checkStatus();
      },
      _hydrateResult: function(e, actLyrSrch, actLyrSrchIdx, taskType) {
        // result to add
        var featAttributes =
          taskType === "find" ? e.feature.attributes : e.attributes;
        var oidField = Array.isArray(actLyrSrch.qOIDField)
          ? actLyrSrch.qOIDField[actLyrSrchIdx]
          : actLyrSrch.qOIDField;
        var newResult = {
          name: actLyrSrch.qLabelFunction(featAttributes, e.layerId),
          oid: featAttributes[oidField]
        };
        if (taskType === "find") {
          newResult.layerNum = e.layerId;
        }
        return newResult;
      },
      // create Extent and Graphic objects from JSON
      _hydrateResults: function(e, taskType) {
        // return results array
        var results = [],
          i = 0,
          newResult,
          actLyrSrch = this.get("activeLayerSearcher"),
          actLyrSrchIdx = this.get("activeLayerSearcherIndex");
        // if results

        var featArr = taskType === "find" ? e : e.features;

        if (featArr && featArr.length) {
          for (i; i < featArr.length && i < this.get("maxLocations"); i++) {
            newResult = this._hydrateResult(
              featArr[i],
              actLyrSrch,
              actLyrSrchIdx,
              taskType
            );
            // add to return array
            results.push(newResult);
          }
        }
        return results;
      }
    }
  );
  return Widget;
});
