// <copyright file="SearchResultsNews.js" company="IHS">
// Copyright © 2012 IHS Inc. and its affiliated and subsidiary companies, all
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


var autoPage = 2; //how many times the newscontrol will auto page, after this the button becomes visible - $('div').unbind('inview');
var NewsDataPageNumber = 1;
var NewsPageSize = 0;
var LastRowOfNewsControl;

//   NewsItemIndex PLACEHOLDER - this is set by the newscontrol to inform the javascript how big the first page was
// lblItems PLACEHOLDER, if calling page wants a field updated with a count, it will be called lblItems
// TotalNewsItems PLACEHOLDER, news control write jscript to populate a value called TotalNewsItems

$(document).ready(function () {

    $("#btnShowMoreNews").css("display", "none");
    $('#Loading').css("display", "none");

    $('.newsItemCountLabel').tipsy({ gravity: 'n', delayIn: 200, delayOut: 200, fade: true });

    LastRowOfNewsControl = $('tr .NEWSCONTROLFINALROWMARKER:first');
    //$('tr .NEWSCONTROLFINALROWMARKER:first td:first').text("");

    $(LastRowOfNewsControl).bind('inview', function (event, visible) {
        if (visible == true) {

            if (TotalNewsItems > NewsItemIndex) {

                if (autoPage >= NewsDataPageNumber) {
                    $('#Loading').css("display", "block");
                    getData();
                }
                else {
                    // we  have as many automatic pages as we want, now its manual via clicking the button
                    $(LastRowOfNewsControl).unbind('inview');
                    $("#btnShowMoreNews").css("display", "block");
                    $('#Loading').css("display", "none");

                }
            }
        }
    });

});


function ReceiveServerDataBind(arg, context) {

    /**
    Format = TotalItems={0}|ItemIndex={1}|PageSize={2}|||ControlHTML
    
    workflow
    0. increment the pagenumber
    1. split string by the first ||| - we control this value
    2. split[0] is then split by single pipe 
    3. if pagesize + itemindex < totalItems, we need to allow another call - set moreDataAvailable to true else false
    4. the controlHTML then gets its rows stripped out and injected to the bottom of the newscontrol table via the NEWSCONTROLFINALROWMARKER flag

    **/

    $('#Loading').css("display", "none");

    var pageDetails = arg.substr(0, arg.indexOf('|||'));
    var pageDetailsArray = pageDetails.split("|");
    var controlHTML = arg.substr(arg.indexOf('|||') + 3, arg.length - arg.indexOf('|||') + 3);

    NewsItemIndex = parseInt(pageDetailsArray[1].substr(10, pageDetailsArray[1].length - 10));
    NewsPageSize = parseInt(pageDetailsArray[2].substr(9, pageDetailsArray[2].length - 9));

    NewsItemIndex = NewsItemIndex + NewsPageSize;

    // if the page has specified lblItems then update this now
    var lblItems = $('.newsItemCountLabel');
    if (lblItems.length > 0) {
        if (TotalNewsItems > NewsItemIndex)
        { lblItems.text(NewsItemIndex + " of " + TotalNewsItems + " items"); }
        else
        { lblItems.text(TotalNewsItems + " items"); }
    }


    //alert(arg); 
    var s = $('tr .NEWSCONTROLFINALROWMARKER');
    var rows = $("tr", $(arg));
    NewsDataPageNumber++;

    $(s).before(rows);

}


function GetMoreData() {
    $('#Loading').css("display", "block");
    getData('LoadMore:' + NewsDataPageNumber.toString());

}

// get the data from the server
function getData(params) {
    $(".ui-jqgrid .loading").css("display", "block");
    _lastServerContact = new Date();

    try { CallServerForDataBind('LoadMore:' + NewsDataPageNumber.toString()); }
    catch (e) { }
}

