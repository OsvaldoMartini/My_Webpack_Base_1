// <copyright file="Script.js" company="IHS">
// Copyright © 2011 IHS Inc. and its affiliated and subsidiary companies, all
// rights reserved. All other trademarks are the property of IHS Inc. and its
// affiliated and subsidiary companies.
//
// This product, including software, data and documentation are licensed to the user
// for its internal business purposes only and may not be disclosed, disseminated,
// sold, licensed, copied, reproduced, translated or transferred to any third party.
//
// IHS Inc.
// 15 Inverness Way East
// Englewood, Colorado 80112
// USA
// +1 303-736-3000
// </copyright>

//service urls etc
var urlToSearchPanelService = '/Services/searchPanelReceiver.svc/';
var _profileUpdateReceiverUrl = '/Services/ProfileUpdateReceiver.svc/';
var _SessionSearchUpdateReceiverUrl = '/Services/SessionSearchUpdateReceiver.svc/';

// add extension to array
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
          this[from] === elt)
                return from;
        }
        return -1;
    };
}

//required for old versions of IE <=9, they dont have a console unless dev tools are open
if (!window.console) { var console = {}; }
if (!console.log) { console.log = function () { }; }

//required for polling Ajax request failure processing
var _pageUnloading = false;

var _disableWait = false;
var _savedDisableWait = false;
var _lastServerContact = new Date();
var _timedOut = false;
var gridBarWrapperWidth;
var _applyAllButtonId;

// Over-ride the default ASP.NET __doPostBack function
__doPostBack = CMPPostback;

// Determine what type of _DHTML support is available
var _DHTML = (document.getElementById || document.all || document.layers);

// Determine the browser type
var _browser = new BrowserCheck();

// Capture key press info
document.onkeydown = ProcessKeyPress;
if (_browser.b == "ns")
    document.captureEvents = (Event.keyDOWN);

var _validationSucceeded = false;


var resizeTimeout = null;
var winWidth = $(window).width(), winHeight = $(window).height();

$(window).resize(function () {
    var onResize = function () {
        Resize();
    }

    //New height and width
    var winNewWidth = $(window).width(),
        winNewHeight = $(window).height();

    // compare the new height and width with old one
    if (winWidth != winNewWidth || winHeight != winNewHeight) {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(onResize, 300);
    }
    //Update the width and height
    winWidth = winNewWidth;
    winHeight = winNewHeight;
});


// This function is a workaround for a bug in the Jquery Custom UI library. The bug doesn't allow for the setting of the zIndex of the date picker.
// This function resets the zIndex of date picker controls by delaying when this is done. Essentially allowing the buggy jquery to finish before resetting the zIndex.
// Called via serverside setup.
function SetDatePickerZIndex() {
    window.setTimeout(
    function () {
        $('#ui-datepicker-div').css('z-index', 2000);
    }
    , 100);
}

// Retrieve a named object
function GetObject(id) {
    var object = null;

    if (document.getElementById) {
        object = document.getElementById(id);
    }
    else if (document.all) {
        object = document.all[id];
    }
    else if (document.layers) {
        object = document.layers[id];
    }

    return object;
}

// Replacement for the standard postback handler
function CMPPostback(eventTarget, eventArgument) {
    if (!theForm.onsubmit || (theForm.onsubmit() != false)) {
        theForm.__EVENTTARGET.value = eventTarget;
        theForm.__EVENTARGUMENT.value = eventArgument;

        Wait(true);

        theForm.submit();
    }
}

// Display 'Processing' Div
function Wait(fromCMPPostBack) {
    // Knobble the nappy for the Calendar and the Tree
    // and the map controls too (all of them, including the map toolbar!)
    if ((theForm.__EVENTTARGET.value.indexOf("Calendar1$calendar") != -1)
      || (theForm.__EVENTTARGET.value.indexOf("tree$treCmpTree") != -1)
      || (theForm.__EVENTTARGET.value.indexOf("ctl00$mainContent$ddlFiscalRegime") != -1)
      || (theForm.__EVENTTARGET.value.indexOf("ctl00$mainContent$theChart$btnChartLoad") != -1)
      || (theForm.__EVENTTARGET.value.indexOf("ctl00$mainContent$gridResults$btnExportAll") != -1)
      || (theForm.__EVENTTARGET.value.indexOf("ctl00$mainContent$SearchResultsNews1$ddlCategory") != -1)
      ) {
        _lastServerContact = new Date();
        _disableWait = true;
    }

    try {
        if (fromCMPPostBack) {
            _disableWait = _savedDisableWait;
        }

        _savedDisableWait = _disableWait;

        if (!_disableWait) {
            ShowObject('masterOverlay', true);
        }

        _disableWait = false;
    } catch (e) {; }
}

// Show/Hide an object
function ShowObject(objectId, show) {
    // Give up if _DHTML is not supported
    if (!_DHTML) return;

    var object = GetObject(objectId);
    if (object == null) {
        return;
    }

    if (show == null) {
        if ((object.style.visibility == 'visible') || (object.style.visibility == '')) {
            object.style.visibility = 'hidden';
            object.style.display = 'none';
        }
        else {
            object.style.visibility = 'visible';
            object.style.display = 'inline-block';
        }
    }
    else {
        if (show) {
            object.style.visibility = 'visible';
            object.style.display = 'inline-block';
        }
        else {
            object.style.visibility = 'hidden';
            object.style.display = 'none';
        }
    }
}

//object to store the valid bounds of the UI
function bounds(w, h) {
    this.w = w;
    this.h = h;
}

function getUIBounds() {
    var d = new bounds();

    var w = (typeof (window) == "undefined") ? this : window;
    var b = document.body;

    if (w.innerWidth) {
        d.w = w.innerWidth;
        d.h = w.innerHeight;
    }
    else if (b.parentElement.clientWidth) {
        d.w = b.parentElement.clientWidth;
        d.h = b.parentElement.clientHeight;
    }
    else if (b && b.clientWidth) {
        d.w = b.clientWidth;
        d.h = b.clientHeight;
    }
    return d;
}

function getElementDimensions(element) {
    var width = 0;
    var height = 0;
    var obj = $(element);

    if (obj != null) {
        width = obj.width();
        height = obj.height();
    }

    return new bounds(width, height);
}

//create an event to broadcast resize has happened
// to subscribe to it do something like $(document).bind('SessionSearchChangedEvent', function (e) { yourFunction(); });
var ResizeEventCalled = "ResizeEventCalled";
var ResizeEventCalled = jQuery.Event(ResizeEventCalled);

