/**
 * A view model for the dashboard.
 * @param {object} options - A collection of options used by the dashboard view model.
 *      id : The identification number of the dashboard.
 *      name : The name of the dashboard.
 *      columns : How many columns the dashboard has. [Optional]
 *      currentItem : The current subject e.g. the company, country etc. [Optional]
 *      dashboardType : The type of the dashboard e.g. a company or country dashboard.
 *      commandUrls :
 *          updateWidgetsUrl : The url used for updating a widget's position.
 *          updateLayoutUrl : The url used to update the dashboards layout e.g. number of columns.
 */
DashboardVM = function (options) {

    /** A reference to this object. i.e. the this keyword in C#. Safer than using '
    * this' everywhere in javascript as it can be misleading depending what function you are in e.g. a callback. */
    var self = this;

    self.validateOptions(options);

    /*******************************************************************************************************/
    /***************************************** PROPERTIES ******************************************/
    /*******************************************************************************************************/

    /** The current dashboard's unique id. */
    self.dashboardId = null;

    /** The id of the current item e.g. a country or company. */
    self.currentItem = ko.observable();

    /** A collection of subjects, used to populate the dropdown. */
    self.subjectList = ko.observableArray([]);

    /** The Icon used in the title of the dashboard. */
    self.icon = null;

    /** The type of the dashboard e.g. Country or Company. */
    self.dashboardType = null;

    /** A collection of widgets currently on the page. Includes toolbox widgets. */
    self.widgets = [];

    /** A set of server command urls to call for specific events. e.g. removal of a widget. */
    self.commands = {};

    /** The dom container for the toolbox. */
    self.toolbox = null;

    /** A collection of custom user dashboards. **/
    self.customDashboards = ko.observableArray([]);

    /** A collection of widgets that need to be saved (temporary collection). **/
    self.widgetsToSaveToCustom = [];

    /** The name of the cookie used to determine whether the user has manually closed the popup or not. **/
    self.toolboxCookieName = "IHS_DASHBOARD_TOOLBOX_996E9A1A-D15A-4939-921C-97267E640B14";

    /** Whether or not to show any widgets the user does not have access to. Otherwise it will probably default to the standard error message. */
    self.showUnauthorizedWidgets = options.showUnauthorizedWidgets || false;

    self.isSubjectDynamic = false;

    /*******************************************************************************************************/
    /*************************************** CONSTRUCTOR ****************************************/
    /*******************************************************************************************************/
    self.commands = options.commandUrls;
    self.dashboardId = options.id;
    self.dashboardName = options.name;
    self.categoryKey = options.categoryKey;
    self.isManaged = options.isManaged;

    self.dashboardType = options.dashboardType;
    self.currentItem = ko.observable(options.currentItem);
    self.columns = ko.observable(options.columns || 3);

    self.toolbox = $("#dvWidgetsToolbox");

    self.tutorial = new TutorialVM({
        cookie: "IHS_POPUP_45A9BA72-7A6B-4FB7-8B8F-B556AABDADF6",
        name: "DashboardTutorial",
        maxPages: $('.startHint').length
    });

    var searchQuery = window.location.search.substring(1) + window.location.hash;
    self.search = new Search({
        queryString: searchQuery
    });
    
    var searchOptions = {
        redirect: true,
        enableSearchBarAutoComplete: true,
        categoryMapping: options.categoryMapping
    };

    self.searchBarVM = new SearchBarVM(self.search, searchOptions);


    self.setupSubjectChange();

    //Load the live area before the toolbox
    $("#dvLiveWidgetArea .widget")
        .each(function (i, widgetHolder) {
            self.setupWidget(widgetHolder);
        });

    //Toolbox
    if (!self.isManaged) {
        self.loadToolbox();
    }

    $(".subject-select select").chosen();

    self.recalculateColumnHeights();

    $(window)
        .on("resize",
            function () {
                self.recalculateColumnHeights();
                self.resizeWidgets();
            });

    if (window.settings !== undefined) {
        window.settings.settings.push(new SettingVM({
            Name: "ShowUnauthorizedWidgets",
            Type: 0,
            Title: "Show unsubscribed dashboard content",
            ReloadPage: true,
            Value: self.showUnauthorizedWidgets
        }));
    }
};

