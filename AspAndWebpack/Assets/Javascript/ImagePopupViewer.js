$(document).ready(function () {
    if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 7)) {
        // disabled for IE7 and below due to poor performance.

        var wrapper = $("#imgPopupWrapper");
        var viewer = $("#imgPopupWrapper .viewer");

        wrapper.find(".close").add("#masterOverlay").click(function (e) {
            e.preventDefault();
            wrapper.fadeOut("fast", function () {
                wrapper.width(600);
                wrapper.height(400);
                viewer.find("img").css("top", 0);
                viewer.find("img").css("left", 0);
                viewer.find("img").css("width", 0);
                viewer.find("img").css("height", 0);
            });

            $("#masterOverlay").css({ visibility: "hidden", display: "none" });

            fullScreenImg = false;
            window._disableScrollDataRetrieval = false;
        });

        var fullScreenImg = false;
        wrapper.find(".fullscreen").click(function (e) {
            e.preventDefault();

            fullScreenImg = !fullScreenImg;

            if (fullScreenImg) {
                wrapper.width($(window).innerWidth() - 30);
                wrapper.height($(window).innerHeight() - 30);
            }
            else {
                var origWidth = viewer.iviewer("info", "orig_width");
                var origHeight = viewer.iviewer("info", "orig_height");

                if (origWidth < 600)
                    origWidth = 600;
                else if (origWidth > 1000)
                    origWidth = 1000;

                if (origHeight < 400)
                    origHeight = 400;
                else if (origHeight > 700)
                    origHeight = 700;

                wrapper.width(origWidth);
                wrapper.height(origHeight);
            }

            viewer.iviewer("update");
        });
    }
});

var imagePopupViewer_iViewer;

function HookupImagePopup(selector, imgSelector, imgSourceAttr) {
    if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10) > 7)) {
        // disabled for IE7 and below due to poor performance.

        if (typeof (selector) == "undefined") {
            selector = ".thumbnail";
        }

        if (typeof (imgSelector) == "undefined") {
            imgSelector = "a";
        }

        if (typeof (imgSourceAttr) == "undefined") {
            imgSourceAttr = "href";
        }

        $(selector).click(function (e) {
            e.preventDefault();
            window._disableScrollDataRetrieval = true;

            var imgLink = $(this).find(imgSelector).attr(imgSourceAttr);

            var wrapper = $("#imgPopupWrapper");
            var loader = $("#imgPopupWrapper .wait");
            var viewer = $("#imgPopupWrapper .viewer");

            wrapper.fadeIn();
            loader.show();
            viewer.hide();

            if (imagePopupViewer_iViewer != null) {
                viewer.iviewer("loadImage", imgLink);
                AdjustWrapper(viewer, wrapper);
            }
            else {
                imagePopupViewer_iViewer = viewer.
                        iviewer({
                            src: imgLink,
                            zoom: 100,
                            zoom_min: 10,
                            onFinishLoad: function (ev) {
                                AdjustWrapper(viewer, wrapper);
                                $("#masterOverlay").css({ visibility: "visible", display: "inline" });
                                loader.fadeOut("fast");
                                viewer.fadeIn("fast");
                            }
                        }
                    );
            }
        });
    }
}

function AdjustWrapper(viewer, wrapper) {
    var origWidth = viewer.iviewer("info", "orig_width");
    var origHeight = viewer.iviewer("info", "orig_height");
    var windowWidth = $(window).innerWidth();
    var windowHeight = $(window).innerHeight();
    var doFit = false;

    if (origWidth < 600)
        origWidth = 600;
    else if (origWidth > 1000) {
        origWidth = 1000;
        doFit = true;
    }

    if (origHeight < 400)
        origHeight = 400;
    else if (origHeight > 700) {
        origHeight = 700;
        doFit = true;
    }

    // check it fits in the current window size
    if (origWidth > windowWidth) {
        origWidth = windowWidth - 30;
        doFit = true;
    }
    if (origHeight > windowHeight) {
        origHeight = windowHeight - 30;
        doFit = true;
    }

    wrapper.width(origWidth);
    wrapper.height(origHeight);

    if (doFit) {
        viewer.iviewer("fit");
    }
    else {
        viewer.iviewer("set_zoom", 100);
    }

    viewer.iviewer("update");
}