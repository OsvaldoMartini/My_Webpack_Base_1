// <copyright file="ResultsGrid.js" company="IHS">
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

/*The following variables are dynamically added from the code behind
_displayAmount
_totalItems
_compileLimit
_compileLimitWarning
_showDisplayText
*/

function ReceiveServerDataBind(arg, context, gridParams) {

    var jsonArg = JSON.parse(arg);
    gridParams.displayCount = jsonArg.records;
    var gridId = gridParams.gridId;

    // add the returned data to the grid
    var thegrid = $(context);
    thegrid[0].addJSONData(jsonArg);
    
    var moreButton = $('#btnShowMore');
    $('#gridDescription').html(jsonArg.description);

    //show the show more button if we are at the designated page chunk.
    if (gridParams.scrollLimit == -1) {
        moreButton.css("display", "none");
    } 
    else  if ( gridParams.scrollCounter % gridParams.scrollLimit == 0) {
        moreButton.css("display", "block");
    }
    else {
        moreButton.css("display", "none");
    }

    //update the display
    if (gridParams.displayCount >= gridParams.totalItems) {
        if (gridParams.showDisplayText) {
            displayLabel.text("1 - " + gridParams.totalItems);
        }

        moreButton.css("display", "none");
        page = false;
    }
    else {
        if (gridParams.showDisplayText) {
            displayLabel.text("1 - " + gridParams.displayCount);
        }

    }

    if (gridParams.totalItems == 1) {
        $("#itemLabel").text("Item");
    }

    //Scrolling has to be done after the results are bound to the grid as the element doesn't exist until then.
    if (gridParams.scrollingControl != null) {
        var scrollingCon = $('.ui-jqgrid-bdiv');
        var scrollC = $(gridId).find(scrollingCon);
        $(gridId).find(gridParams.scrollingControl).bind('scroll', [gridParams], scrollGrid);
    } else {
        $(window).bind('scroll', [gridParams], scrollGrid);
    }


    $(".ui-jqgrid-bdiv").css("position", "relative");
    //the line above displays a scroll bar regardless of content - this line removes the height setting on the child element which makes the scroll bar disappear when not needed.
    $(".ui-jqgrid-bdiv > div").filter(":first").css("height", "");


    //re bind checkbox events so newly added controls get the events also.
    if (bowser.msie) {
        //resolves IE issue with change event not firing when expected.
        $('.gridCheckbox input[type=checkbox]').on("click", function (event) {
            this.blur();
            this.focus();
        });
    }

    $(".gridCheckbox input[type=checkbox]").on("change", function (event) {
        if ($(this).is(':checked')) {
            $(this).attr("checked", "checked");
        }
        else {
            $(this).removeAttr("checked");
        }
    });

    if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 7)) {
        // disabled for IE7 and below due to poor performance.
        $(".tooltip").tipsy({ gravity: 's', delayIn: 200, delayOut: 200, fade: true });

        if (gridParams.runImagePopup) {
            HookupImagePopup();
        }
    }

    gridParams.loading = false;
    thegrid.css("display", "inline");
    $(gridParams.loadingControl).fadeOut();
}

function getData(searchParams, gridIdentifier, callFunction, gridParams) {

    var urlPath = window.location.pathname + "/" + callFunction;
    var parameterJson = JSON.stringify(searchParams);
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: urlPath,
        data: parameterJson,
        dataType: "json",
        async: true,
        success: function (data) {
            ReceiveServerDataBind(data.d, gridIdentifier, gridParams);
        },
        error: function (result) {
            //Supressed Error atm, will need to think about what we do with this.
        }
    });
}

/*
*
* Since the scrolling container is external to the jqGridGrid we need to find the contained Grid.
*
*/
function scrollGrid(event) {

    var gridparams = event.data[0];

    var scroll = ((gridparams.scrollLimit <= 0) || (gridparams.scrollCounter <= gridparams.scrollLimit));

    if (scroll &&
       (gridparams.loading == false) &&
       (this.scrollHeight <= (this.offsetHeight + this.scrollTop)) &&
       (gridparams.totalItems > gridparams.displayCount)) {

        gridparams.loading = true;
        $(gridparams.loadingControl).fadeIn();

        gridparams.scrollCounter += 1;

            var params = {
                "EventType": 'loadmore',
                "PageNumber": gridparams.scrollCounter,
                "SortKey": gridparams.sortName,
                "SortDirection": gridparams.sortOrder
            };

            getData(params, gridparams.gridId, gridparams.callbackFunctionName, gridparams);
    }

    var scrolling = null;

    if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 7)) {
        //fix headers - use a timer to limit the amount of times its performed in IE
        if (scrolling) clearTimeout(scrolling);
        scrolling = setTimeout(function () {
            FixHeaders(gridparams.singleColumn);
            FixHeaders(gridparams.thumbnailView);
        }, 100);
    }
}


