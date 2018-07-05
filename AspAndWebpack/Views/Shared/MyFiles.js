function DeleteMyFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return false;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyFiles/Delete",
        data: '{ "fileId":"' + fileId + '" }',
        success: function (msg) {
            var rowToRemove = $("#" + fileId);
            if (rowToRemove.length > 0) {
                rowToRemove.children("td, th").animate({ padding: 0 }, 'fast').wrapInner("<div />").children().animate({ opacity: 0 }, 'fast', function () {
                    $(this).closest('tr').remove();
                    $(".myFileCatRow", "#myFileTable").each(function () {
                        if ($(this).next().hasClass("myFileCatRow") || $(this).next().length == 0) {
                            $(this).children("td, th").animate({ padding: 0 }, 'fast').wrapInner("<div />").children().animate({ opacity: 0 }, 'fast', function () { $(this).closest('tr').remove(); });
                        }
                    });
                });
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred deleting the file. " + errorThrown);
        }
    });
}