
/// The Carousel Widget Prototype
var CarouselWidget = function (carouselWidgetDiv, carousel) {
	var self = this;
	self.data = ko.observableArray(carousel.Items || []);
	self.selectedCarouselItem = ko.observable("");
	self.selectedCarouselItemHeading = ko.observable("");
	self.selectedCarouselItemText = ko.observable("");
	self.total_count = ko.observable(carousel.Items.length);
	self.carouselWidgetDiv = carouselWidgetDiv;

	// Default first carousel item as the selected carousel.
	self.selectedCarouselItem(carousel.Items[0]);

	self.switchCarouselItem = function (carouselItem) {
		var self = this;
		self.selectedCarouselItem(carouselItem);
	};

	self.displaySlides = function displayPlayList(slider, options) {

		$(slider).flexslider(options);

		$(".slides li", "container").first().addClass("flex-selected");

		//Try to hook up any images
		if (options.enablePopups && typeof (window.HookupImagePopup) === "function") {
			var selector = carouselWidgetDiv + " .flexslider-image";
			window.HookupImagePopup(carouselWidgetDiv + " .flexslider-image", "img", "src");
			$(selector).addClass("actionable");
		}
	};
};

if (typeof WidgetBase === 'function') {
    CarouselWidget.prototype = new WidgetBase();
}

CarouselWidget.prototype.onDashboardResize = function () {
    var $flex = $(this.carouselWidgetDiv);
    if ($flex.length) {
        var slider = $flex.data('flexslider');
        slider.doMath();
        slider.newSlides.css({ "width": slider.computedW });
        slider.flexAnimate(slider.getTarget('next'));
    }
};

CarouselWidget.init = function (parentContainer) {
    var container;
    if (parentContainer) {
        container = $(parentContainer).find(".flexslider-container");
    } else {
        container = $(".flexslider-container");
    }

    if (container.get(0)) {

        var options = {
            animation: container.data("flexslider-animation"),
            slideshow: container.data("flexslider-slideshow"),
            pausePlay: container.data("flexslider-pauseplay"),
			enablePopups: container.data("flexslider-enablepopups"),
			controlNav: container.data("flexslider-controlNav")
		}

	    var cotainerId = container.get(0).id;
		var slider = $(".flexslider", "#" + cotainerId);
	    var sliderId = "#" + slider.get(0).id;
		$(sliderId).flexslider(options);
		
	    //Try to hook up any images
	    if (options.enablePopups && typeof (window.HookupImagePopup) === "function") {
			var selector = sliderId + " .flexslider-image";
			window.HookupImagePopup(sliderId + " .flexslider-image", "img", "src");
		    $(selector).addClass("actionable");
	    }
    } else {
        return undefined;
    }
};