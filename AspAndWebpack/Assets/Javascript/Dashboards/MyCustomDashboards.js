function DeleteCustomDashboard(id, dashboardId) {

    if (!confirm('Are you sure you want to delete this custom dashboard?')) return false;

    var $divToGrey = $('#' + id);
    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/CustomDashboard/DeleteCustomDashboard",
        data: '{ "dashboardId":"' + dashboardId + '" }',
        success: function(msg) {
            $divToGrey.animate({ height: '10px', opacity: '0' }, "fast", function() { $divToGrey.remove(); });
        },
        error: function() {
            ShowError("An error occurred deleting the custom dashboard.");
        }
    });
}

function ToggleTitleEditCD(id) {
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

function ToggleDescEditCD(id) {
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

function Update(id) {
    var $divToGrey = $('#' + id);
    $divToGrey.fadeTo("fast", 0.5);

    var title = escapeHtml($('#titleSpan' + id).text());
    var desc = escapeHtml($('#DescSpan' + id).text());

    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/CustomDashboard/UpdateCustomDashboard",
        data: '{ "id":"' + id + '","name":"' + title + '", "description":"' + desc + '"}',
        success: function(msg) {
            ShowSuccess("Saved");
        },
        error: function(e) {
            ShowError("An error occurred updating the Dashboard.");
        },
        complete: function() {
            $divToGrey.fadeTo("fast", 1);
        }
    });
}

function escapeHtml(string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    return String(string).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
    });
}