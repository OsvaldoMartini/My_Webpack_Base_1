/// An active navigation function used to retrieve a list of links relevant to a document
/// KNOCKOUT.js - KNOCKOUTEXTENSIONS.js - JQUERY.js - DISPLAY.css must be already referenced on the page

var ActiveNav = function (options, callbacks) {
    /// OPTIONS
    /**
     * ---------------------------------------
     *        MAIN SETTINGS
     * ---------------------------------------
     * 
     * parseContentID : string : Default("BODY") -> Determines the ID of the content to be parsed by active nav, e.g. a DOM element ID for the "TEXT" service type or a cache id for the "CAHCE" service type.
     * 
     * serviceType : string : Default("TEXT") -> Determines how the content will be sent to the services. i.e. TEXT or CACHE for small snippets of text or large pieces of content respectively.
     * 
     * isAutoLoad : bool : Default(true) -> Determines whether to retrieve the links from the service immediately, or wait until a manual start (see _self.load).
     *
     * authoriseOnLoad : bool : Default(false) -> Determines whether to authorise all of the nav item links asynchronously once the links have been retrieved. Otherwise they will be fetched on nav item clicked.
     *
     * ---------------------------------------
     *   ACTIVE NAVIGATION PANEL
     * ---------------------------------------
     * 
     * activeNavPanelID : string : Default(null) -> The container on which to bind the active nav view model to. A predefined control will also appear here if [overrideTemplates] is set to false. This is not for inline links!
     * 
     * numItemsToShow : int : Default(100) -> Detrmines the number of nav items to be displayed for each group.
     * 
     * overrideTemplates : bool : Default(false) -> Determines whether a predefined active nav control structure appears on the page. Set to true to create your own knockout templates for the active nav panel.
     * 
     * ---------------------------------------
     * INLINE LINKS and HIGHLIGHTING
     * ---------------------------------------
     * 
     * inlineItemsContainers : string[] : Default([]) -> Determines what dom containers to create the inline links and highlights in. If left blank, no inlinelinks or highlights will be created.
     * 
     * inlineItemsIgnoredNodes : string[] : Default(["caption"]) -> Determines what DOM nodes will be ignored when applying inline links and highlighting.
     * 
     * phrasesToHighlight : string[] : Default([]) -> Determines a list of words or phrases to highlight within the document. If the inlineItemsContainer is not set then the highlighting process will be ignored.
     *
     * enableHighlighting : bool : true -> Determines whether keyword highlighting is active or disabled on start. They will both still create disabled highlights as they could be activated by the user.
     * 
     * enableInlineLinking : bool : true -> Determines whether inline linking is active or disabled on start. They will both still create disabled inline links as they could be activated by the user.
     */

    /// CALLBACKS
    /**
     * onBeginLoad : returns undefined -> Return when the get links process starts
     *
     * onLoaded : returns undefined -> Returns when the service has returned and the links have been generated
     *
     * onGroupCreated : returns GroupVM object -> Returns when a new group has been fully created and populated
     *
     * onNavItemCreated : returns NavItemVM object -> Returns when a new navItem has been fully created and populated
     *
     * onItemLinkCreated : returns ItemLinkVM object -> Returns when a new itemLink has been fully created and populated
     *
     * onKeywordCreated : returns KeywordVM object -> Returns when a new keyword has been fully created and populated
     *
     * onKeywordClicked : returns KeywordVM object and the click event -> Returns when the click function that the keyword was bound to was invoked
     *
     * onAuthorised : returns NavItemVM -> returns when a navItem has been fully authorised
     * 
     * onInlineItemsCreated : returns undefined -> returns when the inline links and highlighting have been created in all relevant DOM containers.
     *
     * onFail : returns ajax error -> Returns an error message if the active nav processes fails
     */

    /*************** VARIABLES ***************/

    var _self = this;
    var _viewModel;
    var _options = options || {};
    var _callbacks = callbacks || {};

    var _allGroups = [];
    var _allNavItems = [];
    var _allItemLinks = [];
    var _allKeywords = [];

    var SERVICE_LINK = "/ActiveNav";

    /************** PROPERTIES *************/

    /**************** ON INIT ****************/

    var init = function () {
        checkOptions();

        _viewModel = new ViewModel(_self);

        insertTemplates();
        if (_options.activeNavPanelID !== null)
            applyBindings(_options.activeNavPanelID);

        if (_options.isAutoLoad)
            _self.load();
    };

    /*********** (-) FUNCTIONS ***********/

    // Check the options and make sure the defaults are applied if they have not been supplied by the user
    var checkOptions = function () {
        var defaultOptions = {
            activeNavPanelID: null,
            isAutoLoad: true,
            authoriseOnLoad: false,
            numItemsToShow: 100,
            serviceType: "TEXT",
            parseContentID: "body",
            inlineItemsContainers: [],
            inlineItemsIgnoredNodes: ["caption"],
            phrasesToHighlight: [],
            overrideTemplates: false,
            enableInlineLinking: true,
            enableHighlighting: true
        };

        _options = $.extend(defaultOptions, _options);
    };

    /// Retrieve the full url link for a particular service. Whether it is for a DOM or JanesRecord query
    var getCompleteServiceLink = function () {

        var currentUrl = window.location.href;
        var lastIndexOfSlash = currentUrl.lastIndexOf("/") !== 0 ? currentUrl.lastIndexOf("/") : currentUrl.lastIndexOf("\\");
        var uid = currentUrl.substring(lastIndexOfSlash + 1, currentUrl.length);

        switch (_options.serviceType) {
            case "TEXT":
                var domElem = document.getElementById(_options.parseContentID);
                var contentToParse = domElem.innerHTML || domElem.value;
                return SERVICE_LINK + "/LinksForText?contentsToParse=" + contentToParse + "&uid=" + uid;
            case "CACHE":
                return SERVICE_LINK + "/Links?contentId=" + _options.parseContentID + "&uid=" + uid;
            default:
        }
    };

    // Insert the html templates into the document
    var insertTemplates = function () {

        //If there are inline link containers specified, or an active nav panel container, then add the appropriate temapltes
        if (_options.inlineItemsContainers.length > 0 || _options.activeNavPanelID !== null && _options.overrideTemplates) {

            //add the html item template
            $("body").append(_self.templates.itemLink);

            //add the popup
            $("body").append(_self.templates.popupLinks);
        }

        //add the nav panel template
        setupActiveNavTemplate();

    };

    /// Retrieve the link structure from the active navigation service
    var getLinks = function (onComplete) {
        _viewModel.isLoading(true);

        $.ajax({
            type: "GET",
            url: getCompleteServiceLink(),
            dataType: 'json'
        })
        .done(function (result) {
            if (result !== "") {
                
                for (var index in result.NavGroups) {
                    var navGroup = result.NavGroups[index];
                    if (typeof navGroup.NavItems !== "undefined") {
                        navGroup.NavItems = navGroup.NavItems.filter(function(p) {
                            return p.ItemLinks.length > 0;
                        });
                    }
                }
                _viewModel.addGroups(result.NavGroups);
            }
            _viewModel.isLoading(false);

            if (onComplete && typeof onComplete === "function")
                onComplete();
        })
        .fail(function (err) {
            invokeCallback("onFail", err);
        });
    };

    /// Bind the view model to a container.
    var applyBindings = function (containerID) {
        var container = document.getElementById(containerID);
        if (container !== null) {
            ko.applyBindings(_viewModel, container);
        }
    };

    /// Authorise all of the links
    var authoriseLinks = function () {
        var groups = _viewModel.groups();

        ko.utils.arrayForEach(groups, function (group) {
            authoriseGroup(group);
        });
    };

    /// Authorise all of the links within a group
    var authoriseGroup = function (group) {
        var navItems = group.navItems();

        ko.utils.arrayForEach(navItems, function (navItem) {
            authoriseNavItem(navItem);
        });
    };

    /// Authorise all of the links within a nav item
    var authoriseNavItem = function (navItem, onCompleted) {
        $.ajax({
            type: "GET",
            url: SERVICE_LINK + "/GetAuthorisedNavItemLinks?itemId=" + navItem.id(),
            dataType: 'json'
        })
        .done(function (result) {
           
          for (var i = 0; i < result.ItemLinks.length; i++) {
            var itemLink = result.ItemLinks[i];

                var koItemLink = findByProperty(navItem.itemLinks(), "id", itemLink.Id);

                if (koItemLink !== undefined)
                    koItemLink.isAuthorised(itemLink.IsAuthorised);
            }

            if (onCompleted !== undefined)
                onCompleted(true);
        })
        .fail(function (err) {
            if (onCompleted !== undefined) {
                ko.utils.arrayForEach(navItem.itemLinks(), function (itemLink) {
                    itemLink.isAuthorised(false);
                });
                onCompleted(false);
            }
        });
    };

    /// Retrieve a knockout element given a collection, field and argument
    var findByProperty = function (collection, field, argument) {
        for (var i = 0; i < collection.length; i++) {
            var item = collection[i];
            if (item[field]() === argument)
                return item;
        }
    };

    /// Invoke a callback if it exists, and send the given arguments (if any)
    var invokeCallback = function (callbackName) {
        var callback = _callbacks[callbackName];
        if (callback !== undefined) {
            if (arguments === undefined)
                callback();
            else
                callback.apply(_self, Array.prototype.slice.call(arguments, 1));
        }
    };

    /// Put an escape character before each special regex character
    var escapeSpecialRegexCharacters = function (word) {
        var regexChars = ['\\', '+', '.', '*', '^', '$', '|', '?', '(', ')', '{', '}'];

        for (var i = 0; i < regexChars.length; i++) {
            var specialChar = regexChars[i];

            word = word.replace(specialChar, '\\' + specialChar);

        }
        return word;

    };

    /// Create inline active nav links within a DOM element
    var createInlineItems = function () {

        if (_options.inlineItemsContainers.length > 0) {
            var linksToProcess = [];

            for (var keywordIndex = 0; keywordIndex < _allKeywords.length; keywordIndex++) {
                var keywordVM = _allKeywords[keywordIndex];
                var keywordText = keywordVM.txt();

                if (linksToProcess.map(link => link.txt).indexOf(keywordText) >= 0) continue;

                //are the links disabled, if so chose whether to have an href or not.
                var linksDisabledHref = _options.enableInlineLinking ? "href='javascript:void(0)'": "";

                //active anchor
                var anchor = '<a ' + linksDisabledHref + ' data-bind="attr: { title: label }, click : onClick, event : { contextmenu : onClick}" class="inlineLinkAnchor">' + keywordText + '</a>';

                //The html to replace the keyword with
                var replacementContent = '<span class="inlineLinkContainer unbound" data-original="' + keywordText + '">' + anchor + '</span>';

                //Stop the link from appearing in pre-existing anchors (it is looping through text nodes, so there shouldn't be any any way!)
                //Also stops duplicate links appearing inside the spans representing disabled links - safer than using css pointer events to disable them
                var regexSafeKeyword = escapeSpecialRegexCharacters(keywordText);
                //var regex = new RegExp('(?!<.*?)(?![^<]+>)(\\b|(?!\\w))(' + regexSafeKeyword + ')(\\b|(?!\\w))(?![^<>]*?(<\/.+?>|>))', 'g');
                var regex = new RegExp('(?!<.*?)(\\b|(?!\\w))(' + regexSafeKeyword + ')(\\b|(?!\\w))', 'g');

                linksToProcess.push({ regex: regex, content: replacementContent, txt: keywordText });
            }

            // For now order the keywords by length so that larger phrases override smaller ones. e.g. "South Sudan" instead of "Sudan"
            linksToProcess.sort(function (a, b) { return b.txt.length - a.txt.length; });

            var docNodes = [];

            for (var containerIndex = 0; containerIndex < _options.inlineItemsContainers.length; containerIndex++) {
                var inlineLinkContainer = _options.inlineItemsContainers[containerIndex];
                var inlineDomContainer = document.getElementById(inlineLinkContainer);

                if (inlineDomContainer !== null) {
                    //Use text nodes so as not to destroy any DOM elements
                    var textNodes = getTextNodesUnder(inlineDomContainer, _options.inlineItemsIgnoredNodes);
                    docNodes = docNodes.concat(textNodes);
                }
            }

            //Iterate over the dom elements using a timeout of zero. This allows for the UI to catch
            //up with the rendering before more UI changes are made.
            var completedCount = 0;
            iterateCollectionTimeout(docNodes, function (node, index) {

                var replaceString = node.data;
                //If there is no text then there cannot be any links
                if (replaceString.trim()) {
                    //Keywords
                    var highlightsDisabledClass = _options.enableHighlighting ? "" : "highlightDisabled";

                    for (var k = 0; k < _options.phrasesToHighlight.length; k++) {
                        var keyword = _options.phrasesToHighlight[k];

                        if (keyword.length > 0) {
                            //ignore casing for the highlights
                            var regex = new RegExp('(?![^<]+>)(\\b' + keyword + '\\b)(?![\w-])', 'gi');

                            replaceString = replaceString.replace(regex, "<span class='highlight " + highlightsDisabledClass + "'>$1</span>");
                        }
                    }

                    for (var j = 0; j < linksToProcess.length; j++) {
                        var inlineLink = linksToProcess[j];
                        replaceString = replaceString.replace(inlineLink.regex, inlineLink.content);
                    }

                    //If there has been a change in the content
                    if (node.data !== replaceString) {

                        //replace the content
                        var $node = $(node);
                        var $parent = $node.parent();
                        $node.replaceWith(replaceString);

                        //apply the bindings
                        var newlyAddedNodes = $parent.find(".unbound");
                        for (var n = 0; n < newlyAddedNodes.length; n++) {
                            var newNode = newlyAddedNodes[n];
                            newNode.className = newNode.className.replace("unbound", "");
                            var label = newNode.getAttribute("data-original");
                            var vm = _self.getKeyword("txt", label);
                            newNode.removeAttribute("data-original");
                            ko.applyBindings(vm, newNode);
                        }
                    }
                }
                completedCount++;
                if (completedCount >= docNodes.length)
                    invokeCallback("onInlineItemsCreated");
            });
        }
    };

    /// Setup the binding handler for google analytics
    var setupGoogleAnalytics = function () {
        ko.bindingHandlers.gaq = {
            update: function (element, valueAccessor) {

                $(element).click(function () {
                    sendGoogleAnalytics('Click link', '' + ko.utils.unwrapObservable(valueAccessor()));
                });
            }
        };
    };

    /// Setup the templates for the active navigation panel
    var setupActiveNavTemplate = function () {

        if (_options.activeNavPanelID !== null && !_options.overrideTemplates) {
            $("#" + _options.activeNavPanelID).append(_self.templates.navPanel);

            $("#" + _options.activeNavPanelID).on('click', '.anKeyword', function (e) {
                e.stopPropagation();
                showNavLinks(this);
                var clickText = $(this).text();
                sendGoogleAnalytics("Open popout", clickText);
            });

            $("#" + _options.activeNavPanelID + " .activeNav").addClass('loading');
        }
    };

    // Fire a google analytics event
    var sendGoogleAnalytics = function (type, text) {
        if (typeof ga !== 'undefined') {
            ga("send",
            {
                hitType: "event",
                eventCategory: "Active Navigation",
                eventAction: type,
                eventLabel: text,
                nonInteraction: 0
            });
        }
    };

    // Show the mini popup of links for the active nav control
    var showNavLinks = function(anch) {
        var popUp = $(anch).next('ul');
        if (popUp.is(':hidden')) {
            popUp.css('visibility', 'hidden');
            popUp.show();
            var docHeight = $('body').height() - $('#footer').height();
            var popupOffset = popUp.offset();
            var popupPos = popUp.height() + popupOffset.top;
            if (popupPos > docHeight)
                popUp.addClass('offset');
            popUp.hide();
            popUp.css('visibility', 'visible');
        }
        $("#" + _options.activeNavPanelID + " .activeNav ul li ul").not(popUp).hide();
        popUp.fadeToggle('fast',
            function() {
                $('html').click(function() {
                    popUp.fadeOut('fast');
                });
                var footerHeight = $('#footer') !== undefined ? $('#footer').height() : 0;
                var docHeight = $('html').height() - footerHeight;
                var popupOffset = popUp.offset();
                var popupPos = popUp.height() + popupOffset.top;
                if (popupPos > docHeight) {
                    popUp.addClass('offset');
                }
            });
    };

    /// Show the inline links popup for a keywordVM
    var showInlineLinksPopup = function (keywordVM, event) {
        $(".dialog").hide();
        var popup = $(".activeNavPopup").get(0);
        ko.cleanNode(popup);
        ko.applyBindings(keywordVM.navItemVM, popup);

        opendialog.call(event.target, "top", "aclinks");
    };

    /*********** (+) FUNCTIONS ***********/

    _self.refreshBindings = function (containerID) {
        applyBindings(containerID);
    };

    /// Get the data in JSON format (Note: retrieved data will not be dynamically updated)
    _self.getJSON = function () {
        return ko.toJSON(_viewModel);
    };

    /// Get the knockout group object by a specific property
    _self.getGroup = function (property, argument) {
        return findByProperty(_allGroups, property, argument);
    };

    /// Get the knockout navItem object by a specific property
    _self.getNavItem = function (property, argument) {
        return findByProperty(_allNavItems, property, argument);
    };

    /// Get the knockout itemLink object by a specific property
    _self.getItemLink = function (property, argument) {
        return findByProperty(_allItemLinks, property, argument);
    };

    /// Get the knockout keyword object by a specific property
    _self.getKeyword = function (property, argument) {
        return findByProperty(_allKeywords, property, argument);
    };

    /// Start the active nav process (if auto load is set, this will have already been called)
    _self.load = function () {
        invokeCallback("onBeginLoad");

        getLinks(function () {
            invokeCallback("onLoaded");
            createInlineItems();

            if (_options.activeNavPanelID !== null && !_options.overrideTemplates)
                $("#" + _options.activeNavPanelID + " .activeNav").removeClass('loading');

            if (_options.authoriseOnLoad)
                authoriseLinks();
        });
    };

    /// Turn the inline linking on or off
    _self.showInlineLinks = function (show) {

        for (var i = 0; i < _options.inlineItemsContainers.length; i++) {
            var containerID = _options.inlineItemsContainers[i];

            if (show) {
                $("#" + containerID + " .inlineLinkAnchor").attr("href", "javascript:void(0)").prop("disabled", false);
            }
            else {
                $("#" + containerID + " .inlineLinkAnchor").removeAttr("href").prop("disabled", true);
            }
        }
    };

    /// Turn the keyword highlighting on or off
    _self.showHighlighting = function (show) {

        for (var i = 0; i < _options.inlineItemsContainers.length; i++) {
            var containerID = _options.inlineItemsContainers[i];

            if (show) {
                $("#" + containerID + " .highlight").removeClass("highlightDisabled");
            }
            else {
                $("#" + containerID + " .highlight").addClass("highlightDisabled");
            }
        }
    };

    /********** INNER CLASSES ***********/

    /// A function to represent the view model of the entire active nav function
    var ViewModel = function () {
        var _self = this;

        _self.isLoading = ko.observable(false);
        _self.groups = ko.observableArray([]);

        _self.addGroups = function (data) {
            for (var i = 0; i < data.length; i++) {
                var group = data[i];
                if (group.NavItems.length > 0) {
                    _self.groups.push(new GroupVM(group));
                }
            }
        };
    };

    /// A function to represent the group view model
    var GroupVM = function (data) {
        var _self = this;

        _self.label = ko.observable(data.Label);
        _self.navItems = ko.observableArray([]);

        _self.showAll = ko.observable(false);
        _self.toggleMore = function () {
            var showAll = !_self.showAll();
            setNavItemsVisibility(showAll);
        };

        for (var i = 0; i < data.NavItems.length; i++) {
            var navItem = data.NavItems[i];
            _self.navItems.push(new NavItemVM(navItem));
        }

        var setNavItemsVisibility = function (showAll) {
            //update property
            _self.showAll(showAll);
            var i;
            var navItem;
            //update visibility
            if (showAll) {
                for (i = 0; i < _self.navItems().length; i++) {
                    navItem = _self.navItems()[i];
                    navItem.isVisible(true);
                }
            }
            else // hide itemLinks after n
            {
                for (i = 0; i < _self.navItems().length; i++) {
                    navItem = _self.navItems()[i];

                    if (i < _options.numItemsToShow)
                        navItem.isVisible(true);
                    else
                        navItem.isVisible(false);
                }
            }
        };

        setNavItemsVisibility(false);

        _allGroups.push(_self);

        invokeCallback("onGroupCreated", _self);
    };

    /// A function to represent the nav item view model
    var NavItemVM = function (data) {
        var _self = this;
        var _hasBeenAuthorised = _options.authoriseOnLoad;
        var i;
        _self.id = ko.observable(data.Id);
        _self.count = ko.observable(data.Count);
        _self.link = ko.observable(data.Link);
        _self.label = ko.observable(data.Label);
        _self.itemLinks = ko.observableArray([]);
        _self.keywords = ko.observableArray([]);
        _self.isVisible = ko.observable(true);

        _self.onClick = function () {
            if (_hasBeenAuthorised === false) {
                authoriseNavItem(_self, function (isSuccess) {
                    _hasBeenAuthorised = isSuccess;

                    if (isSuccess)
                        invokeCallback("onAuthorised", _self);
                });
            }
        };

        for (i = 0; i < data.ItemLinks.length; i++) {
            var itemLink = data.ItemLinks[i];
            _self.itemLinks.push(new ItemLinkVM(itemLink));
        }

        for (i = 0; i < data.Keywords.length; i++) {
            var keyword = data.Keywords[i];
            _self.keywords.push(new KeywordVM(keyword, _self));
        }

        _allNavItems.push(_self);

        invokeCallback("onNavItemCreated", _self);
    };

    /// A function to represent the item link view model
    var ItemLinkVM = function (data) {
        var _self = this;
        _self.id = ko.observable(data.Id);
        _self.label = ko.observable(data.Label);
        _self.link = ko.observable(data.Link);
        _self.description = ko.observable(data.Description);
        _self.isAuthorised = ko.observable(null);

        _allItemLinks.push(_self);
        invokeCallback("onItemLinkCreated", _self);
    };

    /// A function to represent the keyword view model
    var KeywordVM = function (data, navItemVM) {
        var _self = this;

        _self.navItemVM = navItemVM;
        _self.txt = ko.observable(data.Txt);
        _self.navItemID = ko.observable(data.NavItem);
        _self.link = ko.observable(_self.navItemVM.link());
        _self.label = ko.observable(_self.navItemVM.label());
        _self.itemLinks = ko.observable(navItemVM.itemLinks);
        _self.onClick = function (item, event) {
            _self.navItemVM.onClick();
            showInlineLinksPopup(_self, event);
            invokeCallback("onKeywordClicked", _self, event);

            event.preventDefault();
            return false;
        };

        _allKeywords.push(_self);
        invokeCallback("onKeywordCreated", _self);
    };

    /****************** INIT *******************/
    init();
};

