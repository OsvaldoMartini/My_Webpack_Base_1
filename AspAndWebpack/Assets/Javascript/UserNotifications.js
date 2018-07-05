$(function () {
    if (typeof _ == "function" && typeof ko === "object") {
        new userNotifications();
    }
});
var userNotifications = function () {
    var self = this;
    self.userNotificationsVM = ko.observableArray();
    self.pollIntervalMilliSeconds = 1000 * 60 * 2;

    self.hide = function () {
        self.userNotificationsVM.removeAll();
    }
    self.init = function () {
        self.getNotifications(null);
        self.setupTemplate();
        //setInterval(self.getNotifications, self.pollIntervalMilliSeconds); //DG no need to poll as we'll check each page load anyway.
    }

    self.setupTemplate = function () {
        var markup = "<div data-bind='if:userNotificationsVM().length' id='userNotificationsContainer'>";
        markup += "  <div id='userNotifications'>";
        markup += "       <span class='pull-right'><i data-bind='click:hide' class='icon-cancel xlarge hand'></i></span>";
        markup += "       <span class='u-margin-Txs u-font-135 u-bold corp-blue'>Recent Notifications</span><span class='u-font-110 grey1 '> - Content has been shared with you by another user.</span>";
        markup += "       <div id='userNotificationsDivs'>";
        markup += "         <div data-bind='foreach: userNotificationsVM'>";
        markup += "           <div class='u-padding-Txxs'>";
        markup += "             <span class='u-font-85' data-bind='text: DateTime'></span>";
        markup += "             <i data-bind='css:{ \"icon-mail\": Type==\"EmailAlert\" , \"icon-bookmark\": Type==\"Bookmark\" , \"icon-search\": Type==\"Search\" , \"icon-doc-text\": Type==\"Note\", \"icon-customisation\": Type==\"JMFCustomSegment\"}' class='u-padding-Ls small'></i>";
        markup += "               <a class='u-font-110 hand tipsyMe' data-bind='text: Title,attr:{href:linkText, title:Description + \" - click to view.\", target: $data.target}'></a>";
        markup += "           </div>";
        markup += "         </div>";
        markup += "       </div>";
        markup += "  </div>";
        markup += "</div>";
        $("body").prepend(markup);
        $("#userNotificationsDivs").mCustomScrollbar({
            theme: "dark"
        });
        ko.applyBindings(self, $("#userNotificationsContainer")[0]);
    }
    self.getNotifications = function () {
        $.get("/UserNotification/GetNotifications", function (data) {
            data.sort(function (left, right) {
                return left.DateTime == right.DateTime ? 0 : (left.DateTime > right.DateTime ? -1 : 1);
            });
            _.each(data, function (d) {
                var found = _.find(self.userNotificationsVM(), function (existing) {
                    return existing.ItemId == d.ItemId;
                });

                if (!found) {
                    d.linkText = self.setupLinkText(d);
                    if (d.Type == "Bookmark") {
                        d.target = "_blank";
                    }

                    self.userNotificationsVM.unshift(d);
                }

            });
            _.delay(function () {
                ApplyTipsyToolTips('#userNotifications .tipsyMe', "w");
            }, 500);
        });
    }

    self.setupLinkText = function(d)
    {
        switch (d.Type) {
             case "EmailAlert":
                 return "/MySavedSearches"; 
             case "Search":
                 return "/MySavedSearches/ViewSearch?searchId=" + d.ItemId;
                 break;
             case "Bookmark":
                 return "/view.axd?from=Bookmarks&searchId=" + d.ItemId + "&catKey=" + d.Data;
                 break;
             case "JMFCustomSegment":
                 return "/MarketsForecast/Data?view=chart";
                 break;
           case "Note":
               return "/MyNotes/";
             default:
         };
    }

    self.init();
}
