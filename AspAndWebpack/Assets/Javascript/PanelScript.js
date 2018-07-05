// Copyright © IHS Energy 2014
var panelQueue = new Array();
var panelQueueType = new Array();
var panelCompleteQueue = new Array();
var panelQueuePosition = 0;
var panelOpenRequestPending = false;
var panelAutoStartHandler;
var delayPanelQueue = false;

$(document).ready(function () {

    var prm = Sys.WebForms.PageRequestManager.getInstance();
    if (prm != null) {
        prm.add_endRequest(PanelEndRequest);
    }

    panelAutoStartHandler = setInterval(OpenPanels, 500);

    if (bowser.msie && parseInt(bowser.version, 10) > 8) {
        $(".navigatorPanel img:not([src])").height(0);
        $(".navigatorPanel img:not([src])").width(5);
    }
});

function PanelEndRequest(sender, args) {
    PanelEnded();
}

function RegisterPanelForOpen(panelId, type) {
    var total_items = panelQueue.length;

    if (panelId.indexOf("_divPanel") == -1) {
        panelId = panelId + "_divPanel";
    }

    panelQueue[total_items] = panelId;
    panelQueueType[total_items] = type;

    OpenPanels();
}

function OpenPanels() {
    if (!delayPanelQueue) {
        // use a queuing mechanism as multiple update panels may be firing at the same time.
        if (!panelOpenRequestPending) {
            if (panelQueue[panelQueuePosition]) {
                panelQueuePosition = panelQueuePosition + 1;

                if (panelQueueType[panelQueuePosition - 1] == "simple") {
                    ShowHidePanel(panelQueue[panelQueuePosition - 1]);
                    PanelEnded(panelQueue[panelQueuePosition - 1]);
                }
                else {
                    // ajax panel
                    panelOpenRequestPending = true;

                    // if the panel has already been opened then there is no request needed
                    if (panelCompleteQueue.indexOf(panelQueue[panelQueuePosition - 1]) > -1) {
                        panelOpenRequestPending = false;
                    }
                    
                    ShowHidePanel(panelQueue[panelQueuePosition - 1]);
                }
            }
        }
        clearInterval(panelAutoStartHandler);
    }
}

function PanelEnded() {
    panelOpenRequestPending = false;

    if (panelQueuePosition > 0) {
        var panelId = panelQueue[panelQueuePosition - 1];

        if (typeof (panelId) != "undefined") {
            var innerPanel = $("#" + panelId.replace("_divPanel", "_divPanelI"));
            if (innerPanel.length > 0) {
                // if there is a quick search box then remove the hidden class
                $(innerPanel).find("div[id*='searchImage']").removeClass("hidden");
            }
        }
    }

    if (bowser.msie && parseInt(bowser.version, 10) > 8) {
        $("img:not([src]").height(0);
        $("img:not([src]").width(5);
    }

    // open the next in the queue
    OpenPanels();
}

function ShowHidePanel(panelId)
{
    _disableWait = true;
    var thePanel = $("#" + panelId);
    var panelParent = thePanel.parent();

    var show = thePanel.css('display') != 'block';

    if (panelParent.length > 0 && panelParent.attr("id") == "masterLinksInner") {
        // hide all right hands
        $('#masterLinksInner .panelOuter').each(
        function () {
            if ($(this).attr('id') != panelId) {
                $(this).hide();
            }
        });
    }
    else {

        if (show) {
            $("#" + panelId + "Header > a[id*='btnStick']").removeClass().addClass("panelPinOn");
        }
        else {
            $("#" + panelId + "Header > a[id*='btnStick']").removeClass().addClass("panelPinOff");
        }
    }

    // toggle the panel
    thePanel.toggle('fast');
    
    if (show)
    {
        if (panelCompleteQueue.indexOf(panelId) == -1) {
            // add the panel id to an array of already opened panels
            var total_items = panelCompleteQueue.length;
            panelCompleteQueue[total_items] = panelId;
        }

        // Kick of the demand load process
        var demandLoad = GetObject(panelId.replace("_divPanel", "_btnDemandLoad"));
        if (demandLoad != null)
        {
            var hidId = panelId.replace("_divPanel", "_hidLoaded");
            var hidLoaded = GetObject(hidId);

            if (hidLoaded.value != "1")
            {
                try
                {
                    _lastServerContact = new Date();

                    // Programatically 'click' the Demand Load button (only works in IE)
                    demandLoad.click();
                }
                catch (e)
                {
                    // Programatically 'click' the Demand Load button (Firefox etc.)
                    eval(demandLoad.href);
                }
            }
        }
    }

    return false;
}