jQuery.fn.liScroll = function (settings) {
	settings = jQuery.extend({
		travelocity: 0.07
	}, settings);

	return this.each(function () {
		var $strip = jQuery(this);
		$strip.addClass("news");

		var stripWidth = 1;
		$strip.find("li").each(function (i) {
			stripWidth += jQuery(this, i).outerWidth(true);
		});

		var $mask = $strip.wrap("<div class='mask'></div>");
		var $tickercontainer = $strip.parent().wrap("<div class='tickercontainer well well-sm'></div>");

		var containerWidth = $strip.parent().parent().width();
		$strip.width(stripWidth);
		var totalTravel = stripWidth + containerWidth;
		var defTiming = totalTravel / settings.travelocity;

		function scrollnews(spazio, tempo) {
			$strip.animate({ left: '-=' + spazio }, tempo, "linear", function () { $strip.css("left", containerWidth); scrollnews(totalTravel, defTiming); });
		}

		scrollnews(totalTravel, defTiming);

		$strip.hover(function () {
			jQuery(this).stop();
		},
		function () {
			var offset = jQuery(this).offset();
			var residualSpace = offset.left + stripWidth;
			var residualTime = residualSpace / settings.travelocity;
			scrollnews(residualSpace, residualTime);
		});

		window.setTimeout(function () {
			$('.tickercontainer .mask').width($(".tickercontainer").width());
		}, 1000);
	});
};