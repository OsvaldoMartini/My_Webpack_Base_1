function Delete(appName) {
    if (!confirm('Are you sure you want to delete your history?')) return false;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/MyHistory/Delete",
        data: '{ "appName":"' + appName + '" }',
        success: function (msg) {
            window.location.reload();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred deleting the file. " + errorThrown);
        }
    });
}