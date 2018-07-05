// <copyright file="Grid.js" company="IHS">
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

var _numberOfScrollsAllowed = 3;
var _counter = 1;
var _busy = false;
var _disableScrollDataRetrieval = false;
/*The following variables are dynamically added from the code behind
_displayAmount
_totalItems
_compileLimit
_compileLimitWarning
_showDisplayText
*/

$(document).ready(function () {
    $(document).bind('FilterContainerMoved', function (e) { ResetFixedHeaders(); });
});

function ReviewGridData(thegrid, parsedArgs)
{
    // placeholder to allow pages to override this function - used in RRI
}

function ReceiveServerDataBind(arg, context) {
    if (typeof (delayPanelQueue) != "undefined") {
        delayPanelQueue = false;
    }
    
    // add the returned data to the grid
    var thegrid = jQuery(_gridId);
  
    if (_totalItems == 1) {
        $("#itemLabel").text("Item");
    }
    else //gets changed elsewhere also
    {
        $("#itemLabel").text("Items");
    }
     //  custom function to execute before the common grid code does its bit
    //  called in JTICOnlineGridPage initially
    try
    {
        if (doesExist("PostDataRecieveFunction") && PostDataRecieveFunction != null) {
            arg = PostDataRecieveFunction(arg, thegrid);
        }
    }
    catch(e)
    {
        //cw(e.message);
    }

    //note this must happen after postDataReceiveFunction as could be unexpected stuff in the args which grid doesnt and shouldnt know how to deal with
    var parsedArgs = JSON.parse(arg);

    ReviewGridData(thegrid, parsedArgs);

    thegrid[0].addJSONData(parsedArgs);
    _busy = false;

    var moreButton = $('#btnShowMore');
    var displayLabel = $("#lblDisplayAmount");

    //show the show more button if we are at the designated page chunk.
    if (_counter % _numberOfScrollsAllowed == 0)
    {
        moreButton.css("display", "block");
    }
    else
    {
        moreButton.css("display", "none");
    }

    var fromVal = 1;
    if (_totalItems == 0) fromVal = 0;
    //update the display
    if ((_displayAmount * _counter) >= _totalItems)
    {
        if (_showDisplayText)
        {
            displayLabel.text(fromVal + " - " + _totalItems);
        }

        moreButton.css("display", "none");
        page = false;
    }
    else
    {
        page = true;
        if (_showDisplayText)
        {
            displayLabel.text(fromVal + " - " + (_displayAmount * _counter));
        }

        _counter = _counter + 1;
    }

    $(".ui-jqgrid-bdiv").css("overflow", "auto");
    $(".ui-jqgrid-bdiv").css("position", "relative");
    //the line above displays a scroll bar regardless of content - this line removes the height setting on the child element which makes the scroll bar disappear when not needed.
    $(".ui-jqgrid-bdiv > div").filter(":first").css("height", "");
    // there is a mysterious div which in most browsers is set to 0 height but in some (seen in IE 6/7/8) its set to a large pixel value causing
    // white space before the results are displayed.
    $(".ui-jqgrid-bdiv > div > div").css("height", "0px");

    var filterContainer = $("#ctl00_searchPanelContainer");
    if (filterContainer.length > 0) {
        // add extra padding to allow for the search panel pull out button
        $(".ui-jqgrid").addClass("SearchPanelGridPadding");
    }

    // hook up the window scrollbar to retrieve more data and fix headers.
    var scrolling = null;
    $(window).scroll(function () 
    {
        if (!_timedOut) 
        {
            if (!_disableScrollDataRetrieval) {

                if ((_counter - 1) % _numberOfScrollsAllowed > 0 && _busy == false && ($(this).scrollTop() + 1000) > ($(document).height() - $(this).height())) {
                    _busy = true;
                    if (page) {
                        var params =
                        {
                            "Event": 'loadmore',
                            "PageNumber": _counter
                        };

                        getData(params);
                    }
                }
            }

            if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 7)) 
            {
                //fix headers
                FixHeaders();
            }
        }
    });

    //re bind checkbox events so newly added controls get the events also.
    var checkboxes = $(".gridCheckbox input[type=checkbox]");
    if (bowser.msie)
    {
        //resolves IE issue with change event not firing when expected.
        checkboxes.on("click", function (event)
        {
            this.blur();
            this.focus();
        });
    }

    checkboxes.on("change", function (event)
    {
        if ($(this).is(':checked'))
        {
            $(this).attr("checked", "checked");
        }
        else
        {
            $(this).removeAttr("checked");
        }
    });

    if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 7))
    {
        // disabled for IE7 and below due to poor performance.
        if (typeof (_runImagePopup) != "undefined" && _runImagePopup) {
            HookupImagePopup();
        }

        $(".tooltip").tipsy({ gravity: 's', delayIn: 200, delayOut: 200, fade: true });
        $("a.share").tipsy({ gravity: 's', delayIn: 700, delayOut: 100, fade: true });
        $("a.bookmark").tipsy({ gravity: 's', delayIn: 700, delayOut: 100, fade: true });
    }

    if (!_isSingleColumn && !_isThumbnailColumn)
    {
        ApplyFilterHover();
    }

    if (_totalItems == 0)
    {
        $('#gbox_ctl00_mainContent_gridResults_grid1').hide();
    }
    $('.LoadingDiv').css("display", "none");

    setupCollapsibles();
}

