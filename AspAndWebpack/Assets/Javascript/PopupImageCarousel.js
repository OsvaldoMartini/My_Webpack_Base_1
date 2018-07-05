var PopupImageCarousel = function (options) {

    var self = this;

    self.options = $.extend({
        thumbnailSelector: ".thumbnail",
        recordUidAttribute: "data-record-uid",
        title: "Images"
    }, options);

    self.requestPaths = {
        images: "/JanesImages/GetCarouselImagesForRecord",
        carousel: "/JanesImages/GetCarouselForRecord"
    };

    //OBSERVABLES
    self.selectedImage = ko.observable("");
    self.title = ko.observable(self.options.title);

    //INIT
    $(self.options.thumbnailSelector).click(function (e) {
        e.preventDefault();
        var target = this;
        self.thumbnailClick(target);
    });
};

PopupImageCarousel.new = function (options) {
    new PopupImageCarousel(options);
};

PopupImageCarousel.prototype.thumbnailClick = function (thumbnail) {
    var self = this;

    var recordIdentifier = $(thumbnail).attr(self.options.recordUidAttribute);

    self.loadPopup(self.options.title, self.requestPaths.carousel, { uniqueIdentifier: recordIdentifier }, self,
        function (/* On Close */) {
            self.selectedImage("");
        }, function (/* On Open */) {
            self.selectedImage("");
        });
};

PopupImageCarousel.prototype.selectImage = function (image) {
    var self = this;
    self.selectedImage(image);
};

PopupImageCarousel.prototype.imagesLoad = function (image) {
    var self = this;

    if (self.selectedImage().length === 0) {
        self.selectedImage(image);
    }

};

PopupImageCarousel.prototype.loadPopup = function (title, url, data, viewModel, closeCallback) {
    var self = this;
    closeCallback = closeCallback || function () { };
    data = data || {};
    self.showLoadingPopup(title);
    $.ajax({
        url: url,
        method: "GET",
        data: data,
        async: true
    })
        .done(function (data) {
            showPopup(title,
                data,
                viewModel,
                function (modalBody) {
                    closeCallback(modalBody);
                });
        })
        .fail(function () {
            showPopup(title, "Something has gone wrong!");
        });
};

PopupImageCarousel.prototype.showLoadingPopup = function (title) {
    showPopup(title, "<div style='height:100px'><span class='loading' /></div>");
};
