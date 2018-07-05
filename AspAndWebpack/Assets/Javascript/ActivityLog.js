/**
 * A class for logging activity. For the values for event and level see the class ActivityLogs enums.
 */
CMP.Utils.ActivityLog = {

    logUrl:  "/{categoryKey}/Activity/{event}/{level}?message={message}",
     
    /**
     * Log an activity.
     * @param {string} categoryKey - The category.
     * @param {string} event - The event type number. Refer to ActivityLog.
     * @param {string} level - The level type number. Refer to ActivityLog.
     * @param {integer} message - The message to log.
     */
    log: function (categoryKey, event, level, message) {
        try {

            // Add the url to the message as default.
            message += "::" + window.location.href;
            var url = CMP.Utils.ActivityLog.logUrl;

            url = url.replace("{categoryKey}", encodeURIComponent(categoryKey));
            url = url.replace("{event}", encodeURIComponent(event));
            url = url.replace("{level}", encodeURIComponent(level));
            url = url.replace("{message}", encodeURIComponent(message));

            var xhttp = new window.XMLHttpRequest();

            xhttp.open("GET", url, true);
            xhttp.send();

            return true;

        } catch (e) {
            console.log("ActivityLog problem in log " + e.toString());
            return false;
        }
    }
};
 