/*******************************************************************************************************/
/****************************************** FUNCTIONS ******************************************/
/*******************************************************************************************************/

DashboardVM.prototype.startTutorial = function () {
    var self = this;
    self.tutorial.start();
};

DashboardVM.prototype.loadToolbox = function () {
    var self = this;

    function onComplete() {
        self.setupSortable();
        self.recalculateColumnHeights();
        self.determineToolboxState(true);
        self.forEachWidget(function (widget) {
            widget.isDashboardRemovalAllowed(true);
        });
    };

    if (self.commands.loadToolbox) {
        var $toolboxContent = self.toolbox.find("#dvWidgetsToolboxContent");

        $toolboxContent.load(self.commands.loadToolbox,
            { dashboardType: self.dashboardType, subject: self.currentItem, categoryKey: self.categoryKey },
            function (responseText, textStatus, jqXHR) {
                if (textStatus === "error") {
                    $toolboxContent.html("An error has occurred!");
                } else {
                    $toolboxContent.find(".widget")
                        .each(function (i, widgetHolder) {
                            self.setupWidget(widgetHolder);
                        });
                }
                onComplete();
            });
    } else {
        onComplete();
    }
};

/**
 * Checks the options supplied to the functions and ensures that all required properties exist on them.
 * @param {object} options - A collection of properties and values.
 */
DashboardVM.prototype.validateOptions = function (options) {
    if (!options.id) {
        throw "id : The dashboard ID has not been defined!";
    }

    if (!options.name) {
        throw "name : The dashboard name has not been defined!";
    }

    if (!options.dashboardType) {
        throw "dashboardType : The dashboard type has not been defined!";
    }

    if (!options.commandUrls) {
        throw "commandUrls : The dashboard command urls have not been defined!";
    }

    if (!options.commandUrls.updateWidgetsUrl) {
        throw "updateWidgetsUrl : The update widget position url has not been defined!";
    }

    if (!options.commandUrls.updateLayoutUrl) {
        throw "updateLayoutUrl : The update dashboard columns url has not been defined!";
    }
};

/**
 * Recalculate the heights of the columns. e.g. if on a 2 column layout, hide column 3 and shift all of column 3's widgets to column 2.
 */
DashboardVM.prototype.recalculateColumnHeights = function (force) {

    var self = this;
    var numberOfColumns = self.columns();


    //calculate the minimum height of the columns (which is the height of the toolbox).
    var minHeight = 0;
    $("#dvWidgetsToolbox")
        .find(".widget")
        .each(function (j, widget) {
            minHeight = minHeight + $(widget).outerHeight(true);
        });

    if (force) {
        $("#dvLiveWidgetArea > .grid > .sortablecolumn")
            .each(function (i, col) {
                minHeight = Math.max($(col).height(), minHeight);
            });
    }

    $("#dvLiveWidgetArea > .grid > .sortablecolumn")
        .each(function (i, col) {
            var $column = $(col);
            var columnNumer = $column.data("widget-column");

            if (columnNumer > numberOfColumns) {
                $column.css("display", "none");
                var difference = columnNumer - numberOfColumns;
                //move the widgets to a visible column
                self.moveWidgetsToColumn(columnNumer, columnNumer - difference);
            } else {
                $column.css("display", "");
                $column.css("min-height", minHeight + "px");
            }
        });
};

/**
 * Trigger all widgets to resize
 */
DashboardVM.prototype.resizeWidgets = function () {

    var self = this;

    self.forEachWidget(function (widget) {
        widget.javascriptObject.onDashboardResize();
        widget.resize();
    });
};

