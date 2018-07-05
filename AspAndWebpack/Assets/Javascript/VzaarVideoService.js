//********Model Definition*********
var VzaarVideoVm = function(data) {

    var self = this;

    self.videoPage = ko.observableArray(data.VideoList || []);
    self.searchFilter = ko.observable("");
    self.selectedVideoSource = ko.observable("");
    self.description = ko.observable("");
    self.shortDescription = ko.observable("");
    self.total_count = ko.observable(data.VideoTotalCount);
    self.page_size = ko.observable(10);
    self.page_number = ko.observable(1);
    self.totalPageCount = ko.observable();
    self.embedCode = ko.observable("");

    // Default first video as the selected video.
    self.selectedVideo = data.VideoList[0];
    self.selectedVideoSource(self.selectedVideo.VideoWebLink);
    self.description(self.selectedVideo.Description);
    self.shortDescription = ko.computed(function() {
            return self.description().length > 165 ? self.description().substr(0, 165) + "......" : self.description();
        }, self
    );
    
    self.validatedSearchFilter = ko.pureComputed(function () {
            var result = $.trim(self.searchFilter());
            result = encodeURIComponent(result);
            return result;
        }, self
    );

    self.totalPageCount = ko.pureComputed(function () {
            return Math.ceil(self.total_count() / self.page_size());
        }, self
    );

    self.switchVideo = function (videoId, description) {
        var self = this;
        var videoSource = "//view.vzaar.com/" + videoId + "/player";
        self.selectedVideoSource(videoSource);
        self.description(description);
    };

    self.checkForUserEnteredFilter = function checkForUserEnteredFilter() {
        var self = this;

        self.page_number(1);
        self.getVideoPage(self.page_number(), self.searchFilter());
    }

    self.checkForUserEnteredPage = function checkForUserEnteredPage() {
        var self = this;

        if (self.page_number() < 1 || self.page_number() > self.totalPageCount()) {
            ShowError("Please enter a valid page number");
        }
        else {
            self.getVideoPage(self.page_number(), self.searchFilter());
        }
    }

    self.getFirstVideoPage = function getFirstVideoPage(sender, pageNumber, searchFilter) {
        var self = this;

        if ($(sender).attr('class') !== 'disabled') {
            var newPageNumber = 1;
            self.page_number(newPageNumber);
            self.searchFilter(searchFilter);
            self.getVideoPage(self.page_number(), self.searchFilter());
        }
    }

    self.getPrevVideoPage = function getPrevVideoPage(sender, pageNumber, searchFilter) {
        var self = this;

        if ($(sender).attr('class') !== 'disabled') {
            var newPageNumber = self.page_number() - 1;
            self.page_number(newPageNumber);
            self.searchFilter(searchFilter);
            self.getVideoPage(self.page_number(), self.searchFilter());
        }
    }

    self.getNextVideoPage = function getNextVideoPage(sender, pageNumber, searchFilter) {
        var self = this;

        if ($(sender).attr('class') !== 'disabled') {
            var newPageNumber = self.page_number() + 1;
            self.page_number(newPageNumber);
            self.searchFilter(searchFilter);
            self.getVideoPage(self.page_number(), self.searchFilter());
        }
    }

    self.getLastVideoPage = function getLastVideoPage(sender, pageNumber, searchFilter) {
        var self = this;

        if ($(sender).attr('class') !== 'disabled') {
            var newPageNumber = self.totalPageCount();
            self.page_number(newPageNumber);
            self.searchFilter(searchFilter);
            self.getVideoPage(self.page_number(), self.searchFilter());
        }
    }

    self.getVideoPage = function getVideoPage(pageNumber, filter) {

        $.ajax({
            type: "GET",
            url: 'Video/GetVideoByPageNumber',
            data: { 'pageNumber': pageNumber, 'searchFilter': filter },
            cache: false,
            success: function (result) {
                self.videoPage(result.VideoList);
                self.total_count(result.VideoTotalCount);
            },
            error: function (error) {
                alert(error.responseText);
            }
        });
    };

    self.displayPlayList = function displayPlayList(slider) {

        $(slider).flexslider({
            animation: "slide",
            controlNav: false,
            animationLoop: false, 
            slideshow: false,
            itemWidth: 100,
            keyboard: true,
            smoothHeight: true,
            start: function() {
                $(".flexslider.video-thumbs .slides > li").tipsy();
            }
        });

        $(".slides li", "container").first().addClass("flex-selected");
    };

    self.getVideoWebLink = function getVideoWebLink(videoId) {

        var address = window.location.protocol +
            "//" +
            window.location.hostname +
            (window.location.port ? ":" + window.location.port : "");

        return address + "/Video/Display/video_" + videoId;
    };
}