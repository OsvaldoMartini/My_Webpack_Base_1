$(document).ready(function () {

    $("#toggleTextHighlighting").click(function () {
        UpdateProfile('{ "val":' + !this.checked + ' }', "DisableTextHighlighting");
    });

    $("#toggleSlimLinePanels").click(function () {
        UpdateProfile('{ "val":' + !this.checked + ' }', "DisableSlimLinePanels");
    });
    
    $(".panelSelection").click(function () {
        // find all the panel toggles and form a pipe separated key value pair to pass to the method
        var panelToggles = $(".panelSelection");
        if (panelToggles.length > 0) {
            var panelConfig = "";

            for (var i = 0; i < panelToggles.length; i++) {
                var pToggle = panelToggles[i];
                if (panelConfig != "") {
                    panelConfig = panelConfig + "|";
                }

                panelConfig = panelConfig + pToggle.id + "=" + pToggle.checked;
            }

            UpdateProfile('{ "appName":"' + currentApp + '", "catId":"' + currentCatId + '", "panelConfig":"' + panelConfig + '" }', "UpdatePanelVisibility");
        }
    });
});

function UpdateProfile(d, method) {
    // update the profile
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: _profileUpdateService + method,
        data: d,
        success: function (msg) {
            ShowSuccess("Profile Saved");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ShowError("An error occurred updating user profile. " + errorThrown);
        }
    });
}