ActiveNav.prototype.templates = {

    navPanel: '<!-- ACTIVE NAVIGATION PANEL TEMPLATE -->\
    <div class="activeNav" data-bind="foreach : groups">\
        <h2 data-bind="text : label"></h2>\
        <ul class="anlist" data-bind="foreach : navItems">\
            <li data-bind="visible : isVisible">\
                <a href="javascript:void(0)" data-bind="attr: { title: label }, text : label, click : onClick" class="anKeyword text-primary actionable"></a>\
                <!-- ko if: itemLinks().length > 0 -->\
                <ul data-bind="template : {name : \'template-ko-itemLink\', foreach : itemLinks}"></ul>\
                <!-- /ko -->\
            </li>\
        </ul>\
        <!-- ko if: navItems().length > 8 -->\
        <div class="more" data-bind="click : toggleMore, text : showAll() ? \'less\' : \'more\', css : { \'on\' : showAll() }">more</div>\
        <!-- /ko -->\
    </div>',

    itemLink: '<!-- ACTIVE NAVIGATION LINK ITEMS -->\
    <div class="none" data-bind="stopBindingChildren : true">\
    <div id="template-ko-itemLink">\
        <li>\
            <span data-bind="text : label, hidden : isAuthorised() == true, css : { anLockedLink : isAuthorised() == false, anAuthorisingLink : isAuthorised() == null }" class="anLockedLink"></span>\
            <a data-bind="attr: { href: link, title: description }, text : label, visible : isAuthorised() == true, gaq : label" class="anAuthorised" target="_blank"></a>\
        </li>\
    </div>\
    </div>',

    popupLinks: '<!-- ACTIVE NAVIGATION INLINE LINKS POPUP -->\
    <div class="dialog arrow aclinks activeNavPopup">\
        <h2 id="activeNavDialogTitle" data-bind="text: label"></h2>\
        <ul id="activeNavDialogLinks" data-bind="template : {name : \'template-ko-itemLink\', foreach : itemLinks}" class="links"></ul>\
    </div>'

};

