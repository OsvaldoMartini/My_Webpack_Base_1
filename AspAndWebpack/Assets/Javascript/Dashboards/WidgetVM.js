/**
 * A view model for a widget.
 * @param {DOM} container - The DOM element that is holding this widget.
 * @param {string} dashboardType - The type of the dashboard e.g. Country, Company etc.
 * @param {KO} currentItem - The current subject e.g. China, Lockheed Martin etc.
 * @param {KO} showUnauthorizedWidgets - Whether or not to hide unauthorised widgets.
 * @param {string} categoryKey - sends the category key of a dashboard to the interested widgets
 * @param {function[]} @callback - A set of callback functions to call for specific events, such as widget removal.
 */
var WidgetVM = function (container, dashboardType, currentItem, showUnauthorizedWidgets, categoryKey, callbacks) {
    /** A reference to this object. i.e. the this keyword in C#. Safer than using '
     * this' everywhere in JavaScript as it can be misleading depending what function you are in e.g. a callback. */
    var self = this;

    /*******************************************************************************************************/
    /***************************************** PROPERTIES ******************************************/
    /*******************************************************************************************************/

    /** The HTML container holding the widget. */
    self.container = null;

    /** The id of the current item e.g. a country or company. */
    self.currentItem = ko.observable(null);

    /** The type of the dashboard e.g. Country or Company. */
    self.dashboardType = null;

    /** The area of HTML used to hold the widget's content.. */
    self.content = null;

    /** The URL for the service that the widget can call. e.g. To request content.. */
    self.contentUrl = null;

    /** The identification number for this dashboard widget. */
    self.id = null;

    /** Whether or not the widget belongs in the toolbox. */
    self.isToolboxItem = null;

    /** Whether this widget is expanded to full screen or not. **/
    self.isExpanded = false;

    /** Whether the widget needs to refresh its content when it expands. **/
    self.reloadOnExpand = false;

    /** The ratio to set the height to. **/
    self.heightRatio = null;

    /** The current column that the widget is located in **/
    self.column = 0;

    /** The current order that the widget is located in **/
    self.order = 0;

    /** If an action has overridden the URL we need to persist it. **/
    self.overridenUrl = undefined;

    /** If an action has overridden the URL arguments we need to persist it. **/
    self.overridenUrlArgs = undefined;

    /** Whether or not unauthorised widgets should be shown or hidden. **/
    self.showUnauthorizedWidgets = showUnauthorizedWidgets;

    /** The category key passed in from a dashboard. **/
    self.categoryKey = categoryKey;

    /** The default number of milli seconds before the widgetVM decides it is taking too long to load  **/
    self.timeoutMs = 30000;

    /** Whether the loading of the widget timed out. **/
    self.isTimedout = 0;

    /** Whether or not the dashboard is allowing widgets to be removed from it. i.e. to the toolbox. **/
    self.isDashboardRemovalAllowed = ko.observable(false);

    self.isLoading = ko.observable(false);

    /** A set of callbacks to the dashboard view model. **/
    self.callbacks = {
        removedEventCallback: function () { },
        minifyEventCallback: function () { },
        expandedEventCallback: function () { },
        addToDashboardCallback: function () { },
        addToCustomDashboardCallback: function () { },
        removeFromCustomDashboardCallback: function () { }
    };

    /*******************************************************************************************************/
    /*************************************** CONSTRUCTOR ****************************************/
    /*******************************************************************************************************/

    self.container = $(container);
    self.content = self.container.find(".widgetcontent");
    self.contentUrl = self.container.data("widget-content");
    self.errorUrl = self.container.data("widget-error");
    self.id = self.container.data("widget-id");
    self.reloadOnExpand = self.container.data("expand-reload");
    self.heightRatio = self.container.data("widget-height");
    self.callbacks = $.extend(self.callbacks, callbacks);
    self.dashboardType = dashboardType;
    self.currentItem = currentItem;
    self.javascriptObject = new WidgetBase();

    var widgetSubject;
    if (!currentItem.__ko_proto__ || (widgetSubject = self.container.data('widget-subject')))
    {
        self.currentItem = ko.observable(widgetSubject||'');
    }

    var actualPosition = self.getActualPosition();
    self.column = actualPosition.column;
    self.order = actualPosition.order;

    ko.applyBindings(self, self.container.get(0));

    self.isToolboxItem = !actualPosition.column;

    if (!self.isToolboxItem) {
        self.loadContent();
    }

    /**
     * Trickles subject change to widget content.
     */
    self.currentItem.subscribe(function (newValue) {
        self.javascriptObject.onSubjectChange(newValue);
    });

    self.setAsHover();
};

