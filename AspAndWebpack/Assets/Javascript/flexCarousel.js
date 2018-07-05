$(document).ready(function () {

    $(".flex-carousel").each(function (i, item) {

        new flexCarousel(item.id);

    });

});

var flexCarousel = function (containerID) {

    var _ContainerID = containerID.charAt(0) === '#' ? containerID : '#' + containerID;
    var _SliderID = _ContainerID + "_slider";
    var _CarouselID = _ContainerID + "_carousel";
    var _InfoID = _ContainerID + "_slideInfo";
    var _GoogleAnalyticsCategory = $(_ContainerID).data("google-analytics") || "Data Analytics";

    var init = function () {
        setupCarousel();
    };

    var setupCarousel = function () {

        $(_ContainerID + " " + _CarouselID).flexslider({
            animation: 'slide',
            controlNav: false,
            animationLoop: false,
            slideshow: false,
            itemWidth: 100,
            itemMargin: 5,
            asNavFor: _SliderID
        });

        $(_ContainerID + " " + _SliderID).flexslider({
            animation: 'slide',
            controlNav: false,
            animationLoop: false,
            slideshow: false,
            sync: _CarouselID,
            start: function (slider) {
                //remove loading animation
                $(_ContainerID + " .dataTile").removeClass('loading');
                updateSliderInfo(slider)
                setupGoogleAnalytics();
            },
            after: function (slider) {
                updateSliderInfo(slider)


            }
        });

    };

    var updateSliderInfo = function (slider) {
        //Update the current slide info text
        $(_ContainerID + " " + _InfoID).text(slider.currentSlide + 1 + ' of ' + slider.count);
    };

    init();

};