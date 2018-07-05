



var RssWidgetVM = function() {

    var self = this;

    self.feedItems = ko.observableArray([]);
    self.feedUrl = ko.observable();
};

RssWidgetVM.prototype.test = function(args) {
    alert("hello " + args.name + "!");
};

RssWidgetVM.prototype.fetchRssFeed = function(feedUrl, number) {

    var self = this;

    number = number || 10;

    $.getJSON("//ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?", {
        num: number,
        q: feedUrl
    }).done(function (data) {
        if (data !== null && data !== undefined) {
            var feed = data.responseData.feed;
            self.feedItems(feed.entries);
            self.feedUrl(feedUrl);
        }
    });

};