function Resize() {
    try {
        $(document).trigger(ResizeEventCalled);
        //Constants
        var UIBounds = getUIBounds();
        var mainareaPadding = 3;                //value of padding in "#containerFull #mainarea" CSS class
        var divResultsMainHeightMargin = 25;

        //Bounds
        var masterBreadcrumbBounds = getElementDimensions("#ctl00_masterBreadcrumb");
        var pnlSearchResultsControlsBounds = getElementDimensions("#ctl00_mainContent_gridResults_pnlSearchResultsControls");
        var pnlSearchResultsStatusBounds = getElementDimensions("#ctl00_mainContent_gridResults_pnlSearchResultsStatus");
        var actionsBarBounds = getElementDimensions("#ctl00_mainContent_gridResults_actionsBar");
        var gridContentExtraBounds = getElementDimensions("#gridContentExtra");
        var headerBounds = getElementDimensions("#header");
        var footerBounds = getElementDimensions("#footer");

        var gridHeaderHeight, gridHeader;

        var grid = $("div .ui-jqgrid-bdiv"); //jqgrid

        if (grid.length > 0) {
            //jqgrid
            gridHeader = $("div .ui-jqgrid-hbox");
            gridHeaderHeight = gridHeader.height();
        }
        else {
            //infragistics grid
            gridHeaderHeight = getElementDimensions("#ctl00xmainContentxgridResultsxgrid1_hdiv").h;
            gridHeader = $("#ctl00xmainContentxgridResultsxgrid1_hdiv");
        }

        //Objects
        var containerFull = $("#containerFull");
        var mainarea = $("#mainarea");
        var masterLinksInner = $("#ctl00_masterLinks");
        var masterTableContent = $("#masterTableContent");
        var divResultsMain = $("#ctl00xmainContentxgridResultsxgrid1_main");
        var chart = $("#ctl00_mainContent_theChart_btnChartLoad");
        var leftnavandmainarea = $("#leftnavandmainarea");
        var masterOverlay = $("#masterOverlay");
        var banner = $(".banner");
        var bannerSearch = $("#bannerSearch");
        var header = $("#header");
        var productTitle = $("#productTitle");
        //var secondaryNav = $("#secondaryNav");
        var footerContent = $("#footer");
        var filterContainer = $("#ctl00_searchPanelContainer");
        var visibleHeight = UIBounds.h - headerBounds.h - footerBounds.h;

        //Some pages do not inherit of of the page base, such as the Developer Tools.
        //Quick fix until page base is incorporated there... G.H
        if (typeof _resizeHeight === 'undefined')
            var _resizeHeight = false;

        if (_resizeHeight) {
            // remove the body style that's hides the scroll bar and replace with an auto setting
            $("body").css("overflow", "hidden");
            if (leftnavandmainarea.length > 0) {
                leftnavandmainarea.css("overflow", "auto");
            }

            // -------- Size leftnavandmainarea
            if (leftnavandmainarea.length > 0) {
                leftnavandmainarea.height(visibleHeight);
            }

            // ------- Size the main area
            if (mainarea.length > 0 && leftnavandmainarea.length > 0) {
                mainarea.height(leftnavandmainarea.height() - 10);
            }
        }

        // IE7 Hacks
        if (bowser.msie && parseInt(bowser.version, 10) == 7 && !_resizeHeight) {
            // IE7 hack
            $("body").css("overflow", "hidden");

            if (mainarea.length > 0) {
                mainarea.css("overflow", "hidden");
            }
        }

        var masterLinksWidth;
        //Determine master links width
        if (masterLinksInner.length == 0) {
            masterLinksWidth = 0;
        }
        else {
            if (masterLinksInner.html().indexOf("isSlim") > -1)   //slim panels ?
            {
                if (masterLinksInner.html().indexOf("AdvertAnchor") > -1) //if we have side adverts then make the right slightly wider
                {
                    masterLinksWidth = 220;
                    masterLinksInner.css("position", "absolute");
                }
                else {
                    masterLinksWidth = 70;
                }
                masterLinksInner.width(masterLinksWidth);
            }
            else {
                //leave default width
                masterLinksWidth = masterLinksInner.width();
            }
        }

        // ------- Search result
        if ((gridHeader.length > 0) && (gridHeader.css("display") == "none")) {
            gridHeaderHeight = 0;
        }

        if (divResultsMain.length > 0) //Infragistics grid
        {
            divResultsMain.height(visibleHeight
                                        - 30
                                        - masterBreadcrumbBounds.h
                                        - actionsBarBounds.h
                                        - gridHeaderHeight
                                        - gridContentExtraBounds.h
                                        - pnlSearchResultsStatusBounds.h
                                        - pnlSearchResultsControlsBounds.h
                                        - divResultsMainHeightMargin);
        }

        // -------Grid
        if (grid.length > 0) {
            //remove and it will become 100%
            $("div .ui-jqgrid").css('width', '');
            $("div .ui-jqgrid-view").css('width', '');
            $("div .ui-jqgrid-btable").css('display', '');

            grid.css('width', '100%');
            grid.css('height', '');

            // bit of a hack - see if the outer container needs pushing to the whole screen size.
            // this is added because of the new grid control. the containerFull has been set to absolute positioning
            // so that very wide grids force the horizontal scrollbar in the correct place. When grids are small however this will force it back to full screen.
            var gridWidth = grid.width();
            if (filterContainer.length > 0) {
                gridWidth = gridWidth + filterContainer.width();
            }

            var gridBarWrapper = $("#gridBarWrapper");

            // resize the grid bar wrapper - this keeps the grid status bar within view
            if (filterContainer.length > 0) {
                gridBarWrapper.width(UIBounds.w - filterContainer.width() - 50 - masterLinksWidth);
            }
            else {
                gridBarWrapper.width(UIBounds.w - 50 - masterLinksWidth);
            }

            gridBarWrapperWidth = gridBarWrapper.width();

            if (gridWidth < UIBounds.w) {
                if ((bowser.msie && parseInt(bowser.version, 10) == 7)) {
                    if (leftnavandmainarea.length > 0) {
                        leftnavandmainarea.width(containerFull.width());
                    }

                    if (banner.length > 0) {
                        banner.width();
                    }

                    //if (secondaryNav.length > 0) {
                    //    secondaryNav.width();
                    //}
                }
                // if there is a search box on screen we need to make sure its visible on screen first
                setTimeout(AdjustSearchBox, 500);
            }
            else {
                // special case of where the grid is larger than the screen size -  so need to resize things.
                if ((bowser.msie && parseInt(bowser.version, 10) == 7)) {
                    if (leftnavandmainarea.length > 0) {
                        leftnavandmainarea.width(gridWidth);
                    }

                    if (banner.length > 0) {
                        banner.width(gridWidth - 30);
                    }

                    //if (secondaryNav.length > 0) {
                    //    secondaryNav.width(gridWidth - 30);
                    //}

                    if (footerContent.length > 0) {
                        footerContent.width(gridWidth - 30);
                    }
                }

                // if there is a search box on screen we need to make sure its visible on screen first
                setTimeout(AdjustSearchBox, 500);
            }
        }

        // ------- Chart
        if (chart.length > 0) {
            try {
                var tblChartControlsBounds = getElementDimensions("#tblChartControls");
                var loadChart = GetObject("ctl00_mainContent_theChart_btnChartLoad")

                var chartHeight = visibleHeight
                                - 15
                                - masterBreadcrumbBounds.h
                                - tblChartControlsBounds.h
                                - gridContentExtraBounds.h
                                - (6 * mainareaPadding);

                var chartWidth = masterTableContent.width()
                                - (6 * mainareaPadding);

                if (chartHeight <= 0) {
                    chartHeight = 300;
                }

                //update the hidden fields with the chart width and height
                $("#ctl00_mainContent_theChart_hidChartWidth").val(chartWidth);
                $("#ctl00_mainContent_theChart_hidChartHeight").val(chartHeight);

                //push the chart load button to render the chart
                try {
                    loadChart.click(); //IE
                }
                catch (e) {
                    eval(loadChart.href); //FireFox
                }
            }
            catch (e) {; }
        }

        //LiveMapArcGIS
        var mapDiv = $("#arcGISControlMap");
        if (mapDiv.length > 0) {
            var arcGISControlHeader = $("#arcGISControlHeader");

            var mapHeight = visibleHeight
                            - masterBreadcrumbBounds.h
                            - arcGISControlHeader.height()
                            - (2 * mainareaPadding);

            var mapWidth = masterTableContent.width()
                            - (2 * mainareaPadding);

            //Only this JQuery call sets the correct dimensions
            mapDiv.css('height', mapHeight);
            mapDiv.css('width', mapWidth);

            //Call map resize function
            if (arcGISControlMap) {
                arcGISControlMap.resize();
            }
        }

        // ------- masterOverlay
        var top = parseInt(UIBounds.h / 2) - 150;

        if (masterOverlay.length > 0) {
            var masterSave = $("#masterSave");
            var masterOpaque = $("#masterOpaque");
            var masterSaveForm = $("#masterSaveForm");
            var masterSaveOpaque = $("#masterSaveOpaque");
            var masterSaveClose = $("#masterSaveForm span");
            var masterSaveFormHeight = $("#masterSaveForm iframe").height();
            var masterSaveFormWidth = $("#masterSaveForm iframe").width();

            masterOverlay.width(UIBounds.w - 20);
            masterSave.width(masterOverlay.width());

            if (_resizeHeight) {
                masterOverlay.height(UIBounds.h - 20);
                masterSave.height(masterOverlay.height());
            }

            //masterSaveForm.css('top', top - 9 + "px");
            masterSaveForm.css('top', "50%");
            masterSaveForm.css('margin-top', "-" + masterSaveFormHeight / 2 + "px");
            masterSaveClose.css('margin-left', (masterSaveFormWidth / 2) - 46 + "px");

            masterSaveClose.click(function () {
                $(this).closest(masterSave).css("visibility", "hidden");
                $("#masterOverlay").css("visibility", "hidden");
            });

            masterSaveOpaque.css('top', top - 10 + "px");
            masterSaveOpaque.css('left', parseInt(UIBounds.w / 2) - 240 + "px");
        }

        //fix z-order of menus and divs, ensure the header and left panel are the highest and the rest takes care of itself
        var zIndexNumber = 1000;

        if (masterOverlay.length > 0) {
            masterOverlay.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        
        if (header.length > 0) {
            header.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        
        if (productTitle.length > 0) {
            productTitle.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        
        var newFader = $(".menuFade");
        if (newFader.length > 0) {
            newFader.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        if (bannerSearch.length > 0) {
            bannerSearch.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        if (filterContainer.length > 0) {
            filterContainer.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        if (filterContainer.length > 0) {
            filterContainer.find('.panelOuter').css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        if (filterContainer.length > 0) {
            filterContainer.find('.showFilters').css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
        if (leftnavandmainarea.length > 0) {
            leftnavandmainarea.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }

        if (mainarea.length > 0) {
            mainarea.css('zIndex', zIndexNumber);
            zIndexNumber -= 10;
        }
    }
    catch (e) {
        ;//alert(e);
    }
}

$.maxZIndex = $.fn.maxZIndex = function (opt) {
    /// <summary>
    /// Returns the max zOrder in the document (no parameter)
    /// Sets max zOrder by passing a non-zero number
    /// which gets added to the highest zOrder.
    /// </summary>
    /// <param name="opt" type="object">
    /// inc: increment value,
    /// group: selector for zIndex elements to find max for
    /// </param>
    /// <returns type="jQuery" />
    var def = { inc: 10, group: "*" };
    $.extend(def, opt);
    var zmax = 0;
    $(def.group).each(function () {
        var cur = parseInt($(this).css('z-index'));
        zmax = cur > zmax ? cur : zmax;
    });
    if (!this.jquery)
        return zmax;

    return this.each(function () {
        zmax += def.inc;
        $(this).css("z-index", zmax);
    });
}

//disables right mouse functionality unless the user has selected some text
function disableContextMenu(e) {
    if (_browser.b == "ie") {
        //allow right click on images
        if (typeof (event.srcElement) != "undefined" && event.srcElement.tagName == "IMG") {
            return true;
        }
    }
    else {
        //allow right click on images
        if (typeof (e.target) != "undefined" && e.target.tagName == "IMG") {
            return true;
        }
    }

    if (typeof (document.selection) != "undefined") {
        if (typeof (document.selection.createRange()) == "undefined" || document.selection.createRange().text == "")
            return false;
    }
    else if (window.getSelection()) {
        if (window.getSelection() == "")
            return false;
    }
    else
        return false;
}

// Validate Checked Items For a Radio Check Box group
function ValidateCheckedItems(checkBoxId, checkBoxListId, isListClicked) {
    // Get the objects.
    var allItem = GetObject(checkBoxId);
    var list = GetObject(checkBoxListId);

    if ((list != null) && (allItem != null)) {
        // Are there selected items?
        var i = 0;
        var sltCount = 0;

        do {
            var item = GetObject(checkBoxListId + '_' + i);

            if ((item != null) && item.checked)
                sltCount++;

            i++;
        } while (item != null)
        i--;

        // List item has been clicked
        if (isListClicked) {
            if (sltCount == 0) {
                //allItem.checked = true;
            }
            else if (sltCount == i) {
                // This functionality turned off - no wanted as there is a difference between All items and checking all the items.
                // This is because the items may change.
                // allItem.checked = true;
                // ResetCheckboxList(checkBoxListId, false);
            }
            else {
                allItem.checked = false;
            }
        }
        else {
            // The 'All' item has been clicked
            //allItem.checked = true;

            if (sltCount > 0) {
                if (allItem.checked) {
                    ResetCheckboxList(checkBoxListId, false);
                }
            }
        }
    }
}

// Reset Check Box List values
function ResetCheckboxList(checkBoxListId, value) {
    var i = 0;

    do {
        var item = GetObject(checkBoxListId + '_' + i);

        if (item != null)
            item.checked = value;

        i++
    } while (item != null)
}

// Validate Range From/To values entered
function ValidateRangeEntered(source, args) {
    args.IsValid = true;

    var to = GetObject((source.id.substr(0, source.id.length) + "T").replace("vld", "txt"));

    if ((args.Value == "" && to.value != "") || (args.Value != "" && to.value == "")) {
        args.IsValid = false;
    }
}

// Validate that both the Total Depth and the Total Depth Range are not entered at the same time
function ValidateDepthTotal(source, args) {
    args.IsValid = true;

    var from = GetObject((source.id.substr(0, source.id.length) + "F").replace("cvl", "txt"));
    var to = GetObject((source.id.substr(0, source.id.length) + "T").replace("cvl", "txt"));

    if (args.Value != "" && (from.value != "" || to.value != "")) {
        args.IsValid = false;
    }
}

// Process Key Press events
function ProcessKeyPress(eventDetail) {
    var iCode, nCode, eventSource;

    var ignoreClasses = new Array("ui-pg-input");

    // Get key press event info
    if (_browser.b == "ns") {
        iCode = 0;
        nCode = eventDetail.which;
        eventSource = eventDetail.target;
    }
    else {
        iCode = event.keyCode;
        nCode = 0;
        eventSource = event.srcElement;
    }

    if (iCode == 13 || nCode == 13) {
        // only perform enter key processing for INPUT tag's
        var ignoreMe = false;
        var isSearchPanelInput = false;
        if (typeof (eventSource.classList) != "undefined") {
            for (var c = 0; c < eventSource.classList.length; c++) {
                if (ignoreClasses.indexOf(eventSource.classList[c]) > -1) {
                    ignoreMe = true;
                }

                if (eventSource.classList[c] == "search_panel_input_element") {
                    isSearchPanelInput = true;
                    break;
                }
            }
        }

        if (!ignoreMe && ((eventSource.tagName == "INPUT" && eventSource.type == "text") || isSearchPanelInput)
            && typeof (eventSource.outerHTML) != "undefined" && eventSource.outerHTML.indexOf("onkeypress") == -1) {
            try {
                try {
                    // Cancel event bubbling
                    event.cancelBubble = true;
                    event.returnValue = false;
                }
                catch (e) {; }

                if (!_validationSucceeded) {
                    // Call the ProcessEnterKeyPress function
                    // - this may or may not be defined on a page
                    ProcessEnterKeyPress();
                    _validationSucceeded = Page_IsValid;
                }
            }
            catch (e) {; }
        }
    }
}

// Determine the browser type
function BrowserCheck() {
    if (navigator.userAgent.indexOf("Win") > -1)
        this.win = true;
    else
        this.win = false;

    var b = navigator.appName;

    if (b == "Netscape")
        this.b = "ns";
    else if (b == "Microsoft Internet Explorer")
        this.b = "ie";
    else if (b == "Opera")
        this.b = "opera";
    else
        this.b = b;

    this.version = navigator.appVersion;
    this.v = parseInt(this.version);
    this.ns = (this.b == "ns" && this.v >= 4);
    this.ns4 = (this.b == "ns" && this.v == 4);
    this.ns5 = (this.b == "ns" && this.v == 5);
    this.ns6 = (this.b == "ns" && this.v == 6);
    this.ie = (this.b == "ie" && this.v >= 4);
    this.ie4 = (this.version.indexOf('MSIE 4') > 0);
    this.ie5 = (this.version.indexOf('MSIE 5') > 0);
    this.ie6 = (this.version.indexOf('MSIE 6') > 0);
    this.ie7 = (this.version.indexOf('MSIE 7') > 0);
    this.opera = (this.b == "opera" && this.v >= 6);
    this.opera6 = (this.b == "opera" && this.v == 6);
    this.min = (this.ns || this.ie);
}

// Name a saved Core.Catalog search
function NameSavedSearch() {
    ReNameSavedSearch('');

    return false;
}

// Name a saved Core.Catalog search
function NameSavedSearchForPRG() {
    _lastServerContact = new Date();

    _disableWait = true;

    ControlSavedSearch("", true, null, false, true, undefined, undefined, undefined);
    return false;
}

function ReNameSavedSearch(id) {
    _lastServerContact = new Date();

    _disableWait = true;
    ControlSavedSearch("", false, undefined, undefined, undefined, undefined, undefined, undefined);
}

function OpenNamedFeedbackPopup(feedbackName, feedbackMetadata) {
    //logic is if data-feedbackName attribute has data call the server to get the href else just use the href
    try {
        if (feedbackName != undefined) {
            //call the namedFeedback service
            var url = "/Services/NamedFeedbackService.svc/GetFeedbackDetails";
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: url,
                data: '{ "feedbackName":"' + feedbackName + '" }',
                success: function (callResult) {
                    if (!callResult.d.IsEmpty) {
                        var frameWidth = 860;
                        var frameHeight = 630;
                        if (callResult.d.WindowHeight > 0 && callResult.d.WindowWidth > 0) {
                            frameHeight = callResult.d.WindowHeight;
                            frameWidth = callResult.d.WindowWidth;
                        }
                        if (callResult.d.Href != undefined) {

                            var href = callResult.d.Href;

                            if (feedbackMetadata != undefined) {
                                // needs to be a query string pattern e.g. docid=2&title=fred
                                feedbackMetadata = feedbackMetadata + "&Path=" + window.location.pathname;
                            }
                            else {
                                feedbackMetadata = "Path=" + window.location.pathname;
                            }

                            if (href.indexOf("?") == -1) {
                                href = href + "?" + feedbackMetadata;
                            }
                            else {
                                href = href + "&" + feedbackMetadata;
                            }

                            LoadModalPageUrl(href);

                            var saveFrame = GetObject("saveFrame");
                            saveFrame.height = frameHeight + 'px';
                            saveFrame.width = frameWidth + 'px';
                        }
                    } else {
                        ShowError("An error occurred attempting to retrieve the feedback for this page.");
                    }
                },
                error: function () { ShowError("An error occurred attempting to retrieve the feedback for this page."); }
            });
        } else {
            var href = $(event.target).attr('data-feedbackHref');
            if (href != undefined) {
                LoadModalPageUrl(href);
            }
        }
    } catch (e) {
        ShowError("An error occurred attempting to retrieve the feedback for this page.");
    }
}

// fills the hidden modalDiv with the contents from the supplied url.
//   nb. This method is designed to be called from the jquery event model and hence it is expecting
//   an event argument.
function LoadModalPage(event) {
    var url = $(event.target).attr("href");
    return LoadModalPageUrl(url);
}

// fills the hidden modalDiv with the contents from the supplied url.
function LoadModalPageUrl(url, options) {
    var saveFrame = GetObject("saveFrame");
    var masterSaveForm = $("#masterSaveForm");

    var defaults =
    {
        showClose: true
    };

    var settings = $.extend({}, defaults, options);

    var masterSaveClose = $("#masterSaveForm span");

    if (settings.showClose) {
        masterSaveClose.show();
        masterSaveClose.css({
            'margin-left': (masterSaveForm.children('iframe').width() / 2) - 30 + "px",
            'left': '50%'
        });

        masterSaveClose.click(function () {
            ShowObject('masterSave', false);
            ShowObject('masterOverlay', false);
        });
    } else {
        masterSaveClose.hide();
    }

    masterSaveForm.css({
        "top": "50%",
        "margin-top": "-" + (parseInt(saveFrame.height) / 2) + "px"
    });

    if (!_disableWait) {
        ShowObject('masterOverlay', true);
    }

    ShowObject('saveFrame', true);
    ShowObject('masterSave', true);
    saveFrame.src = url;

    return false;
}

function CloseModalDialog(relocate) {
    if (relocate != "") {
        var saveFrame = GetObject("saveFrame");
        saveFrame.style.visibility = 'hidden';

        Wait(false);
        window.location = relocate;
    }
    else {
        var masterSave = GetObject("masterSave");
        var masterSaveOpaque = GetObject("masterSaveOpaque");

        $(GetObject('masterOverlay')).css('visibility', 'hidden');

        if (masterSave != null) {
            if (_browser.b == "ie") {
                //new MochiKit.Visual.Opacity('masterSave', {to: 0.0, duration: 0.5, afterFinish: function() {masterSave.style.visibility = 'hidden';}});
                $(masterSave).css({ 'visibility': 'hidden', 'display': 'none' });
            }
            else {
                //setOpacity('masterSave', 0.0);
                $(masterSave).css({ 'visibility': 'hidden', 'display': 'none' });
            }
        }

        if (masterSaveOpaque != null) {
            masterSaveOpaque.style.visibility = 'hidden';
        }
    }
}

var SaveSearchCompletedEvent = jQuery.Event("SessionSearchChangedEvent");
function SaveSearchComplete()
{
    $(document).trigger('SaveSearchCompletedEvent');
}

// Pop up save search
function ControlSavedSearch(id, createPRG, relocate, showFeed, selectPRG, suggestedTitle, provider, categoryKey) {
    if (typeof (showFeed) == "undefined") {
        showFeed = "false";
    }

    if (relocate == null) {
        relocate = "";
    }

    if (suggestedTitle == undefined) {
        suggestedTitle = "";
    }

    if (provider == undefined) {
        provider = "";
    }

    if (categoryKey == undefined) {
        categoryKey = "";
    }

    var src = "/NameSearch.aspx?Id=" + id + "&CreatePRG=" + createPRG + "&Relocate=" + relocate +
        "&ShowFeed=" + showFeed + "&SelectPRG=" + selectPRG + "&title=" + suggestedTitle +
        "&provider=" + provider + "&categoryKey=" + categoryKey;

    src = applySessionKeyToURL(src);
    LoadModalPageUrl(src);
    //saveFrame.src = src;

    return false;
}

// Pop up a Compile window
function open_compile(compilePage, domain, category, itemId) {
    open_window(compilePage + "?Domain=" + domain + "&CatKey=" + category + "&ItemIds=" + itemId, 700, 700, '', 1);
}

// pop up the export window
function open_export(selectIdsKey, totalItems) {
    var url = "/Export.aspx?total=" + totalItems + "&modal=true";

    if (selectIdsKey != "") {
        url += "&key=" + selectIdsKey;
    }

    url = applySessionKeyToURL(url);
    LoadModalPageUrl(url, { showClose: false });

    return false;
}

function open_feed(userId, searchId) {
    var url = "/Rss/Show/0?userId=" + userId + "&searchId=" + searchId;
    open_window(url, 700, 800, "", 1);
}

// Try and retrieve the session key from a master page
function getSessionKey() {
    var hidden = document.getElementById("__hiddenUniqueSessionKey");
    if (hidden)
        return hidden.value;
    else
        return undefined;
}

// If the search key exists, apply it to the url, otherwise leave it as it is
function applySessionKeyToURL(url) {
    if (getSessionKey !== undefined) {
        var key = getSessionKey();
        if (key !== undefined && key.length > 0 && key.toUpperCase().indexOf("SESSIONKEY=") < 0) {
            if (url.indexOf('?') < 0)
                url += "?SessionKey=" + key;
            else
                url += "&SessionKey=" + key;
        }
    }
    return url;
}

// General purpose window opener
function open_window(url, width, height, name, enableMenu) {
    if (typeof (name) == "undefined") {
        name = "";
    }

    if (typeof (enableMenu) == "undefined") {
        enableMenu = 0
    }

    //check if a search key exists
    url = applySessionKeyToURL(url);

    _lastServerContact = new Date();

    if (typeof (width) != "undefined" && typeof (height) != "undefined" && width > 0 && height > 0) {
        newwindow = window.open(url, name, "width=" + width + ",height=" + height + ",location=" + enableMenu + ",menubar=" + enableMenu + ",toolbar=" + enableMenu + ",status=" + enableMenu + ",scrollbars=1,resizable=1,left=10,top=10");
    }
    else {
        // look at the size of the available screen and offset slightly to make the popup as large as possible.
        var UIBounds = getUIBounds();
        width = UIBounds.w - 10;
        height = UIBounds.h - 10;

        newwindow = window.open(url, name, "width=" + width + ",height=" + height + ",location=" + enableMenu + ",menubar=" + enableMenu + ",toolbar=" + enableMenu + ",status=" + enableMenu + ",scrollbars=1,resizable=1,left=10,top=10");
    }

    if (typeof (newwindow) != "undefined" && newwindow != null) {
        newwindow.focus();
    }
}

// CheckBoxListRequiredFieldValidator script
function checkBox_verify(sender, args) {
    var val = GetObject(GetObject(sender.id).controltovalidate);
    var col = val.getElementsByTagName("*");

    if (col != null) {
        for (i = 0; i < col.length; i++) {
            if (col.item(i).tagName == "INPUT") {
                if (col.item(i).checked) {
                    return true;
                }
            }
        }
        return false;
    }
}

// RadioButtonListRequiredFieldValidator script
function radioButton_verify(sender, args) {
    var val = GetObject(GetObject(sender.id).controltovalidate);
    var col = val.all;

    if (col != null) {
        for (i = 0; i < col.length; i++) {
            if (col.item(i).tagName == "INPUT") {
                if (col.item(i).checked) {
                    return true;
                }
            }
        }
        return false;
    }
}

// Get Radio Button List Selected value
function getRadioButtonValue(controlId) {
    var val = GetObject(controlId);
    var col = val.all;

    if (col != null) {
        for (i = 0; i < col.length; i++) {
            if (col.item(i).tagName == "INPUT") {
                if (col.item(i).checked) {
                    return col.item(i).value;
                }
            }
        }

        return "";
    }
}

// show calendar
function ShowCalendar(id, informId) {
    return SetCalendarVisibility('visible', id, informId);
}

// hide calendar
function HideCalendar(id, informId) {
    return SetCalendarVisibility('hidden', id, informId);
}

// Set Calendar Visibility a calendar
function SetCalendarVisibility(visibility, id, informId) {
    object = GetObject(id);
    if (object) {
        object.style.visibility = visibility;

        informObject = GetObject(informId);
        if (informObject) {
            informObject.value = object.style.visibility;

            // Suppress server action if successfull
            return false;
        }
    }

    return true;
}

// toggle the visibility of the calendar
function ToggleCalendar(id, informId) {
    object = GetObject(id);
    if (object) {
        if (object.style.visibility == 'visible') {
            object.style.visibility = 'hidden';
        }
        else {
            object.style.visibility = 'visible';
        }

        informObject = GetObject(informId);
        if (informObject) {
            informObject.value = object.style.visibility;
            // Suppress server action if successfull
            return false;
        }
    }

    return true;
}

// Disable a button until the input value is not empty
function DisableButtonWhileEmpty(buttonId, inputId) {
    var button = GetObject(buttonId);
    var input = Trim(GetObject(inputId).value);

    if (input == "") {
        button.disabled = true;
        button.className = "ihsStandardButton hidden";
    }
    else {
        button.disabled = false;
        button.className = "ihsStandardButton pointer hidden";
    }

    addApplyStateToArray(buttonId, !button.disabled);
}

// Trim leading and trailing whitespace
function Trim(string) {
    while (string.substring(0, 1) == ' ') {
        string = string.substring(1, string.length);
    }
    while (string.substring(string.length - 1, string.length) == ' ') {
        string = string.substring(0, string.length - 1);
    }
    return string;
}

// Click a button if enter pressed in a field
function ClickButton(e, buttonId) {
    button = GetObject(buttonId);

    if (typeof button == 'object') {
        if (navigator.appName.indexOf("Netscape") > (-1)) {
            if (e.keyCode == 13) {
                button.click();
                return false;
            }
        }
        if (navigator.appName.indexOf("Microsoft Internet Explorer") > (-1)) {
            if (event.keyCode == 13) {
                button.click();
                return false;
            }
        }
    }
}

// Timeout Dialog
function SessionTimeout(dialog) {
    // Check whether a timeout its actually necessary (there may have been AJAX CallBacks keeping
    // the server session alive since the last PostBack)
    var timeNow = new Date();
    var timeOutTime = new Date(_lastServerContact.valueOf());

    timeOutTime.setMinutes(timeOutTime.getMinutes() + _sessionLength);
    //timeOutTime.setSeconds(timeOutTime.getSeconds() - 30); //minus 30 seconds...this hopefully gives the timeout page time to load and look at session data

    if (timeOutTime > timeNow) {
        // Defer the timeout
        var interval = timeOutTime.getTime() - timeNow.getTime();

        window.setTimeout('SessionTimeout(' + dialog + ')', interval);
    }
    else {
        // we've timed out so show a transparent mask and setup its click event.
        _timedOut = true;
        $("#masterTimeoutWrapper").show();
        $("#masterTimeoutWrapper").click(function () {
            if (dialog) {
                window.close();
            }
            else {
                location.href = _sessionTimeoutUrl;
            }
        }
        );
    }
}

// Timeout Dialog
function SessionPoll(interval) {
    var that = this;
    var timeoutUrl = _sessionTimeoutUrl;
    $.ajax({
        type: "POST",
        url: "/keepSessionAlive.axd",
        dataType: "json"
    }).done(function (data, textStatus, jqXHR) {
        if (data == undefined) {
            that.ShowError("Error attempting to keep session alive.", 1200);
            window.setTimeout('SessionPoll(' + interval + ')', interval);
        }
        else if (data.errorMessage == '') {
            window.setTimeout('SessionPoll(' + interval + ')', interval);
        } else {
            console.log('SessionPoll log: ' + data.errorMessage);
            _timedOut = true;
            $("#masterTimeoutWrapper").show();
            $("#masterTimeoutWrapper").click(function () {
                location.href = timeoutUrl;
            });
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        //if fixes the ajax failure when user navigates to new page while ajax call is active
        if (!that._pageUnloading) {
            console.log('SessionPoll Ajax Failure:');
            _timedOut = true;
            $("#masterTimeoutWrapper").show();
            $("#masterTimeoutWrapper").click(function () {
                location.href = timeoutUrl;
            });
        }
    });
}

//events to check max length - needed for text area as .Net doesn't support the maxlength attribute
function MaxLengthOnKeyPress(element, eve) {
    var sKey = String.fromCharCode(eve.keyCode);

    if (element.getAttribute("MaxLength")) {
        var sLength = element.getAttribute("MaxLength");
        var sText = new String();
        sText = element.value + sKey;
        if (sText.length > sLength) eve.returnValue = false;
    }
}

// Set up selected dates for the calendar control
function SelectDate(hiddenId, date) {
    var hidden = GetObject(hiddenId);
    var button = GetObject(hiddenId.replace("_hidDate", "_btnChangeDate"));

    if (hidden && button) {
        hidden.value = date;
        try {
            button.click(); //IE
        }
        catch (e) {
            eval(button.href); //FireFox
        }
    }
}

var _applyButtonState = new Array();

function checkApplyAll() {
    if (_applyAllButtonId != null && typeof (_applyAllButtonId) != "undefined") {
        var applyButton = GetObject(_applyAllButtonId);
        var disabled = true;
        if (applyButton != null) {
            //loop round all tree hidden fields
            for (var x = 0; x < _applyButtonState.length; x++) {
                if (_applyButtonState[x].substring(_applyButtonState[x].indexOf("||") + 2, _applyButtonState[x].length) == "true") {
                    disabled = false;
                    break;
                }
            }

            applyButton.disabled = disabled;
        }
    }
}

//Adds the state of the apply button of a control to an array for use to enable/disable the apply all button
function addApplyStateToArray(id, enabled) {
    //add/update the state of the button in the apply all array
    for (var x = 0; x < _applyButtonState.length; x++) {
        if (_applyButtonState[x].substring(0, _applyButtonState[x].indexOf("||")) == id) {
            _applyButtonState.splice(x, 1);
            break;
        }
    }

    _applyButtonState[_applyButtonState.length] = id + "||" + enabled;

    checkApplyAll();
}

//used to cancel non-navigable node clicks
function treLinkTree_NodeClick(treeId, nodeId, button) {
    var tree1 = igtree_getTreeById(treeId);
    var nodeClicked = igtree_getNodeById(nodeId);
    var nodeTag = nodeClicked.getTag()

    if (typeof (nodeTag) == "undefined" || nodeTag == null || nodeTag == "") {
        tree1.CancelPostBack = true;
    }
}

/// Data Listing TreeClick function
function OnCurrentDataListingTreeClick(evt) {
    var src = window.event != window.undefined ? window.event.srcElement : evt.target;
    var nodeClick = src.tagName.toLowerCase() == "a";
    if (nodeClick) {
        var nodeText = src.innerText;
        var nodeValue = GetNodeValue(src);
        //alert("Text: "+nodeText + "," + "Value: " + nodeValue);

        var hidCurrentDataListing = GetObject("ctl00_mainContent_hidCurrentDataListing")
        if (!(typeof (hidCurrentDataListing) == "undefined" || hidCurrentDataListing == null || hidCurrentDataListing == "")) {
            hidCurrentDataListing.value = nodeValue;
        }
    }
    //return false; //uncomment this if you do not want postback on node click
}

//Gets value of tree node
function GetNodeValue(node) {
    //node value
    var nodeValue = "";
    var nodePath = node.href.substring(node.href.indexOf(",") + 2, node.href.length - 2);
    var nodeValues = nodePath.split("\\");
    if (nodeValues.length > 1) nodeValue = nodeValues[nodeValues.length - 1];
    else nodeValue = nodeValues[0].substr(1);
    return nodeValue
}

var _infoOriginal = '';
function SetInfo(text) {
    var info = GetObject("ctl00_divInfo")
    if (info != null) {
        if (event.type == 'mouseover') {
            _infoOriginal = info.innerText;
            info.innerText = text;
        }
        else if (event.type == 'mouseout')
            info.innerText = _infoOriginal;
    }
}

function Set_Cookie(name, value, expires, path, domain, secure) {
    // set time, it's in milliseconds
    var today = new Date();
    today.setTime(today.getTime());

    /*
    if the expires variable is set, make the correct
    expires time, the current script below will set
    it for x number of days, to make it for hours,
    delete * 24, for minutes, delete * 60 * 24
    */
    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));

    document.cookie = name + "=" + value +
    ((expires) ? ";expires=" + expires_date.toGMTString() : "") +
    ((path) ? ";path=" + path : "") +
    ((domain) ? ";domain=" + domain : "") +
    ((secure) ? ";secure" : "");
}

function Get_Cookie(check_name) {
    // first we'll split this cookie up into name/value pairs
    // note: document.cookie only returns name=value, not the other components
    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false; // set boolean t/f default f

    for (i = 0; i < a_all_cookies.length; i++) {
        // now we'll split apart each name=value pair
        a_temp_cookie = a_all_cookies[i].split('=');

        // and trim left/right whitespace while we're at it
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

        // if the extracted name matches passed check_name
        if (cookie_name == check_name) {
            b_cookie_found = true;
            // we need to handle case where cookie has no value but exists (no = sign, that is):
            if (a_temp_cookie.length > 1) {
                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
            }
            // note that in cases where cookie is initialized but no value, null is returned
            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if (!b_cookie_found) {
        return null;
    }
}

/**  Create value for Google adverts, all the ads on the same page want the same ord so here is a good place to put it.      **/
var ord = (Math.random() * 1000000000000).toString().substring(0, 8);

/**  gets used when getting data back from google ads  **/
function unjsEncode(string) {
    var newstring = string.replace(/\\x/g, '%');
    newstring = newstring.replace(/\\n/g, '');
    newstring = newstring.replace(/\\"/g, '"');
    newstring = decodeURIComponent(newstring);
    return newstring;
}


function ShowSuccess(text, timeout) {
    ShowAlert(1, text, timeout)
}

function ShowInfo(text, timeout) {
    ShowAlert(2, text, timeout)
}

function ShowError(text, timeout) {
    ShowAlert(3, text, timeout)
}

function ShowAlert(t, text, timeout) {
    $("#quickMessage").text(text);
    $("#quickMessage").fadeIn();
    if (timeout == undefined) {
        timeout = 800;
    }
    setTimeout(function () { $("#quickMessage").fadeOut(); }, timeout);
}

function ShowNotifications() {
    $("#notifications").toggle("drop", { direction: 'down' });
}

function CloseNotifications() {
    $("#notifications").toggle("drop", { direction: 'down' });
}

function SwitchOffNotifications() {
    CloseNotifications();

    var urlPath = window.location.pathname + "/SwitchOffNotifications";

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: urlPath,
        async: true
    });
}

var filterContainerDivToSlide;
var filterContainerCssTop;
var filterContainerWidth;
var cookie_name = "CMP_Filters_" + document.location.toString().split("?")[0]; //global as used elsewhere
var filterContainerShouldStayOpen = false;

try {
    $(document).ready(function () {
        if (typeof (filterContainerCssTop) !== "undefined") {
            $('#ctl00_searchPanelContainer').css('top', +filterContainerCssTop + 130 + 'px');//the argument here is set up in master page
        }

        var filtersButton = $("#ctl00_searchPanelContainer .showFilters");
        if (filtersButton.length > 0 && _fullScreen == false) {
            var filterPositionStatus = Get_Cookie(cookie_name);
            if (filterPositionStatus == null || (filterPositionStatus == "OPEN" && !filtersButton.hasClass("show"))) {
                setTimeout(function () { showFilters(false); }, 100);
                $('.ui-jqgrid-hdiv').addClass('open');
            }
        }

        setTimeout(Resize, 500);
    });
}
catch (eX) {; }

function showFilters(doAnimate) {
    var filtersButton = $("#ctl00_searchPanelContainer .showFilters");
    var panelContainer = $("#ctl00_searchPanelContainer");
    var divToSlide;
    var animateSpeed = 250;

    if (typeof (filterContainerWidth) == "undefined") {
        filterContainerWidth = 200;
    }

    if (typeof (filterContainerDivToSlide) == "undefined") {
        divToSlide = $("#mainarea");
    }
    else {
        // find the first div that is actually in play
        var allDivs = filterContainerDivToSlide.split(",");
        for (var i = 0; i < allDivs.length; i++) {
            var tmp = $(allDivs[i]);
            if (tmp.length > 0) {
                divToSlide = tmp;
                break;
            }
        }
    }

    if (divToSlide == null || divToSlide.length == 0) {
        // still nothing to slide - use default
        divToSlide = $("#mainarea");
    }

    if (typeof (doAnimate) != "undefined" && !doAnimate) {
        animateSpeed = 0;
        // set it up for its start position
        divToSlide.css('margin-left', filterContainerWidth + 'px');
    }

    panelContainer.width(filterContainerWidth);

    if (filtersButton.hasClass("show") && !filterContainerShouldStayOpen) {
        //close it
        panelContainer.animate({ 'left': '-' + (filterContainerWidth - 10) + 'px' }, animateSpeed, function () {
            $(document).trigger(ResizeEventCalled);
            $('#filterMenuControlWrapper').hide();
            $(document).trigger('FilterContainerMoved');
        });

        filtersButton.removeClass("show");
        filtersButton.css("left", filterContainerWidth + 'px');
        $('.ui-jqgrid-hdiv').removeClass('open');
        try {
            divToSlide.animate({ 'margin-left': '15px' }, animateSpeed);
        } catch (e) {; }

        Set_Cookie(cookie_name, "CLOSED", 7, "", "", false);
    }
    else {
        //open it
        try {
            divToSlide.animate({ 'margin-left': filterContainerWidth + 'px' }, animateSpeed);
        } catch (e) {; }

        $('#filterMenuControlWrapper').show();
        panelContainer.animate({ 'left': '-5px' }, animateSpeed, function () {
            $(document).trigger(ResizeEventCalled);
            setTimeout(AdjustSearchBox, 500);
            $(document).trigger('FilterContainerMoved');
        });
        filtersButton.css("left", filterContainerWidth + 'px');
        filtersButton.addClass("show");
        $('.ui-jqgrid-hdiv').addClass('open');
        Set_Cookie(cookie_name, "OPEN", 7, "", "", false);
    }
}

function AdjustSearchBox() {
    // ensures that the search box is visible on the first appearence of the screen. Large grids for example can push the searchbox off screen.
    var searchBox = $("div.searchboxFancy");
    var UIBounds = getUIBounds();
    if (searchBox.length > 0 && searchBox.position().left + searchBox.width() > UIBounds.w) {
        searchBox.css("right", "");
        searchBox.css("left", UIBounds.w - searchBox.width() - 50);
    }
        //Added else as it never went back to it's original position
    else {
        searchBox.css("left", "");
        searchBox.css("right", "");
    }
}

///Confirm any action f.e. deletion
function ConfirmAction(message) {
    if (confirm(message)) {
        return true;
    }
    return false;
}

// Prevent tabs from wrapping
function smallTabs() {
    $(".tab_menu").each(function (index) {
        $(this).removeClass('small');
        if ($(this).height() > 45) {
            $(this).addClass('small');
        }
    });
};
$(document).ready(function () {
    smallTabs();
    $(window).bind('resize', smallTabs);
    $(window).bind('beforeunload', function () {
        _pageUnloading = true;
    });
    //dialog box close
    $('.dialog .close').click(function () {
        $(this).parent().hide();
    });

    // prevent infoBar hiding Filter container
    if ($("#header .infoBar").length != 0 && $(".filterContainer").length != 0) {
        $(".filterContainer").css("margin-top", "26px");
    }
});

function UpdateCurrentSavedSearchBySSID(ssid, url) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: _SessionSearchUpdateReceiverUrl + "UpdateSessionSearch",
        data: '{ "val":"' + ssid + '" }',
        success: function (msg) {
            location.href = url;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) { ShowError("An error occurred setting Session Search by ssid. " + errorThrown); }
    });
}

function AddNewItemToMySearches(ssItemID, ssName) {
    var divSavedSearches = window.parent.$("div[id$='divSavedSearches']");

    if (divSavedSearches.length > 0) {

        //remove existing when overwriting
        $(divSavedSearches).find('a').each(
            function () {
                if ($(this).text() == ssName) {
                    $(this).parent().remove();
                }
            }
         )

        var urlToGoTo = window.parent.location.pathname;
        var newListItemMarkup = '<li class="savedsearchdropdownListItem"><input type="checkbox" class="savedsearchdropdownListItemCheckbox" ssid="' + ssItemID + '" id="savedsearchdropdownListItemCheckbox_0_' + ssItemID + '" onclick="SavedSearchDropdownClicked(this)"><label class="tipsicalRight" for="savedsearchdropdownListItemCheckbox_0_' + ssItemID + '" title="Click two or more saved searches to merge"></label><a class="tipsical savedsearchdropdownListItemAnchor" onclick="UpdateCurrentSavedSearchBySSID(\'' + ssItemID + '\',\'' + urlToGoTo + '\');"   style="cursor: pointer;">' + ssName + '</a></li>';
        window.parent.$("#savedsearchdropdownListControl").prepend(newListItemMarkup);
        $(divSavedSearches).find(".tipsical.disabled").remove(); // remove 'You have not yet saved any searches for this category.' text
    }
}

function SavedSearchDropdownClicked(something) {
    /**

        1, see how many searches are checked
        2, if < 2 hide merge searches button and return
        3, if > 1 show merge searches button and return;
    **/
    if ($('.savedsearchdropdownListItemCheckbox:checked').length > 1) {
        $('#savedsearchdropdownMergeSearchListItem').removeClass("hidden");
    }
    else {
        $('#savedsearchdropdownMergeSearchListItem').addClass("hidden");
    }
}
function MergeSearches(parentContainer) {
    $('#savedsearchdropdownMergeSearchAnchor').addClass("savedsearchLoading");

    //trap the empty new search name
    if ($('#MergeSavedSearchNewtitleInput').val() == "") {
        $('#MergeSavedSearchNewtitleInput').val("My Latest Merged Search");
    }
    var removeSearches = $('#chkKeepSearches:checked').length < 1;

    var newsearchtitle = $('#MergeSavedSearchNewtitleInput').val();

    var searchIds = [];
    $('.savedsearchdropdownListItemCheckbox:checked').each(function () {
        searchIds.push($(this).attr("ssid"));
    });

    // run the service
    var req = $.ajax({
        type: "POST",
        url: urlToSearchPanelService + "MergeSearches",
        contentType: "application/json; charset=utf-8",
        data: '{"searchIds":"' + searchIds.join("$") + '", "newSearchTitle":"' + newsearchtitle +
                '","keepExisting":"' + !removeSearches + '"}'
    });
    req.done(function (msg) {
        var newSSID = msg.d;

        $('.savedsearchdropdownListItemCheckbox:checked').each(function () {
            if (removeSearches) {
                $(this).parent('li').addClass("hidden");
            }

            $(this).click();
        })

        AddNewItemToMySearches(newSSID, newsearchtitle);
        $('#savedsearchdropdownMergeSearchAnchor').removeClass("savedsearchLoading");
    });
    req.fail(function () {
        ShowError("Request failed: " + jqXHR.statusText);
        return null;
    })
}
// Inline dialog boxes
// Call using opendialog.call(this,"dialogposition","dialogclass");
var opendialog = function (dpos, did) {
    if (typeof did === "undefined") {
        var selector = '.dialog.arrow.' + dpos;
    } else {
        var selector = '.dialog.arrow.' + did;
    };
    var thisdialog = $(selector);
    var thisheight = $(this).height();
    var thiswidth = $(this).width();
    var thisdialogheight = thisdialog.outerHeight();
    var thisdialogwidth = thisdialog.outerWidth();
    var thispos = $(this).offset();
    var ba = $(".bottomadd");
    var ta = $(".topadd");
    var la = $(".leftadd");
    var ra = $(".rightadd");
    var or = $(".offsetright");
    var callback = function (e) {
        if (!$(e.target).parents().andSelf().is('.dialog')) {
            thisdialog.hide();
            ba.removeClass("bottom bottomadd").addClass("top");
            ta.removeClass("top topadd").addClass("bottom");
            la.removeClass("left leftadd").addClass("right");
            ra.removeClass("right rightadd").addClass("left");
            or.removeClass("offsetright");
            $(document).off('click', callback);
        }
    };
    console.log(this);
    $(".dialog").hide();
    ba.removeClass("bottom bottomadd").addClass("top");
    ta.removeClass("top topadd").addClass("bottom");
    la.removeClass("left leftadd").addClass("right");
    ra.removeClass("right rightadd").addClass("left");
    or.removeClass("offsetright");
    if (dpos == "top") {
        thisdialog.addClass("top").css({
            top: thispos.top - thisdialogheight - thisheight + 5,
            left: thispos.left - (thisdialogwidth / 2) + (thiswidth / 2)
        });
        if (thisdialog.offset().top > (thispos.top - thisdialogheight)) {
            thisdialog.removeClass("top").addClass("bottom bottomadd").css({
                top: thispos.top + thisheight + 15
            });
        } else if (thispos.left - (thisdialogwidth / 2 - thiswidth / 2) < 0) {
            console.log("off to left", thispos.left - (thisdialogwidth / 2 - thiswidth / 2))
            thisdialog.addClass("offsetright").css({
                left: thispos.left - (thisdialogwidth / 10) + (thiswidth / 2)
            });
        };
    } else if (dpos == "bottom") {
        thisdialog.addClass("bottom").css({
            top: thispos.top + (thisdialogheight / 2) - 15,
            left: thispos.left - (thisdialogwidth / 2) + (thiswidth / 2)
        });
        if (((thispos.top + thisdialogheight + thisheight) - (thisdialog.offset().top)) > ($(window).height())) {
            thisdialog.removeClass("bottom").addClass("top topadd").css({
                top: thispos.top - thisdialogheight - thisheight + 5
            });
        }
    } else if (dpos == "right") {
        thisdialog.addClass("right").css({
            top: thispos.top - (thisdialogheight / 2) + (thisheight / 2),
            left: thispos.left + thiswidth + 15
        });
        if ((thispos.left + thiswidth + thisdialogwidth) > $(window).width()) {
            thisdialog.removeClass("right").addClass("left leftadd").css({
                left: thispos.left - (thisdialogwidth) - 15
            });
        };
    } else if (dpos == "left") {
        thisdialog.addClass("left").css({
            top: thispos.top - (thisdialogheight / 2) + (thisheight / 2),
            left: thispos.left - (thisdialogwidth) - 15
        });
        if ((thispos.left - thisdialogwidth - 15) < 0) {
            thisdialog.removeClass("left").addClass("right rightadd").css({
                left: thispos.left + thiswidth + 15
            });
        };
    }
    thisdialog.fadeIn('fast', function () {
        if (thisdialog.is(":visible")) {
            $(document).on('click', callback);
        }
    });
};

//Checks whether an item (e.g. a variable or function) exists within the current page
function doesExist(itemName) {
    return typeof window[itemName] !== "undefined";
}

function loadUrlWithRequestCancel(url) {
    window.location = url;
}