/*******************************************************************************************************/
/****************************************** FUNCTIONS ******************************************/
/*******************************************************************************************************/

/** Sends a request to the widgets service to retrieve the content used to populate itself.
**/
WidgetVM.prototype.loadContent = function () {
    var self = this;

    var url = self.overridenUrl || self.contentUrl;


    var args = self.overridenUrlArgs || { dashboardType: self.dashboardType, subject: self.currentItem(), widgetId: self.id, isExpanded: self.isExpanded, categoryKey: self.categoryKey };

    //Commands from the MVC actions do not know how to update the dynamic arguments. So do it for them.
    if (args.isExpanded !== undefined) {
        args.isExpanded = self.isExpanded;
    }

    self.isLoading(true);
    self.startLoadingAnimation();

    if (url.length > 0) {
        $.ajax({
            url: url,
            method: "GET",
            async: true,
            data: args,
            timeout: (self.isTimedout * 10000) + self.timeoutMs
        })
            .done(function (data) {
                self.isLoading(false);
                self.resize();
                self.content.html(data);
                self.javascriptObject.onWidgetLoaded(self);
                self.isTimedout = 0;
            })
            .fail(function (data, status) {

                //DO NOT REMOVE!!! Removing this assignment will break the code (to do with bundling and minifying)
                var annoyingBundling = self.isLoading(false);

                if (data.status === 403) {
                    if (self.showUnauthorizedWidgets) {
                        self.resize();
                        self.content.html(data.responseText);
                        self.javascriptObject.onWidgetLoaded(self);
                    } else {
                        self.container.remove();
                    }
                }
                else if (status === "timeout") {
                    //A timout message, allowing the user to reload the widget. Basically stops the page from locking up.
                    self.content.html("<div><div>This widget was taking too long to load.</div><br/><button class='btn btn-primary' data-bind='click : loadContent'>Reload</button></div>");
                    ko.applyBindings(self, self.content.find("div").get(0));
                    self.isTimedout += 1;
                    if (typeof CMP.Utils.ErrorLogging.ErrorLogging !== "undefined") {
                        CMP.Utils.ErrorLogging.ErrorLogging.logMessage("The dashboard widget " + self.id + " has failed to load within a reasonable time.", "/Assets/Javascript/Dashboards/WidgetVM.js");
                    }
                }
                else if (status !== "abort") {
                    self.loadErrorMessage();
                    if (typeof CMP.Utils.ErrorLogging.ErrorLogging !== "undefined") {
                        CMP.Utils.ErrorLogging.ErrorLogging.logMessage("The dashboard widget " + self.id + " has failed to load and has returned as an error.", "/Assets/Javascript/Dashboards/WidgetVM.js");
                    }
                }
            });
    }
};

/**
 * Called when a widget has started to move on the dashboard.
 */
WidgetVM.prototype.onWidgetMoveStart = function() {
    var self = this;
    self.javascriptObject.onWidgetMoveStart(self.content.get(0));
};

/**
 * Called when a widget has finished moving on the dashboard.
 */
WidgetVM.prototype.onWidgetMoveEnd = function () {
    var self = this;
    self.javascriptObject.onWidgetMoveEnd(self.content.get(0));
};

/**
 * Tries to retrieve an error message if the server call fails.
 */
WidgetVM.prototype.loadErrorMessage = function () {
    var self = this;
    $.ajax({
        url: self.errorUrl,
        method: "GET",
        async: true,
        cache: true
    })
        .done(function (data) {
            self.resize();
            self.content.html(data);
            self.javascriptObject.onWidgetLoaded(self);
        })
        .fail(function () {
            self.content.html("<div class=\"alert alert-danger text-center\">There is no data for this widget...</div>");
        });
};

/**
 * Recalculates the column and order indexes for this widget.
 * Informs the dashboard to send an update to the server.
 * @returns {boolean} - Whether or not the position has changed. 
 */