/**
 * Move all of the widgets from a specific column to another column.
 * @param {int} columnFrom 
 * @param {int} columnTo 
 */
DashboardVM.prototype.moveWidgetsToColumn = function (columnFrom, columnTo) {

    var self = this;
    var columnIdPrefix = "#dvSortableColumn";
    var $columnA = $(columnIdPrefix + columnFrom);
    var $columnB = $(columnIdPrefix + columnTo);

    $columnA.children(".widget")
        .each(function (i, item) {
            var $widget = $(item);
            $widget.detach().appendTo($columnB);
        });
    self.recalcuateWidgetPositions();
};

/**
 * Steals the last widget of a given column to another column.
 * @param {int} columnFrom 
 * @param {int} columnTo 
 */
DashboardVM.prototype.stealWidget = function (columnFrom, columnTo) {

    var self = this;
    var columnIdPrefix = "#dvSortableColumn";
    var $columnA = $(columnIdPrefix + columnFrom);
    var $columnB = $(columnIdPrefix + columnTo);

    var $widgets = $columnA.children(".widget");
    if ($widgets.length > 1) {
        $widgets.last().detach().appendTo($columnB);
        self.recalcuateWidgetPositions();
    } else if (columnFrom > 1) {
        self.stealWidget(columnFrom - 1, columnTo);
    }
};

/** Commands the widgets to recalculate their positions (column and order) within the dashboard. */
DashboardVM.prototype.recalcuateWidgetPositions = function () {

    var self = this;
    var dataToSend = [];

    self.forEachWidget(function (widget) {
        var positionChanged = widget.recalculatePosition();

        if (positionChanged) {
            dataToSend.push({
                ID: widget.id,
                Column: widget.column,
                Order: widget.order
            });
        }
    });

    if (dataToSend.length > 0) {
        var requestUrl = self.commands.updateWidgetsUrl;

        $.ajax({
            type: 'POST',
            url: requestUrl,
            data: JSON.stringify({ 'positions': dataToSend }),
            contentType: 'application/json'
        })
            .done(function (data) {
            });
    }
};

/**
 * Find a widget on the dashboard with a specific id.
 * @param {int} widgetId - The dashboard widget identification number.
 * @returns {WidgetVM} A widget view model.
 */
DashboardVM.prototype.getWidget = function (widgetId) {
    var self = this;
    var result = null;

    for (var i = 0; i < self.widgets.length; i++) {
        var widget = self.widgets[i];
        if (widget.id === widgetId) {
            result = widget;
            break;
        }
    }

    return result;
};

/**
 * This is called once a widget has removed/deleted iteself from the dashboard.
 * This will also tell each widget to recalculate its own position within the dashboard.
* @param {WidgetVM} widgetVM - The widget view model that was removed.
 */
DashboardVM.prototype.evtRemoveWidget = function (widgetVM) {

    var self = this;

    //remove any tipsy objects still floating on the page.
    $("div.tipsy").remove();

    var $container = widgetVM.container;

    $container.addClass("moving")
        .delay(300)
        .queue(function () {
            $(this).removeClass("moving").dequeue();
            widgetVM.content.css("height", "auto");
            self.toolbox.append($container);
            self.fadeBorder($container);
            self.sortToolboxItems();
            self.recalcuateWidgetPositions();
            self.recalculateColumnHeights();
            //widgetVM.startLoadingAnimation();
        });
};

/**
* This function is called when a widget requests to be expanded.
* @param {WidgetVM} widgetVM - The widget view model that wants to be expanded.
*/
DashboardVM.prototype.evtExpandWidget = function (widgetVM) {

    var self = this;

    $(".widget").addClass("disableExpand");

};

