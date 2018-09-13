//Javascript code supporting the HelpIndicators popup - which appears when a help indicator is clicked
var helpDialogWidth = 300;
$(document).ready(function () {
  $('.helpIndicatorDownloadLink').tipsy({ gravity: 's', delayIn: 800, delayOut: 100, fade: true, fallback: 'Download metadata definitions' });

  $('.helpIndicator').click(function () {
    // this one supports the old use of jquery UI being removed going over to MVC.
    var element = $(this);
    HookUpClick(element, true);
  });

  SetupHelpClick(document);
});

function SetupHelpClick(container) {
  $('.helpButton', container).click(function () {
    var element = $(this);
    HookUpClick(element, false);
  });
}

function HookUpClick(element, useJqueryUI) {
  if (!$.fn.modal) { useJqueryUI = true;}
    var helpGroupId = element.data("groupid");
    var helpItemId = element.data("itemid");
    var helpAppKey = element.data("appkey");
    var catKey = element.data("catkey");
    var helpItemTitle = element.data("helptitle") || '';
    LoadHelp(element, helpGroupId, helpItemId, helpAppKey, catKey, helpItemTitle, useJqueryUI);
}

function LoadHelp(element, helpGroupId, helpItemId, helpAppKey, catKey, helpItemTitle, useJqueryUI) {
    if (!helpGroupId || !helpItemId || !helpAppKey) {
        return;
    }

    if (openHelpSystem(helpGroupId, helpItemId, helpAppKey)) {
        return;
    }

    var url = "/Help/GetHelpDataForItem";

    var helpDialog = $("#helpIndicatorDialog");
    var helpDialogTitle = helpDialog.find(".helpIndicatorTitle");
    var helpDialogContent = helpDialog.find(".helpIndicatorContent");
    var helpDialogList = helpDialog.find(".helpIndicatorList");
    var downloadLink = helpDialog.find(".helpIndicatorDownloadLink");

    helpDialogList.empty();
    downloadLink.hide();
    helpDialogTitle.text(helpItemTitle || "Loading...");
    helpDialogContent.html("<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><div class='loading'/>");


    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: url,
        data: '{ "helpAppKey":"' + helpAppKey + '","helpGroupId":"' + helpGroupId + '","helpItemId":"' + helpItemId + '" }',
        success: function (callResult) {
            //The helpIndicator Dialog should already be on the page - its been added to the 2 master pages of the system                   


            if (useJqueryUI && helpDialog.dialog("isOpen")) {
                helpDialog.dialog("close");
            }

            if (!callResult.IsEmpty) {

                //To cover situations where the control title has been abbreviated and the help title has been specified in full.
                if (callResult.AlternativeTitle != null) {
                    helpItemTitle = callResult.AlternativeTitle;
                }

                if (typeof (catKey) == "undefined") {
                    downloadLink.hide();
                }
                else {
                    downloadLink.show();
                    downloadLink.attr('href', 'helpIndicatorDownload.axd?catKey=' + catKey);
                }
                helpDialogTitle.text(helpItemTitle);
                helpDialogContent.html(callResult.HelpContent);
                helpDialogList.empty();
                $.each(callResult.HelpSubItems, function (a, b) {
                    helpDialogList.append("<li><span class='helpIndicatorItemTitle'><b>" + a + "</b> - </span><span class='helpIndicatorItemContent'>" + b + "</span></li>");
                });

                if (useJqueryUI) {
                    helpDialog.dialog({ width: helpDialogWidth, show: { effect: "fade", duration: 200 }, position: { my: "left top", at: "right bottom", of: element }, modal: false, closeText: '', draggable: true, resizable: false });
                    helpDialog.dialog("open");
                }
            } else {
                ShowError("No help found for this item.");
            }
        },
        error: function (xhr, status, error) { ShowError("An error occurred attempting to retrieve the help for this item. " + error); }
    });
}

var openHelpSystem = function (helpGroupId, helpItemId, helpAppKey) {
    if (!window.helpLinks || !window.helpLinks[helpGroupId] || !window.helpLinks[helpGroupId][helpItemId]) {
        return false;
    }
    var helpLink = window.helpLinks[helpGroupId][helpItemId];
    if (!helpLink.link) {
        return false;
    }

    var helpHeight = 0;
    
    var baseUrl = window.helpLinks[helpGroupId]._baseUrl || "https://cdn.ihs.com/ADS/Help/AandD_4_06";

    var $popupContainer = $("#generalDialog");
    var $modalBody = $popupContainer.find(".modal-body");
    var $modalTitle = $popupContainer.find(".modal-title");
    $modalBody.html("<iframe src='" + baseUrl + "Content/" + helpLink.link + "' style='width: 100%;margin: -20px -20px -15px;width: calc(100% + 40px);height: 100%;border:0;height: calc(100% + 30px);'/>");
    $modalTitle.html("<span>" + helpLink.title + "</span><a href='"+baseUrl+"Default.htm#" + helpLink.link + "' target='help' class='btn btn-sm' style='position: absolute;top: 3px;right: 45px;color: #444;border: 1px solid #ccc;'><i class='icon-book-open'></i> View Full Help</a>");

    var dialog =
        $popupContainer.modal({
            backdrop: false
        })
        .find('.modal-dialog')
        .draggable({
            handle: ".modal-header"
        })
        //.find('.modal-content')
        .resizable({
            handles: 'n, e, s, w, ne, se, sw, nw',
            start: function (event, ui) {
                $('iframe', ui.originalElement).css('pointer-events', 'none');
            },
            stop: function (event, ui) {
                $('iframe', ui.originalElement).css('pointer-events', 'auto');
            }
        });

    if (!helpHeight && (!dialog.attr('style') || dialog.attr('style').indexOf('height') == -1)) {
        helpHeight = $(window).height() / 2;
        dialog.css('height', helpHeight);
    }
    
    var removeHeight = function () {
        dialog.css('height', '');
        $popupContainer.off('hidden.bs.modal', removeHeight);
    };
    $popupContainer.on('hidden.bs.modal', removeHeight);

    $popupContainer.addClass('draggable');
    var helpDialog = $("#helpIndicatorDialog");
    var preventHelpModal = function (e) {
        helpDialog.off('show.bs.modal', preventHelpModal);
        if ($(e.relatedTarget).data('itemid') == helpItemId) {
            e.preventDefault();
            return false;
        }
    };
    helpDialog.on('show.bs.modal', preventHelpModal);

    return true;
};

var HelpLink = function (appKey, groupId, itemId, catKey, itemTitle) {
    var self = this;

    var settings = {};
    if (typeof appKey == 'object') {
        settings = appKey;
        appKey = '';
    }

    self.appKey = settings.AppKey || appKey||'';
    self.groupId = settings.GroupId || groupId || '';
    self.itemId = settings.ItemId || itemId || '';
    self.catKey = settings.CatKey || catKey || '';
    self.itemTitle = settings.ItemTitle || itemTitle || '';
    self.show = ko.computed(function () { return self.appKey && self.groupId && self.itemId });

    self.onClick = function (help, e) {
        LoadHelp(e.currentTarget, self.groupId, self.itemId, self.appKey, self.catKey, self.itemTitle, false);
    }
};