WidgetVM.prototype.recalculatePosition = function () {
    var self = this;
    var result = false;
    var actualPosition = self.getActualPosition();

    //If the position has changed inform the dashboard.
    if (self.column !== actualPosition.column || self.order !== actualPosition.order) {

        //If the widget is just being reordered in the toolbox, don't bother updating the server. It is done alphabetically anyway.
        if (self.column || actualPosition.column) {
            result = true;
        }

        self.column = actualPosition.column;
        self.order = actualPosition.order;

        // If the widget has timed out and is being moved from the toolbox to the page, try re loading the content.
        if (self.isToolboxItem && self.column && self.isTimedout && !self.isLoading()) {
            self.loadContent();
        }

        //check to see if in the toolbox
        self.isToolboxItem = !self.column;
    }

    return result;
};

/**
* This is called when the user clicks on the remove/delete icon.
* Informs the dashboard that it needs to re-evaluate all of the widgets.
*/
WidgetVM.prototype.remove = function () {
    var self = this;

    self.javascriptObject.onWidgetRemove();

    self.callbacks.removedEventCallback(self);

    //self.startLoadingAnimation();
};

/** If the widget has a height ration, then we need to resize it. */
WidgetVM.prototype.resize = function () {
    var self = this;

    if (self.isExpanded) {
        var contentPadding = (self.content.outerHeight() - self.content.height() + 2); //2 for the border....
        var fullHeight = self.container.outerHeight() - self.container.find(".widgetHeader").outerHeight() - contentPadding;
        self.content.height(fullHeight);
    } else if (self.heightRatio !== null && self.heightRatio !== undefined && self.heightRatio > 0) {
        var width = self.content.width();
        var maxHeight = window.innerHeight * 0.75; //for the header and padding. Need to think of a non hardcoded way of doing this.
        var height = width * self.heightRatio;

        if (height > maxHeight) {
            height = maxHeight;
        }

        self.content.height(height);
    } else {
        self.content.css("height", "auto");
    }
    self.javascriptObject.onWidgetResize(self.content.get(0));
};

/** Replace the widget content with a loading animation. */
WidgetVM.prototype.startLoadingAnimation = function () {
    var self = this;
    self.content.children().remove();
    self.content.html('<div class="widgetloading"><div class="loading"></div></div>');
}

/** This is called when the user clicks on the expand icon. Informs the dashboard that it needs to resize. */
WidgetVM.prototype.expand = function () {
    var self = this;

    self.isExpanded = true;
    $(".sortablecolumn").sortable("disable");

    self.container.addClass("max");
    $('body').addClass("max");

    self.resize();

    $('html, body').animate({
        scrollTop: $("#dvSortableArea").offset().top + 5
    }, 200);

    //Callback so the Dashboard can react to the change
    self.callbacks.expandedEventCallback(self);

    if (self.reloadOnExpand) {
        self.loadContent();
    }

    self.javascriptObject.onWidgetExpand(self.content.get(0));
};

/** This is called when the user clicks on the minify icon. Informs the dashboard that it needs to resize. */
WidgetVM.prototype.minify = function () {
    var self = this;

    self.isExpanded = false;

    self.resize();

    $(self.container).removeClass("max");
    $('body').removeClass("max");

    $('html, body').animate({
        scrollTop: self.content.offset().top - 48
    }, 200);

    $(".sortablecolumn").sortable("enable");

    //Callback so the Dasboard can react to the change
    self.callbacks.minifyEventCallback(self);

    if (self.reloadOnExpand) {
        self.loadContent();
    }

    self.javascriptObject.onWidgetMinify(self.content.get(0));
};

/** Determines and returns the column and order of the widget. */
WidgetVM.prototype.getActualPosition = function () {
    var self = this;
    var order = self.container.index();
    var column = self.container.parents('[data-widget-column]').data("widget-column");

    return { column: column, order: order };
};

/** This is called when the user clicks on the plus icon. Informs the dashboard that it needs to be remove from the toolbox to the dashboard. */
WidgetVM.prototype.addToDashboard = function () {
    var self = this;

    self.callbacks.addToDashboardCallback(self);
    setTimeout(function () { self.loadContent(); }, 300);
};

/**
 * Displays the modal containing the widget description.
 * @param {string} title - The title of the widget.
 * @param {string} description - The description of the widget.
 */