/**
* This function is called when a widget requests to be moved from the toolbox to the bashboard via the "plus" button click.
* @param {WidgetVM} widgetVM - The widget view model that wants to be added.
*/
DashboardVM.prototype.evtAddToDashboardCallback = function (widgetVM) {

    var self = this;

    var $container = widgetVM.container;

    //remove from toolbox and add to the first column in the first position.
    $container.addClass("movingin")
        .delay(300)
        .queue(function () {
            $container.removeClass("movingin").detach().prependTo("#dvSortableColumn1").dequeue();

            self.recalcuateWidgetPositions();
            self.recalculateColumnHeights();
            self.determineToolboxState();

            self.fadeBorder($container);
            widgetVM.resize();
        });

    //scroll to the top of the page.
    self.scrollToTop();
};

DashboardVM.prototype.determineToolboxState = function (isOnLoad) {
    var self = this;
    var toolboxWidgetCount = self.toolbox.find(".widget").length;
    var toolboxFacetCount = self.toolbox.find(".facetsContainer").length;
    var hasContent = toolboxWidgetCount > 0 || toolboxFacetCount > 0;
    if (!hasContent) {
        self.toggleToolbox(false, false);
    } else if (isOnLoad && typeof Cookies !== 'undefined') {
        var cookie = Cookies.readCookie(self.toolboxCookieName);
        if (cookie !== null) {
            self.toggleToolbox((cookie === 'true'), false);
        }
    }
};

/**
* Scroll to the top of the html page.
 */
DashboardVM.prototype.scrollToTop = function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
};

/**
* Function to put blue border on widget and then fade out
 */
DashboardVM.prototype.fadeBorder = function (theElement) {
    $({ alpha: 1 })
        .animate({ alpha: 0 },
        {
            duration: 1500,
            step: function () {
                $(theElement).css('border-color', 'rgba(0,151,209,' + this.alpha + ')');
            },
            complete: function () {
                $(theElement)
                    .attr('style',
                        function (i, style) {
                            if (typeof style === "undefined" || style === null) {
                                return "";
                            } else {
                                return style.replace(/border-color[^;]+;?/g, '');
                            }
                        });
            }
        });
};

/**
* This function is called when a widget needs to be un-expanded.
* @param {WidgetVM} widgetVM - The widget view model that needs to be minified (un-expanded).
 */
DashboardVM.prototype.evtMinifyWidget = function (widgetVM) {

    var self = this;

    $(".widget").removeClass("disableExpand");
    $(window).trigger('resize'); // force resize for hightcharts
};

/**
 * Creates a new widget view model.
 * @param {dom} widgetContainer - The html container that the widget exists in.
 */
DashboardVM.prototype.setupWidget = function (widgetContainer) {

    var self = this;
    var vm = new WidgetVM(widgetContainer,
        self.dashboardType,
        self.currentItem,
        self.showUnauthorizedWidgets,
        self.categoryKey,
        {
            removedEventCallback: self.evtRemoveWidget.bind(self),
            expandedEventCallback: self.evtExpandWidget.bind(self),
            minifyEventCallback: self.evtMinifyWidget.bind(self),
            addToDashboardCallback: self.evtAddToDashboardCallback.bind(self),
            addToCustomDashboardCallback: self.evtAddToCustomDashboardCallback.bind(self),
            removeFromCustomDashboardCallback: self.evtRemoveFromCustomDashboardCallback.bind(self)
        });

    self.widgets.push(vm);
};

/**
 * Sets up the drag and drop functionality of the widgets. Also determines whether the widgets need to recalculate their positions.
 */