var setupCollapsibles = function () {

    var $collapsableToggles = $("#gbox_ctl00_mainContent_gridResults_grid1 [data-toggle=collapse]");

    $collapsableToggles.addClass("collapsed").attr("aria-expanded", false);

    $collapsableToggles.click(function (event) {

        $(this).toggleClass("collapsed");

        var expanded = $(this).attr("aria-expanded");
        $(this).attr("aria-expanded", expanded === "false" ? true : false);

        var targetId = $(this).attr("href");
        var $target = $(targetId);

        $target.slideToggle("fast");

        event.stopImmediatePropagation();
    });

};

// when we have a grid, hook up 
$(document).bind('SessionSearchChangedEvent', function (e) { UpdateGridAsSessionSearchUpdated(); });
$(document).bind('SessionSearchIndexerChangedEvent', function (e) { UpdateGridAsSessionSearchUpdated(); });

function UpdateGridAsSessionSearchUpdated()
{
        var params = {
        "Event": 'SENDGRIDPARAMSFORNEWSEARCH',
        "SortKey": '',
        "SortDirection": 'Asc',
        "PageNumber": '1'
        };

        getData(params);

}

// get the data from the server
function getData(params)
{
    $('.LoadingDiv').css("display", "block");
    var left = (window.pageXOffset || document.documentElement.scrollLeft) + 600;
    $('.LoadingDiv').css("float", "left");
    $('.LoadingDiv').css("margin-left", left + "px");
    $('#btnShowMore').css("float", "left");
    $('#btnShowMore').css("margin-left", left + "px");

    _lastServerContact = new Date();

    // poll until the panels have stopped populating
    if (typeof(panelOpenRequestPending) != "undefined" && panelOpenRequestPending) {
        setTimeout(getData, 500, params);
    }
    else {
        CallServerForDataBind(JSON.stringify(params));
    }
}

// clear the grid an repopulate with the next page.
function ShowMore()
{
    var params = {
        "Event": 'loadmore',
        "PageNumber": _counter
    };

    $('#btnShowMore').css("display", "none");

    getData(params);
}

function ResetFixedHeaders() {

    // if the filters move in or out reset to the top of the screen so that fix headers works correctly.
    if (headerTop != null) {
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        headerTop = null;
        FixHeaders();
    }
}

