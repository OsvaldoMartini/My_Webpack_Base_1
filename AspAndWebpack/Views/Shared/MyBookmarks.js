$(document).ready(function () {

    $(".alertToggle", "#bookmarkTable").click(function () {
        UpdateBookmark($(this).attr("data-content"), this.checked);
    });

    // load the share dialog
    $("#ShareDialog").load("/Share/Populate", function () {
        InitShare();
    });
});

function SaveBookmark(categoryKey, docId, title) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyBookmarks/Save",
        data: '{ "categoryKey":"' + categoryKey + '","docId":"' + docId + '","title":"' + title + '"}',
        success: function (msg) {
            if (msg == "true") {
                ShowSuccess("Bookmark added");
            }
            else {
                ShowInfo("Bookmark already exists", 800);
            }
        },
        error: function () { ShowError("An error occurred adding the bookmark."); }
    });
}

function UpdateBookmark(id, isEmailAlert) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyBookmarks/Update",
        data: '{ "id":"' + id + '","isEmailAlert":"' + isEmailAlert + '" }',
        success: function (msg) {
            ShowSuccess("Bookmark Saved");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred updating the bookmark. " + errorThrown);
        }
    });
}

function DeleteBookmark(rowId, id) {

    if (!confirm('Are you sure you want to delete this bookmark?')) return false;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyBookmarks/Delete",
        data: '{ "id":"' + id + '" }',
        success: function (msg) {
            var rowToRemove = $("#" + rowId);
            if (rowToRemove.length > 0) {
                rowToRemove.children("td, th").animate({ padding: 0 }, 'fast').wrapInner("<div />").children().animate({ opacity: 0 }, 'fast', function () {
                    $(this).closest('tr').remove();
                    $(".bookmarkCatRow", "#bookmarkTable").each(function () {
                        if ($(this).next().hasClass("bookmarkCatRow") || $(this).next().length == 0) {
                            $(this).children("td, th").animate({ padding: 0 }, 'fast').wrapInner("<div />").children().animate({ opacity: 0 }, 'fast', function () { $(this).closest('tr').remove(); });
                        }
                    });
                });
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred deleting the bookmark. " + errorThrown);
        }
    });
}