function FixHeaders(isSingleColumn) {
    var theWindow = $(window);
    var gridBarWrapper = $("#gridBarWrapper");
    var gridBar = $('.gridBar');
    var headerDiv = $('.ui-jqgrid-hdiv');
    var actionsMenu = $('.actionsMenu');
    var headerTop;
    var headerLeft;

    if (gridBarWrapper.length > 0) {
        // variable gridBarWrapperWidth is setup in the resize code of scripts.js
        gridBarWrapper.width(gridBarWrapperWidth + theWindow.scrollLeft());
    }

    if (gridBar.length > 0) {
        // what the y position of the scroll is    
        var y = theWindow.scrollTop();

        // whether that's below the form    
        if (y >= headerTop) {
            // if so, ad the fixed class      
            gridBar.addClass('fixed');

            if (actionsMenu.length > 0) {
                actionsMenu.addClass('fixed');
            }

            gridBar.css('left', headerLeft - theWindow.scrollLeft());

            if (!isSingleColumn && headerDiv.length > 0) {
                headerDiv.addClass('fixed');
                //need to adjust the top
                headerDiv.css('top', gridBar.height());
                headerDiv.css('left', headerLeft - theWindow.scrollLeft());
            }
        }
        else {
            // otherwise remove it      
            gridBar.removeClass('fixed');

            if (actionsMenu.length > 0) {
                actionsMenu.removeClass('fixed');
            }

            if (!isSingleColumn && headerDiv.length > 0) {
                headerDiv.removeClass('fixed');
                headerDiv.css('top', '');
            }
        }
    }
}

function NudgeGrid() {
    var gridDiv = $(".ui-jqgrid-bdiv > div");
    gridDiv.css("display", "none");
    gridDiv.css("display", "block");
}

function open_page(url) {
    Wait(false);
    location.href = url;
}

function btnCustomise_Click() {
    Wait(false);
    var url = "/GridConfig.aspx?Ref=" + location.href;

    //If the search key exists on the page, append it to the end
    if (applySessionKeyToURL !== undefined)
        url = applySessionKeyToURL(url);

    location.href = url;
    return false;
}

/*
* Sets up the results Grid
*
* Scrolling control - which container is use to monitor the scolling of the grid. I.e. Window scrolling or a div container.
* Scroll Counter - the var to count how many times the results have been scrolled.
*/
function GridSetup(gridparams) {

    var gridId = gridparams.gridId;
    var columnDefinition = gridparams.columns;
    var portionSize = gridparams.pageSize;
    var sortName = gridparams.sortName;
    var sortOrder = gridparams.sortOrder;
    var altRows = gridparams.altRows;
    var altClass = gridparams.altClass;
    var callbackFunctionName = gridparams.callbackFunctionName;
    var firstload = gridparams.firstload;
    var isSingleColumn = gridparams.singleColumn;
    var isThubmnailColumn = gridparams.thumbnailView;
    var gridHeight = gridparams.height ? gridparams.height : '100%';
    var gridWidth = gridparams.width ? gridparams.width : '100%';


    $(gridparams.loadingControl).fadeIn();

    var theGrid = $(gridId);
    var isLoading = false;

    theGrid.jqGrid({
        datatype: 'json',
        colModel: columnDefinition,
        rowNum: portionSize,
        sortname: sortName,
        sortorder: sortOrder,
        scroll: 1,
        loadui: 'disable',
        altRows: altRows,
        altclass: altClass,
        gridview: true,
        height: gridHeight,
        width: gridWidth,
        viewsortcols: [true, 'horizontal', true],

        onSortCol: function (colName, index, sortdir) {
            var theGrid = $(this);
            $(gridparams.loadingControl).fadeIn();
            theGrid.jqGrid("clearGridData", true);
            gridparams.scrollCounter = 1;

            var params = {
                "EventType": 'sort',
                "SortKey": colName,
                "SortDirection": sortdir,
                "PageNumber": gridparams.scrollCounter
            };

            getData(params, gridId, callbackFunctionName, gridparams);
            theGrid.setGridParam({ sortname: colName });
            theGrid.setGridParam({ sortorder: sortdir });

            if (!isSingleColumn || !isThubmnailColumn) {
                $('.ui-jqgrid-hdiv').removeClass('fixed');
            }

            return 'stop';
        },

        beforeRequest: function () {
            // for FF, Chrome and Safari this event inside of CMP only gets called on initial load.
            // this code is then repeated in the gridComplete event when hooking onto the scroll event.
            if (firstload) {
                var params = {
                    "EventType": 'loadmore',
                    "PageNumber": gridparams.scrollCounter,
                    "SortKey": 'default',
                    "SortDirection": 'desc'
                };

                getData(params, gridId, callbackFunctionName, gridparams);
            }
        },

        gridComplete: function (data) {
            if (firstload && isSingleColumn || isThubmnailColumn) {
                //re-adjust the row width as we cannot specify percentage widths in the control
                $(this).css("width", "97%");

                $(".jqgfirstrow td").filter(":last").css("width", "97%");
                firstload = false;
            }

            if (bowser.msie && (parseInt(bowser.version, 10) == 7 || parseInt(bowser.version, 10) == 6)) {
                //no idea why but added these into the CSS file doesn't work.
                if ((!isSingleColumn || !isThubmnailColumn) && firstload) {
                    var sortIcons = $(".s-ico");
                    sortIcons.css("float", "none");
                    sortIcons.css("padding", "0");
                }
                //Major hack for IE7/6 - for some reason sometimes the grid results will disappear.
                //if you read the following this hints at the same issue. Something to do with touching the DOM and tables.
                //http://www.daniweb.com/web-development/web-design/html-and-css/threads/104211
                //The nudge basically hides then shows the grid again solving the issue.
                //As IE7/6 is a dying browser the hack is sufficient for now.
                setTimeout(NudgeGrid, 100);
            }

            firstload = false;
        }
       
    });

    if (isSingleColumn || isThubmnailColumn) {
        //hide the header
        $(".ui-jqgrid-hdiv").hide();
    }

}
