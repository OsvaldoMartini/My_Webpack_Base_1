/**
 * A class for logging JavaScript errors. Will send a log to the server to be recorded.
 */
CMP.Utils.ErrorLogging = {

    /**
     * A value indicating whether or not to suppress alerts.
     */
    suppressAlerts: false,

    /**
     * The URL to post the error logs to.
     */
    logUrl:
        "/Error/LogError",

    /**
     * The arguments to post.
     */
    logParameters: "logType={logType}&language=JavaScript&message={message}&source={source}&lineNumber={lineNumber}&stack={stack}",

    /**
     * Log an error.
     * @param {string} message - The description of the error.
     * @param {string} source - The url to the file which the error occurred in.
     * @param {integer} lineNumber - The row position on the page that the error occurred on. 
     * @param {integer} columnNumber - The column position on the page that the error occurred. Only available in HTML5 browsers.
     * @param {Error} error - The vanilla error object. Contains properties such as the name, description and stack trace of the error. Only available in HTML5 browsers.
     * @returns {boolean} - Whether or not to suppress the alerts.
     */
    logError : function(message, source, lineNumber, columnNumber, error) {
        return CMP.Utils.ErrorLogging.log("Error", message, source, lineNumber, columnNumber, error);
    },

    /**
     * Log a warning.
     * @param {string} message - The description of the error.
     * @param {string} source - The url to the file which the error occurred in.
     * @param {integer} lineNumber - The row position on the page that the error occurred on. 
     * @param {integer} columnNumber - The column position on the page that the error occurred. Only available in HTML5 browsers.
     * @param {Error} error - The vanilla error object. Contains properties such as the name, description and stack trace of the error. Only available in HTML5 browsers.
     * @returns {boolean} - Whether or not to suppress the alerts.
     */
    logMessage: function (message, source, lineNumber, columnNumber, error) {
        return CMP.Utils.ErrorLogging.log("Message", message, source, lineNumber, columnNumber, error);
    },

    /**
     * Log a JavaScript error event.
     * @param {string} logType - The type of log e.g. "Error" or "Message"
     * @param {string} message - The description of the error.
     * @param {string} source - The url to the file which the error occurred in.
     * @param {integer} lineNumber - The row position on the page that the error occurred on. 
     * @param {integer} columnNumber - The column position on the page that the error occurred. Only available in HTML5 browsers.
     * @param {Error} error - The vanilla error object. Contains properties such as the name, description and stack trace of the error. Only available in HTML5 browsers.
     * @returns {boolean} - Whether or not to suppress the alerts.
     */
    log: function(logType, message, source, lineNumber, columnNumber, error) {
        try {
            var postUrl = CMP.Utils.ErrorLogging.logUrl;
            var args = CMP.Utils.ErrorLogging.logParameters;

            args = args.replace("{logType}", logType ? encodeURIComponent(logType) : "Error");
            args = args.replace("{message}", message ? encodeURIComponent(message) : "");
            args = args.replace("{source}", source ? encodeURIComponent(source) : "");
            args = args.replace("{lineNumber}", lineNumber || "");

            // Note that columnNumber & error are new to the HTML 5 specification.
            args = args.replace("{stack}", (error && error.stack) ? encodeURIComponent(error.stack) : "");

            //Use vanilla requests in case JQuery references throw errors.
            var xmlhttp = new window.XMLHttpRequest();

            xmlhttp.open("POST", postUrl, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(args);

            // If you return true, then error alerts (like in older versions of IE) will be suppressed.
            return CMP.Utils.ErrorLogging.suppressAlerts;
        } catch (e) {
            //We don't want the error logging to trip up the application.
            console.log("Error logging has failed... " + e.toString());
            return true;
        }
    }
};

//Link the global window error with the error logger's log function.
window.onerror = CMP.Utils.ErrorLogging.logError;