// Retrieve all of the text nodes within a DOM node.
// Excluding is an array of nodes ignore, along with its descendants
// Ignore isSubCall - used for the recursive call;
function getTextNodesUnder(node, excludingTags, isSubCall) {

    isSubCall = isSubCall || false;
    excludingTags = excludingTags || [];

    if (!isSubCall) {
        for (var i = 0; i < excludingTags.length; i++) {
            excludingTags[i] = excludingTags[i].toUpperCase();
        }
    }

    var all = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
        if (node.tagName === undefined || excludingTags.indexOf(node.tagName) < 0) {
            //node type 3 is text node
            if (node.nodeType === 3)
                all.push(node);
            else
                all = all.concat(getTextNodesUnder(node, excludingTags));
        }
    }
    return all;
}

// Loop though a collections on a timeout and perform an operation on each item in turn
// Options:
// millisesonds [optional] -> The amount of time before the next item is evaluated
// index [optional] -> The index to start on in the array
// onSuccess [optional] -> A function to perform once the iteration has completed
function iterateCollectionTimeout(collection, task, options) {
    if (options === undefined || options.validOptions === undefined) {
        options = options || {};
        options.milliseconds = options.milliseconds || 0;
        options.index = options.index || 0;
        options.onSuccess = options.onSuccess || function () { };
        options.validOptions = true;
    }

    var index = options.index;

    if (index >= collection.length) {
        options.onSuccess();
    }
    else {
        var item = collection[index];

        task(item, index);

        setTimeout(function () {
            options.index++;
            iterateCollectionTimeout(collection, task, options);
        }, options.milliseconds);
    }
}