DashboardVM.prototype.setupSortable = function () {

    var self = this;

    // Initialise jquery sortable function
    $(".sortablecolumn")
        .sortable({
            items: ".widget",
            connectWith: ".sortablecolumn",
            handle: "h2.widgetHeader",
            placeholder: "placeholder",
            forcePlaceholderSize: true,
            opacity: 0.8,
            tolerance: "pointer",
            revert: 50,
            cancel: "i",
            receive: function (event, ui) {
                var $column = $(ui.sender);

                //If we are adding a widget to the dashboard from the toolbox
                if ($column.get(0) === self.toolbox.get(0)) {
                    var widgetVM = ko.dataFor(ui.item[0]);
                    widgetVM.loadContent();
                }
            },
            start: function (event, ui) {
                var widgetVM = ko.dataFor(ui.item[0]);
                self.recalculateColumnHeights(true);
                widgetVM.onWidgetMoveStart();
            },
            stop: function (event, ui) {
                var widgetVM = ko.dataFor(ui.item[0]);
                widgetVM.onWidgetMoveEnd();
                self.recalculateColumnHeights();
                self.recalcuateWidgetPositions();
                self.determineToolboxState();
            }
        });
};

DashboardVM.prototype.forEachWidget = function (func) {
    var self = this;
    for (var i = 0; i < self.widgets.length; i++) {
        var widget = self.widgets[i];
        func(widget, i);
    }
};

