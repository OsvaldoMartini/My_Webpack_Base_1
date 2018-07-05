var Dashboard = Dashboard ||
{
    dashboardVM: null,
    registerJavascriptObject: function(containerId, obj, callback) {
        if (Dashboard.dashboardVM) {
            this.dashboardVM.registerJavascriptObject(containerId, obj, callback);
        }
    },
    doubleCheckShowUnauthorisedWidgets: function () {
        var result = true;
        if (UserSettings) {
            result = UserSettings.getCookie("ShowUnauthorizedWidgets",
                "showUnauthorizedWidgets") === "true";
        }
        return result;
    }
};
$('.tooltip').tipsy({ gravity: 's', delayIn: 200, fade: true });
