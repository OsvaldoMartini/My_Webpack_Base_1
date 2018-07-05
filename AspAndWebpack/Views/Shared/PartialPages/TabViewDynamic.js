var TabViewDynamic = {
};

TabViewDynamic.menuChanged = function (triggerItem) {

    var $triggerItem = $(triggerItem);

    var hasLoaded = $triggerItem.data("tab-loaded");
    var reloadContent = $triggerItem.data("tab-reload");

    var contentId = $triggerItem.data("tab-content");
    var $content = $(contentId);

    var sourceUrl = $triggerItem.data("tab-url");
    var contentTabTitle = $triggerItem.attr("data-tab-title");
    var contentContainerId = $triggerItem.attr("data-tab-content-containerId");

    Analytics.event($triggerItem.data("ga-category"),
        $triggerItem.data("ga-action") || "Tab",
        $triggerItem.data("ga-label") || "Tab - " + $triggerItem.html());

    //Fix for chrome. Wouldn't change tabs
    if (!$content.hasClass("disabled")) {
        $triggerItem.tab("show");
    }

    if (!hasLoaded || reloadContent) {
     
        if (sourceUrl !== undefined && contentId !== undefined) {
            $content.html('<div class="widgetloading"><div class="loading"></div></div>');

            $content.load(sourceUrl, function (response, status, xhr) {
                if (status === "error") {
                    $(this).html("<div class=\"alert alert-info text-center\">You are unauthorised to view this tab.</div>");
                    $triggerItem.attr("class", "disabled");
                    $triggerItem.html("<span>" + $triggerItem.text() + "</span>");
                } else if (response === null || response === undefined || response.length === 0) {
                    $(this).html("<div class=\"alert alert-info text-center\">There is no data for this tab.</div>");
                }
                $triggerItem.attr("data-tab-loaded", true);
                $triggerItem.data("tab-loaded", true);
            });
        }
    }
};

TabViewDynamic.loadTab = function (anchor) {
    var $anchor = $(anchor);
    var $parent = $anchor.parent("li");

    var hasLoaded = $anchor.data("tab-loaded");
    var reloadContent = $anchor.data("tab-reload");

    if (!hasLoaded || reloadContent) {
        var sourceUrl = $anchor.data("tab-url");
        var contentId = $anchor.data("tab-content");

        if (sourceUrl !== undefined && contentId !== undefined) {
            $(contentId).html('<div class="widgetloading"><div class="loading"></div></div>');

            $(contentId).load(sourceUrl, function (response, status, xhr) {
                if (status === "error") {
                    $(this).html("<div class=\"alert alert-info text-center\">You are unauthorised to view this tab.</div>");
                    $parent.attr("class", "disabled");
                    $parent.html("<span>" + $anchor.text() + "</span>");
                } else if (response === null || response === undefined || response.length === 0) {
                    $(this).html("<div class=\"alert alert-info text-center\">There is no data for this tab.</div>");
                }
                $anchor.attr("data-tab-loaded", true);
                $anchor.data("tab-loaded", true);
            });
        }
    }
};