WidgetVM.prototype.showDescription = function (title, description) {
    var self = this;

    var $popup = $("#dvWidgetDescriptionModal");

    $popup.find(".modal-body").text(description);

    $popup.find(".modal-title").text(title);

    $popup.modal('show');
};

/**
 * Executes a funciton on a widgets associated javascript object. The object must be registered via the DashboardVM.registerObj function.
 * @param {string} funcName - The name of the function to execute
 * @param {object} args - A json object of arguments.
 */
WidgetVM.prototype.executeFunction = function (funcName, args) {
    var self = this;

    args = args || {};

    var widgetObject = self.javascriptObject;

    if (widgetObject !== null && widgetObject !== undefined) {
        var func = widgetObject[funcName];
        if (func !== null && func !== undefined) {
            func.apply(widgetObject, [args]);
        }
    }
};

/**
 * Executes an action on the server.
 * @param {string} url - The url to post to.
 * @param {object} args - A json object of arguments.
 * @param {string} actionType - The type dictates what the result of the action will do. e.g. reload the widget, display an alert or do nothing.
 */
WidgetVM.prototype.executeServerAction = function (url, args, actionType) {
    var self = this;

    args = args || {};

    if (url !== undefined && url !== null && actionType !== undefined && actionType !== null) {
        switch (actionType) {
            case "Alert":
                $.post(url, args, function (result) {
                    alert(result);
                });
                break;
            case "Post":
                $.post(url, args);
                break;
            case "Reload":
                self.overridenUrl = url;
                self.overridenUrlArgs = args;
                self.loadContent();
                break;
            default:
        }
    }
};

/**
 * Set the javascript object associated with the widget contents. Allows for specific events to be raised.
 * @param {obj} obj - A javascript object.
 */
WidgetVM.prototype.setJavascriptObj = function (obj) {
    var self = this;
    self.javascriptObject = obj;
    self.javascriptObject.widgetId = self.id;
    self.javascriptObject.updateSettings = self.updateWidgetSettings;
    self.javascriptObject.getContainer = function () {
        self.resize();
        return self.content;
    };
};

/**
 * Update the widget settings.
 * @param {string} key
 * @param {obj} value
 */
WidgetVM.prototype.updateWidgetSettings = function (key, value) {
    var self = this;

    if (typeof value !== 'string' && !(value instanceof String)) {
        value = JSON.stringify(value);
    }

    $.post("/Dashboard/UpdateWidgetSettings", { id: self.widgetId, key: key, value: value });
};

/**
 * Adds a widget to a custom dashboard.
 */
WidgetVM.prototype.addToCustomDashboard = function () {

    var self = this;

    self.callbacks.addToCustomDashboardCallback(self);
};

/**
 * Removes a widget from the custom dashboard.
 */
WidgetVM.prototype.removeFromCustomDashboard = function () {
    var self = this;

    self.callbacks.removeFromCustomDashboardCallback(self);

    ko.cleanNode(self.container.get(0));
    self.remove();
    self.container.remove();
};

/**
 * Adds listenner to widget for focus and hover to enable hover elements.
 */
WidgetVM.prototype.setAsHover = function() {
    var self = this;
    self.container
        .on('focus mouseenter', '*', function (e) {
            self.container.addClass('-hover');
        }).on('blur mouseleave', '*', function (e) {
            self.container.removeClass('-hover');
        });
}

/** Change the href location of a link*/
window.changeWidgetFooterLink = function (link, key, value) {
    if (!link || !link.is('a')) return;

    var href = link.attr('href');
    var hrefTemplate = link.data('href');
    if (!hrefTemplate) {
        hrefTemplate = href;
        if (href.indexOf('{0}')) {
            link.data('href', href);
        }
    }

    if (hrefTemplate.indexOf('{0}')) {
        var facet = '';
        if (typeof (key) == "string" && value == null) {
            link.attr('href', hrefTemplate.replace('{0}', key));
            return;
        }

        if (typeof(value) == "string" && typeof (key) == "string") {
            var temp = {};
            if(value) temp[key] = value;
            key = temp;
        }
        facet = Object.keys(key).reduce(function (facet, k, i, keys) {
            if (i) facet += "<and>";
            facet += k + '(' + key[k] + ')';
            return facet;
        }, facet);
        //if (value) facet = key + '(' + value + ')';
        link.attr('href', hrefTemplate.replace('{0}', facet))
    }
};