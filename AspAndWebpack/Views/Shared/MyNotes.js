$(document).ready(function () {
    // load the share dialog
    $("#ShareDialog").load("/Share/Populate", function () {
        InitShare();
    });
});

function EnableSubmitButton() {
    var txtBox = $("#newNoteTxt", "#newNote");
    var btnSubmit = $("#btnNoteSubmit", "#newNote");
    
    if (txtBox.val() == "") {
        btnSubmit.addClass("disabled");
    }
    else {
        btnSubmit.removeClass("disabled");
    }
}

function SaveNote(categoryKey, articleId) {
    var txtBox = $("#newNoteTxt", "#newNote");
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyNotes/Save",
        data: '{ "categoryKey":"' + categoryKey + '","articleId":"' + articleId + '","note":"' + txtBox.val() + '" }',
        success: function (msg) {
            txtBox.val("");
            $("#btnNoteCancel", "#newNote").trigger('click');

            $("#notesContainer").fadeOut('slow', function () {
                $("#notesContainer").load("/MyNotes/PopulateForArticle?articleId=" + articleId + "&categoryKey=" + categoryKey, function () {
                    // re-load the share dialog
                    $("#ShareDialog").load("/Share/Populate", function () {
                        InitShare();
                    });

                    ApplyTipsyToolTips(".tipsyMe", "n");
                    $("#notesContainer").fadeIn('slow');
                });
            });
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred saving the note. " + errorThrown);
        }
    });
}

function ShowEdit(rowid) {
    $("#" + rowid + "_original").hide();
    $("#" + rowid + "_pencil").hide();
    $("#" + rowid + "_search").hide();
    $("#" + rowid + "_new").show();
    $("#" + rowid + "_new").find("textarea").focus().select();
}

function UpdateEdit(rowid, noteid) {
    var txtBox = $("#" + rowid + "_new");
    var txt = txtBox.find("textarea").val();
    var theRow = $("#" + rowid).children("td");
    theRow.fadeTo("fast", 0.5);

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyNotes/Update",
        data: '{ "id":"' + noteid + '","text":"' + txt + '" }',
        success: function (msg) {
            ShowSuccess("Saved");
            // update the original
            var original = $("#" + rowid + "_original");
            var pencil = $("#" + rowid + "_pencil");
            var search = $("#" + rowid + "_search");

            original.text(txt);
            original.show();
            pencil.show();
            search.show();
            txtBox.hide();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred updating the note. " + errorThrown);
        },
        complete: function () {
            theRow.fadeTo("fast", 1);
        }
    });
}

function CancelEdit(rowid) {
    var original = $("#" + rowid + "_original");
    var pencil = $("#" + rowid + "_pencil");
    var txtBox = $("#" + rowid + "_new");
    var search = $("#" + rowid + "_search");

    // reset the textbox to the original
    txtBox.find("textarea").val(original.text());
    txtBox.hide();
    original.show();
    pencil.show();
    search.show();
}

function DeleteNote(rowId, id) {

    if (!confirm('Are you sure you want to delete this note?')) return false;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyNotes/Delete",
        data: '{ "id":"' + id + '" }',
        success: function (msg) {
            var rowToRemove = $("#" + rowId);
            if (rowToRemove.length > 0) {
                if (rowToRemove.is("tr")) {
                    rowToRemove.children("td, th").animate({ padding: 0 }, 'fast').wrapInner("<div />").children().animate({ opacity: 0 }, 'fast', function () {
                        $(this).closest('tr').remove();
                        $(".noteCatRow", "#noteTable").each(function () {
                            if ($(this).next().hasClass("noteCatRow") || $(this).next().length == 0) {
                                $(this).children("td, th").animate({ padding: 0 }, 'fast').wrapInner("<div />").children().animate({ opacity: 0 }, 'fast', function () { $(this).closest('tr').remove(); });
                            }
                        });
                    });
                }
                else {
                    rowToRemove.slideUp('fast', function () { $(this).remove(); });
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred deleting the note. " + errorThrown);
        }
    });
}

function ViewDocument(articleId, categoryKey)
{
    window.open('/' + categoryKey + '/Display/' + ((articleId||'')+'').trim() + '?from=Notes', '_blank', '');
}