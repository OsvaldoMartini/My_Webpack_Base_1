$(document).ready(function () {
    if (window.location.hash) {
        $(window.location.hash).addClass('blue4-bg');
    }

    $('select.emailDDL').change(function () {
        Update($(this).attr("dataId"));
    });
    $('select.attachmentDDL').change(function () {
        Update($(this).attr("dataId"));
    });
    // load the share dialog
    $("#ShareDialog").load("/Share/Populate", function () {
        InitShare();
    });
});
 
function ViewSearchKeyUp(event, id) {
  event = event || window.event;
  if (event.keyCode === 32 || event.keyCode === 13) { 
    ViewSearch(id);
  }
}

function ViewSearch(id) {
  /**  ViewSearch(string searchId, string providerName) **/
  location.assign("/MySavedSearches/ViewSearch?searchId="+id);
    return false;
}

function RSSSearch(searchId, userId) {
    window.open('/Rss/Show/0?userId=' + userId + '&searchId=' + searchId, '', "width=700,height=800,location=1,menubar=1,toolbar=1,status=1,scrollbars=1,resizable=1,left=10,top=10");
    return false;
}

function ToggleDefaultSearch(id, catKey , catId) {
    var $divToGrey = $('#' + id);
    var $defaultSearchLink = $('#defaultSearchLink' + id);
    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MySavedSearches/ToggleDefaultSearch",
        data: '{ "id":"' + id + '", "categoryId":"' + catId + '"}',
        success: function (msg) {
            if ($defaultSearchLink.hasClass("icon-plus-squared")) {
                //turn off any others for this cat
                var previousOnIcon = $('i.defSearch' + catKey);
                if ((previousOnIcon).length > 0) {
                    $(previousOnIcon).removeClass("icon-ok-squared");
                    $(previousOnIcon).addClass("icon-plus-squared");
                }

                $defaultSearchLink.removeClass("icon-plus-squared");
                $defaultSearchLink.addClass("icon-ok-squared").addClass("defSearch" + catKey);
            }
            else
            {
                $defaultSearchLink.removeClass("icon-ok-squared");
                $defaultSearchLink.addClass("icon-plus-squared");
            }

            ShowSuccess("Default Set");
        },
        error: function (e) {
            ShowError("An error occurred updating the default search.");
        },
        complete: function () {
            $divToGrey.fadeTo("fast", 1);
        }
    });
}

function Update(id) {
    var $divToGrey = $('#' + id);
    $divToGrey.fadeTo("fast", 0.5);
    
    var title = $('#titleSpan' + id).text();
    var desc = $('#DescSpan' + id).text();
    var selectedEmail = $('#emailDDL' + id);
    var selectedAttachmentFormat = $('#attachmentDDL' + id);
    var alertFreq = 0;
    if (selectedEmail.length > 0) {
        alertFreq = selectedEmail.first().val();
    }
    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MySavedSearches/Update",
        data: '{ "id":"' + id + '","title":"' + title + '", "description":"' + desc
            + '", "emailAlert":true, "alertFrequency":' + alertFreq + ',"attachmentFormat":"' + selectedAttachmentFormat.val() + '" }',
        success: function (msg) {
            ShowSuccess("Saved");
        },
        error: function (e) {
            ShowError("An error occurred updating the saved search.");
        },
        complete: function () {
            $divToGrey.fadeTo("fast", 1);
        }
    });
}

function DeleteSavedSearch(id, categoryId) {

    if (!confirm('Are you sure you want to delete this search?')) return false;

    var $divToGrey = $('#' + id);
    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MySavedSearches/Delete",
        data: '{ "id":"' + id + '", "categoryId":"' + categoryId + '" }',
        success: function (msg) {
            $divToGrey.animate({ height: '10px', opacity: '0' }, "fast", function () { $divToGrey.remove(); });
        },
        error: function () {
            ShowError("An error occurred deleting the saved search.");
        }
    });
}

function ToggleTitleEdit(id) {
    var textboxWrapper = $('#titleEdit' + id);
    var input = textboxWrapper.find("input");
    var span = $('#titleSpan' + id);
    var pencil = $('#pencil' + id);
   
    updateOrReset(id, span, input);
 
    span.toggleClass('hidden');
    pencil.toggleClass('hidden');
    textboxWrapper.toggleClass('hidden');
    input.focus().select();
}

function ToggleDescEdit(id) {
    var textboxWrapper = $('#descEdit' + id);
    var input = textboxWrapper.find("textarea");
    var span = $('#DescSpan' + id);
    var pencil = $('#DescPencil' + id);

    updateOrReset(id, span, input);

    span.toggleClass('hidden');
    pencil.toggleClass('hidden');
    textboxWrapper.toggleClass('hidden');
    input.focus().select();
}

function updateOrReset(id, span, input) {
    if (!span.hasClass("hidden")) {
        return;
    }
    var editedText = input.val();
    if (editedText == span.text()) {
        return;
    }
    editedText = $.trim(editedText);
    if (editedText || input.is('textarea')) {
        span.text(editedText);
        Update(id);
        return;
    }
    input.val(span.text());
}

function ToggleNewsletterSubscription(id, userId) {
    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MySavedSearches/NewsletterSubscription",
        data: '{ "id":' + id + ',"userId":"' + userId + '"}',
        success: function (msg) {
            ShowSuccess("Saved");
        },
        error: function (e) {
            ShowError("An error occurred when trying to change newsletter subscription.");
        }
    });
    return false;
}