DashboardVM.prototype.setupSubjectChange = function (isSubjectDynamic) {
    var self = this;

    if (isSubjectDynamic !== undefined) self.isSubjectDynamic = isSubjectDynamic;

    if (!self.isSubjectDynamic) return;

    if (window.history && 'replaceState' in window.history) {
        history.replaceState(self.currentItem(), null);
    }

    var regex = RegExp("\/" + encodeURIComponent(self.currentItem()) + "\/?");
    self.baseUrl = (window.location.pathname.replace(regex, "/") + "/{0}" + window.location.search)
        .replace(/\/\//g, '/');

    self.currentItem.subscribe(function (newValue) {
        var url = self.baseUrl.replace(/\{0\}/, newValue);
        if (window.location.pathname == url)
            return;

        if (window.history && 'pushState' in window.history) {
            history.pushState(newValue, null, url);
            return;
        }

        window.location.href = url;
    });

    if (window.addEventListener) {
        window.addEventListener('popstate',
            function (e) {
                if (e.state === null) return;
                Dashboard.dashboardVM.currentItem(e.state);
            });
    }

    self.icon = ko.computed(function () {
        var subject = self.currentItem();
        var subjectModel = $.grep(self.subjectList(), function (s) { return s.name == subject; });
        if (subjectModel.length != 1) return null;

        return subjectModel[0].icon;
    });
}

/**
 * Sets the number of columns on the dashboard (this excludes the toolbox column).
 * @param {int} noOfColumns - The number of columns to display. 
 */
DashboardVM.prototype.changeColumns = function (noOfColumns) {

    var self = this;
    var position = noOfColumns - 1; //zero index the column.
    $('#dvSortableArea').append('<div class="loading dimmer"></div>');

    var difference = noOfColumns - self.columns();

    $.post(self.commands.updateLayoutUrl,
        {
            dashboardType: self.dashboardType,
            subject: self.currentItem(),
            numberOfColumns: noOfColumns
        })
        .done(function () {
            $('#dvSortableArea > .loading').remove();
            var colLinks = $($('.column-links').children());
            colLinks.removeClass('active');
            $(colLinks[position]).addClass("active");
            self.columns(noOfColumns);
            $(window).trigger('resize'); // force resize for hightcharts
        })
        .always(function () {
            if (difference > 0) {
                for (var i = 0; i < difference; i++) {
                    self.stealWidget(noOfColumns - i - 1, noOfColumns - i);
                }
            }
            self.recalculateColumnHeights();
        });
};

/**
 * Sorts the widget tollbox items into alphabetical order.
 */
DashboardVM.prototype.sortToolboxItems = function () {

    var self = this;

    var $widgets = self.toolbox.find(".widget");

    $widgets.sort(function (a, b) {
        if ($(a).find(".widgetTitle").text() < $(b).find(".widgetTitle").text()) {
            return -1;
        } else {
            return 1;
        }
    });

    $widgets.detach().appendTo(self.toolbox);
};

/**
 * Toogle the toolbox to either hide or show.
* @param {boolean} show - Whether to hide or show the toolbox. If left undefined it will alternate.
 */
DashboardVM.prototype.toggleToolbox = function (show, persistChoice) {
    var self = this;
    var $toolbox = $('#spToolboxToggle');
    if (show !== undefined && show !== null) {
        $('#dvSortableArea').toggleClass('closed', !show);
        $toolbox.toggleClass('on', !show);
    } else {
        $('#dvSortableArea').toggleClass('closed');
        $toolbox.toggleClass('on');
    }

    if ($toolbox.is(".on")) {
        var message = $toolbox.data("tooltip-closed") || 'Open the list of unused items';
        $toolbox.attr('title', message);
        show = false;
    } else {
        var message = $toolbox.data("tooltip-opened") || 'Collapse this list of unused items';
        $toolbox.attr('title', message);
        show = true;
    }

    if (persistChoice && typeof Cookies !== 'undefined') {
        Cookies.createCookie(self.toolboxCookieName, show, 30);
    }

    self.resizeWidgets();
};

/**
 * Registers a javacript object to the widget container, so that specific methods can be called.
 * @param {string} containerId - A container within the widget. 
 * @param {object} obj - A javascript object controlling the widget content.
 * @param {function} callback - A function callback that returns the widget view model.
 */
DashboardVM.prototype.registerJavascriptObject = function (containerId, obj, callback) {

    var self = this;

    if (obj !== undefined && obj !== null && obj instanceof WidgetBase) {
        var $widget = $("#" + containerId).closest(".widget");

        var widgetId = $widget.data("widget-id");

        var widget = self.getWidget(widgetId);

        widget.setJavascriptObj(obj);

        if (callback !== undefined) {
            callback(widget);
        }
    }
};

/**
 * Called when a user clicks on the save dashboard button.
 */
DashboardVM.prototype.saveDashboard = function () {
    var self = this;
    self.widgetsToSaveToCustom = self.widgets.filter(function (p) {
        return p.column > 0;
    })
        .map(function (p) {
            return p.id;
        });

    if (self.widgetsToSaveToCustom.length === 0) {
        showPopup("Save Dashboard",
            "<div class='alert alert-danger text-center u-margin-Bm'>You cannot save a dashboard with no widgets displayed on the page.</div>");
    } else {
        self.showSavePopup("Save Dashboard");
    }
};

/**
 * Devs can call this method to reset the dashboard back to the default state,
 * (will fail for everyone else)
 */
DashboardVM.prototype.resetDashboard = function () {
    var self = this;
    console.log("reset called for dashboard id: " + self.dashboardId);
    
    $.ajax({
        url: "/Dashboard/Reset",
        method: "GET",
        data: {
            currentDashboardId: self.dashboardId
        },
        async: true
    })
        .done(function (data) {
            if (data === 'Success') {
                showPopup("Dashboard Reset", "Your browser will now refresh");
                window.location.reload();
            } else {
                showPopup("Dashboard Reset Failed", "");
            }
               
        })
        .fail(function () {
            showPopup(title, "Reset Failed");
        });
}

/**
 * Show the save popup for creating a new custom dashboard.
 */
DashboardVM.prototype.showSavePopup = function (title) {
    var self = this;

    showPopup(title, "<div style='height:100px'><span class='loading' /></div>");

    $.ajax({
        url: "/Dashboard/GetSaveDashboardView",
        method: "GET",
        data: {
            currentDashboardId: self.dashboardId
        },
        async: true
    })
        .done(function (data) {
            showPopup(title,
                data,
                self,
                function () {
                    self.widgetsToSaveToCustom = [];
                });
        })
        .fail(function () {
            showPopup(title, "Something has gone wrong!");
            self.widgetsToSaveToCustom = [];
        });
};

/**
 * Validates the user inputs before saving the dashboard.
 * @param {string} formId - The id of the DOM element containing the user inputted values to save.
 */
DashboardVM.prototype.prepareSaveDashboard = function (formId) {
    var self = this;
    formId = "#" + formId;

    var selectedOption = $('input[name=new_or_existing]:checked', formId).val();
    var description = $('.dashboardDescription', formId).val();
    var name = '';
    if (selectedOption === "NEW") {
        name = $('.dashboardNewName', formId).val();
        if (name === String.empty) {
            alert("Please provide a name for your new dashboard.");
        } else {
            $(formId).html("<div style='height:100px'><div class='loading text'>Saving Dashboard</div></div>");
            self.submitSaveDashboard(name, description, formId);
        }
    } else {
        name = $('.dashboarExisting option:selected', formId).text();
        var id = $('.dashboarExisting', formId).val();
        if (name === String.empty || name === 'Choose existing dashboard') {
            alert("Please select an item from the existing items.");
        } else {
            $(formId).html("<div style='height:100px'><div class='loading text'>Saving Dashboard</div></div>");
            self.submitSaveDashboard(name, description, formId, id);
        }
    }
}

/**
 * Submit the custom dashboard creation request to the server.
 * @param {string} name - The name to save the dashboard as.
 * @param {string} description - The description to give to the dashboard.
 * @param {string} formId - The id of the DOM element containing the user inputted values to save.
 * @param {int?} existingId - The id of a dashboard to copy the existing dashboard to.
 */
DashboardVM.prototype.submitSaveDashboard = function (name, description, formId, existingId) {
    var self = this;
    var dashboardId = Dashboard.dashboardVM.dashboardId;
    var subject = Dashboard.dashboardVM.currentItem();
    var type = Dashboard.dashboardVM.dashboardType;

    var args = {
        id: dashboardId,
        subject: subject,
        name: name,
        title: self.dashboardName,
        description: description,
        type: type,
        existingId: existingId || null,
        widgets: self.widgetsToSaveToCustom,
        categoryKey: self.categoryKey
    };

    $.ajax({
        url: "/CustomDashboard/SaveCustomDashboard",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: JSON.stringify(args)
    })
        .done(function (data) {
            var resultName = data.Name;
            var resultId = data.Id;
            $(formId)
                .html("<h4 class='alert alert-success text-center u-margin-Bm'>Dashboard Saved as <a href='/Dashboard/Custom/" + resultId + "' class='alert-link'>" + resultName + "</a></h4><div class='list-group list-links'><a class='list-group-item h4' href='/Dashboard/Custom/" + resultId + "'>Go to " + resultName + " <i class='icon-right-open pull-right'></i></a> <a class='list-group-item h4 u-margin-Tn' href='/CustomDashboard'>Go to My Custom Dashboards <i class='icon-right-open pull-right'></i></a></div><div class='text-center'><a class='btn btn-default' data-dismiss='modal'>Close</a></div>");
            self.widgetsToSaveToCustom = [];
        })
        .fail(function () {
            self.widgetsToSaveToCustom = [];
        });
};

/**
 * Adds a widget to a custom dashboard.
 * @param {WidgetVM} The widget view model. 
 */
DashboardVM.prototype.evtAddToCustomDashboardCallback = function (widgetVM) {
    var self = this;
    self.widgetsToSaveToCustom = [widgetVM.id];

    self.showSavePopup("Save Item to Custom Dashboard");
};

/**
 * Remove a widget from the give custom dashboard.
 * @param {WidgetVM} The widget view model 
 */
DashboardVM.prototype.evtRemoveFromCustomDashboardCallback = function (widgetVM) {
    var self = this;
    var index = self.widgets.indexOf(widgetVM);
    self.widgets.splice(index, 1);
    $.post("/CustomDashboard/RemoveFromCustomDashboard", { dashboardId: self.dashboardId, widgetId: widgetVM.id });
};