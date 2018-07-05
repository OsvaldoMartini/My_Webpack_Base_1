/**
 * A collection of functions for handling the feedback survey to https://survey.us.confirmit.com
 */
var FeedbackSurvey = {

    surveyUrl: "http://survey.us.confirmit.com/wix/p3085573647.aspx",

    cookieName: "IHS_FEEDBACK_SURVEY",

    cookieDays: 30,

    userAccountProperty: "FeedbackSurveyNextDate",

    // When the user clicks 'go to survey'
    //     cookie or profile next show date are set to this.cookieDays in the future and new tab presents survey
    launch: function (isIndividual, pageUrl) {

        Analytics.event("Survey", "Launch", pageUrl);

        if (!isIndividual) {
            Cookies.createCookie(this.cookieName, "taken", this.cookieDays);
        } else {
            var now = new Date(Date.now());
            now.setDate(now.getDate() + this.cookieDays);

            this.setSetting(this.userAccountProperty, now.toISOString());
        }

        var tab = window.open(this.surveyUrl, "_blank");
        tab.focus();
    },

    // When the user clicks 'close'
    //     cookie or profile next show date are set to this.cookieDays in the future and dialog closes
    closed: function(isIndividual, pageUrl) {

        Analytics.event("Survey", "Not Launched", pageUrl);

        if (!isIndividual) {
            Cookies.createCookie(this.cookieName, "not-taken", this.cookieDays);
        } else {
            var now = new Date(Date.now());
            now.setDate(now.getDate() + this.cookieDays);

            this.setSetting(this.userAccountProperty, now.toISOString());
        }
    },

    // Determine if next show date has passed (if so, display modal)
    needsDisplayByCookie: function (callback, timeout) {

        var self = this;
        timeout = timeout || 0;

        setTimeout(function() {
            if (Cookies.readCookie(self.cookieName) === null) {
                callback(true);
            }

            if (Cookies.readCookie(self.cookieName) !== "") {
                callback(false);
            }

            return true;
        },
        timeout);
    },

    // Determine if next show date has passed (if so, display modal)
    needsDisplayByProfile: function (callback, timeout) {
        var self = this;
        timeout = timeout || 0;

        setTimeout(function() {
            self.getSetting(self.userAccountProperty,
                function(result) {
                    if (result === "") {
                        callback(true);
                        return;
                    }

                    // we assume expire time has been stored as ISO date
                    var date = new Date(result);
                    var now = new Date(Date.now());

                    if (now > date) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
        },
        timeout);
    },

    setSetting: function (property, value) {
        $.post("/MyProfile/SetSetting?propertyName=" + property + "&value=" + value);
    },

    getSetting: function (property, callback) {
        $.ajax({
            type: "GET",
            url: "/MyProfile/GetSetting?propertyName=" + property,
            success: callback,
            error: function (e) { /* error */ }
        });
    }
}