//********Model Definition*********
var ItemModel = function() {
    var self = this;
    self.id = ko.observable();
    self.name = ko.observable();
    self.publishedDate = ko.observable();
    self.shortDescription = ko.observable('');
    self.thumbnailURL = ko.observable();
    self.publishedDateString = ko.pureComputed(function() {
            var d = new Date(self.publishedDate() * 1);
            return $.datepicker.formatDate("dd/mm/yy", d);
        },
        self);
    self.description = ko.pureComputed(function() {
            var result = self.name();
            var shortDescription = self.shortDescription();
            if (shortDescription && shortDescription.length > result.length) {
                result = self.shortDescription();
            }
            return result;
        },
        self);
    self.videosUrl = ko.pureComputed(function() {
            var address = window.location.protocol +
                "//" +
                window.location.hostname +
                (window.location.port ? ':' + window.location.port : '');
            return address + '/Video/View/' + self.id();
        },
        self);
};

var ViewModel = function() {
    var self = this;
    self.searchFilter = ko.observable();
    self.validatedSearchFilter = ko.pureComputed(function() {
            var result = $.trim(self.searchFilter());
            result = encodeURIComponent(result);
            return result;
        },
        self);
    self.selectedVideo = ko.observable();
    self.items = ko.observableArray([new ItemModel()]);
    self.page_number = ko.observable();
    self.totalPageCount = ko.observable();
    self.page_size = ko.observable();
    self.total_count = ko.observable();
    self.totalPageCount = ko.pureComputed(function() {
            return Math.ceil(self.total_count() / self.page_size());
        },
        self);
    self.sortBy = ko.pureComputed(function() {
            return 'PUBLISH_DATE';
        },
        self);
    self.sortOrder = ko.observable();
};

//********Model Definition*********
//Service tor return knockout model for the data describing brightcove videos and to play those videos
function BrightCoveVideoService(playerId, containerId) {
    var self = this;
    self
        .brightCoveUrl =
        "https://api.brightcove.com/services/library?video_fields=id%2Cname%2CshortDescription%2CpublishedDate%2CthumbnailURL&token=gRSyBO3CDM2SlmwTjCwVsbeqReurNidauKzyBqpBZIeucxWL9JjR0w..";
    self.singleVideoQueryString = "&command=find_video_by_id&video_id=[VIDEOID]";
    self
        .allVideosQueryString =
        "&command=search_videos&get_item_count=true&page_size=[PAGESIZE]&sort_by=[SORTBY]&page_number=[PAGENUMBER]&all=tag%3AJanes2.0";
    self.searchQueryString = "&all=search_text%3A[SEARCHTEXT]";
    self.getPlaylistUrl = "&command=find_playlist_by_reference_id&reference_id=[PLAYLIST]";
    self.allVideosUrl = self.brightCoveUrl + self.allVideosQueryString;
    self.singleVideosUrl = self.brightCoveUrl + self.singleVideoQueryString;
    self.searchVideosUrl = self.allVideosUrl + self.searchQueryString;
    self.playlistVideosUrl = self.allVideosUrl + self.getPlaylistUrl;
    self.model = null;
    self.videoPlayer = null;
    self.playerId = playerId;
    self.containerId = containerId;
    self.videosLoaded = null;

    self.model = self.getInitialModel();

    self.initializePlayer();
}

BrightCoveVideoService.prototype.initializePlayer = function() {
    var self = this;
    if (typeof videojs !== 'undefined') {
        videojs(self.playerId)
            .ready(function() {
                self.videoPlayer = this;
            });
    } else {
        $('#' + self.containerId)
            .html('<h2>The service is not available in this browser. Please try again using a different browser.</h2>');
    }
};

BrightCoveVideoService.prototype.getInitialModel = function() {
    var model = new ViewModel();
    model.page_size(10);
    model.page_number(1);
    model.sortOrder('desc');
    model.searchFilter('');

    model.items([new ItemModel()]);
    return model;
};

BrightCoveVideoService.prototype.getPlaylist = function(playlist) {
    var self = this;
    var urlString = self.playlistVideosUrl;
    urlString = urlString.replace('[PLAYLIST]', playlist);

    self.getVideos(urlString, 1);
};

BrightCoveVideoService.prototype.getVideoPage = function(pageNumber) {
    var self = this;
    var urlString = self.allVideosUrl;
    if (self.model.validatedSearchFilter() != '') {
        urlString = self.searchVideosUrl;
        urlString = urlString.replace('[SEARCHTEXT]', self.model.validatedSearchFilter());
    }
    self.getVideos(urlString, pageNumber);
};

BrightCoveVideoService.prototype.getVideos = function(urlStr, pageNumber) {
    var self = this;

    urlStr = urlStr.replace('[PAGESIZE]', self.model.page_size());
    urlStr = urlStr.replace('[SORTBY]', self.model.sortBy() + ':' + self.model.sortOrder());
    urlStr = urlStr.replace('[PAGENUMBER]', pageNumber - 1);
    var searchFilter = self.model.searchFilter();

    $.ajax({
        url: urlStr,
        dataType: "jsonp",
        timeout: 10000,
        success: function(data) {
            if (data) {
                self.model.searchFilter(searchFilter);
                self.populateModel(data);
                self.cueVideo(0);
                if (self.videosLoaded && typeof self.videosLoaded === 'function') self.videosLoaded();
            }
        }
    });
};

BrightCoveVideoService.prototype.getVideo = function(videoId) {
    var urlStr = this.singleVideosUrl.replace('[VIDEOID]', videoId);
    var self = this;
    $.ajax({
        url: urlStr,
        dataType: "jsonp",
        timeout: 10000,
        success: function(data) {
            if (data) {
                self.model.searchFilter('');
                self.populateModel(data);
                self.cueVideo(0);
            }
        }
    });
};

BrightCoveVideoService.prototype.populateModel = function(data) {
    var self = this;
    var videos;

    if (data.items != null) {
        videos = data.items;
        self.model.page_number(data.page_number + 1);
        self.model.total_count(data.total_count);
    } else if (data.videos != null) {
        videos = data.videos;
        self.model.total_count(data.videos.length);
    } else {
        videos = [data];
    }

    self.model.items([]);

    for (var i = 0; i < videos.length; i++) {
        var item = new ItemModel();
        item.id(videos[i].id);
        item.name(videos[i].name);
        item.thumbnailURL(videos[i].thumbnailURL);
        item.shortDescription(videos[i].shortDescription);
        item.publishedDate(videos[i].publishedDate);

        self.model.items.push(item);
    }
};

BrightCoveVideoService.prototype.playVideo = function(videoOrdinal) {
    var self = this;
    self.model.selectedVideo(self.model.items()[videoOrdinal]);

    if (self.videoPlayer != null && self.model.selectedVideo() != null) {
        self.videoPlayer.catalog.getVideo(self.model.selectedVideo().id(),
            function(error, video) {
                self.videoPlayer.catalog.load(video);
                self.videoPlayer.play();
            });
    }
};

BrightCoveVideoService.prototype.cueVideo = function(videoOrdinal) {
    var self = this;
    self.model.selectedVideo(self.model.items()[videoOrdinal]);
    if (self.videoPlayer != null && self.model.selectedVideo() != null) {
        self.videoPlayer.catalog.getVideo(self.model.selectedVideo().id(),
            function(error, video) {
                self.videoPlayer.catalog.load(video);
            });
    }
};