function FixHeaders()
{
    var theWindow = $(window);
    var gridBarWrapper = $("#gridBarWrapper");
    var gridBar = $(_resultsId + " .gridBar");
    var headerDiv = $(_resultsId + " .ui-jqgrid-hdiv");
    var theGrid = $(_resultsId + " .ui-jqgrid");
    var actionsMenu = $(".actions .actionsMenu");

    if (gridBarWrapper.length > 0)
    {
        // variable gridBarWrapperWidth is setup in the resize code of scripts.js
        gridBarWrapper.width(gridBarWrapperWidth + theWindow.scrollLeft());
    }

    if (gridBar.length > 0)
    {
        // what the y position of the scroll is    
        var y = theWindow.scrollTop();
        
        // find the initial position of the header used when scrolling so the header floats.
        if (headerTop == null || headerTop < 1) {
            headerTop = gridBar.offset().top - parseFloat(gridBar.css('margin-top').replace(/auto/, 0));
            headerLeft = headerDiv.offset().left - parseFloat(headerDiv.css('margin-left').replace(/auto/, 0));
            gridBarLeft = gridBar.offset().left - parseFloat(gridBar.css('margin-left').replace(/auto/, 0));
        }

        // whether that's below the form    
        if (y >= headerTop)
        {
            // if so, ad the fixed class      
            gridBar.addClass('fixed');
            $('.SearchPanelGridPadding').addClass('fixed');

            if (actionsMenu.length > 0)
            {
                actionsMenu.addClass('fixed');
            }

            gridBar.css('left', gridBarLeft - theWindow.scrollLeft());

            if (!_isSingleColumn && !_isThumbnailColumn && headerDiv.length > 0)
            {
                headerDiv.addClass('fixed');
                //need to adjust the top
                headerDiv.css('top', gridBar.height());
                headerDiv.css('left', headerLeft - 20 - theWindow.scrollLeft());
            }
        }
        else
        {
            // otherwise remove it      
            gridBar.removeClass('fixed');
            $('.SearchPanelGridPadding').removeClass('fixed');
            
            if (actionsMenu.length > 0)
            {
                actionsMenu.removeClass('fixed');
            }

            if (!_isSingleColumn && !_isThumbnailColumn && headerDiv.length > 0)
            {
                headerDiv.removeClass('fixed');
                headerDiv.css('top', '');
            }

            headerTop = null;
        }
    }
}

function ApplyFilterHover()
{
    var columns = $(_gridId).getGridParam('colModel');
    for (var i = 0; i < columns.length; i++)
    {
        if (columns[i].filterable)
        {
            $(_resultsId + " .ui-jqgrid-bdiv > div table tr td:nth-child(" + (i+1) + ")").hover(function () { $(this).addClass("filterCellHover"); }, function () { $(this).removeClass("filterCellHover"); });
        }
    }
}

function NudgeGrid()
{
    var gridDiv = $(_resultsId + " .ui-jqgrid-bdiv > div");
    gridDiv.css("display", "none");
    gridDiv.css("display", "block");
}

function open_page(url)
{
    Wait(false);
    location.href = url;
}

function btnCustomise_Click()
{
    Wait(false);

    var url = "/GridConfig.aspx?Ref=" + location.href;

    //If the search key exists on the page, append it to the end
    if (applySessionKeyToURL !== undefined)
        url = applySessionKeyToURL(url);

    location.href = url;
    return false;
}

// Taken out of the markup in grid.ascx so easier to debug etc.
function gridComplete2()
{
    var bigData = "";
    var columns = $(_gridId).getGridParam('colModel');
    var colsToSplit = [];

    for (i = 0; i < columns.length; i++) {
        if (columns[i].split_before_filtering) {
            colsToSplit.push(columns[i]);
        }
    } 

    if (colsToSplit.length > 0) {
        var rows = jQuery(_gridId).getDataIDs();
        for (rowid = 0; rowid < rows.length; rowid++)
        {
            for (z = 0; z < colsToSplit.length; z++) {
                var cellData = jQuery(_gridId).getCell(rows[rowid], colsToSplit[z].index);

                //check we havent already edited this one.
                if (cellData.indexOf("onclick") == -1) {
                    var arr = cellData.split(",");

                    for (var l = 0; l < arr.length; l++) {
                        arr[l] = "<a href='#' onclick='gridSplitLinkClick(\"" + colsToSplit[z].index + "\",\"" + arr[l] + "\")'>" + arr[l] + "</a>";
                    }
                    cellData = arr.join();
                    jQuery(_gridId).setCell(rows[rowid], colsToSplit[z].index, cellData);
                }
                 
            }

        }
    }
     
}

function gridSplitLinkClick(name, content) {
    CMPPostback("GRIDCELLFILTER", name + "|" + content);
}