/*
 * By including this file on the page you add 'default load of the announcement popups' functionality
 * on any MVC page that inherits from _LayoutMain.cshtml.
 */

$(function () {
    new announcementPopups();
});

var announcementPopups = function () {
    var self = this;
    self.init();
}
announcementPopups.prototype.init = function () {
    var path = location.pathname;

    var page = JSON.stringify({
        page: path
    });

    this.getAnnouncements(page, function (data) {
        if (data !== null && data != undefined) {
            var cookieName = "IHS_POPUP_" + data.ID;
            var cookies = "; " + document.cookie;
            var parts = cookies.split("; " + cookieName + "=");

            var cookieValue = null;
            if (parts.length === 2) {
                cookieValue = parts.pop().split(";").shift();
            }

            if (cookieValue == null || cookieValue !== "DISABLED") {
                var template = "<div><p>" + data.Body + "</p></div>";
                showPopup(data.Title, template, function () {
                    var outOfDate = new Date();
                    outOfDate.setTime(outOfDate.getTime() + (365 * 24 * 60 * 60 * 1000));
                    document.cookie = cookieName + "=DISABLED; expires=" + outOfDate.toUTCString() + "; path=/";
                });
            }
        }
    });
}

announcementPopups.prototype.getAnnouncements = function (parameters, successCallback) {
    var baseurl = "/Announcement/GetPopup";
    $.ajax({
        url: baseurl,
        cache: false,
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: parameters,
        success: successCallback,
        error: function (xhr, textStatus, errorThrown) {
            //console.log(errorThrown + " " + xhr.responseText + " " + textStatus);
        }
    });
}