/// An active navigation function used to retrieve a list of links relevant to a content specified in the source
/// ownerID is where the active nave will be displayed
/// sourceID is an id of an element which content will be parsed
var ActiveNavForSearch = function (ownerID, sourceID, options) {
    /// OPTIONS
    /**
    * orientation: vertical, horizontal : Default (vertical) -> Determines the orientation of the displayed links
    *
    */

    /*************** VARIABLES ***************/

    var _self = this;
    var _owner = document.getElementById(ownerID);
    var _source = document.getElementById(sourceID);
    var _sourceID = sourceID;
    var _options = options || {};

    /************** PROPERTIES *************/

    /**************** ON INIT ****************/

    var init = function () {
        if (_owner === undefined)
            throw "You need to supply the owner id for the activeNav function";

        if (_source === undefined)
            throw "You need to supply the source id for the activeNav function";

        checkOptions();

        load();
    };

    /*********** PRIVATE FUNCTIONS ***********/

    /// Check the options and make sure the defaults are applied if they have not been supplied by the user
    var checkOptions = function () {
        if (_options.orientation === undefined)
            _options.orientation = 'vertical';
    };

    var load = function () {
        $(_owner).html(getTemplate());
        $(_owner).append(getStyle());
        $(_owner).append("<div style='clear: both;'></div>");
        processActiveNav();
    };

    var getTemplate = function () {
        var template = "<div id='activeNavPanel' class='activeNav' data-bind='foreach: groups'>";
        template = template + "<ul class='anlist' data-bind='foreach: navItems' style='display: inline-block'>";
        template = template + "<li data-bind='visible: isVisible' style='display: inline-block'><a style='padding-left: 5px;' data-bind='    attr: { href: link, title: label }, text: label, click: onClick' class='anKeyword'></a>";
        template = template + "<ul data-bind='foreach: itemLinks' style='top: 23px; left: -25px; z-index: 1;'>";
        template = template + "<li style='list-style-type: none'>";
        template = template + "<span data-bind='text: label, visible: isAuthorised() == false, css: { anLockedLink: isAuthorised() == false, anAuthorisingLink: isAuthorised() == null }' style='display: none;' class='anLockedLink'></span>";
        template = template + "<a data-bind='attr: { href: link, title: description }, text: label, visible: isAuthorised() == true, gaq: label' class='anAuthorised' target='_blank'></a> </li> </ul> </li> </ul> </div>";
        return template;
    }

    var getStyle = function () {
        var style;
        if (_options.orientation === 'vertical') {
            style = + style + "<style>.activeNav ul ul:after, .activeNav ul ul:before { left: 30px; top: -5px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 5px solid #CCC; content: ' '; height: 0; width: 0; position: absolute; pointer-events: none; }";
            style = + style + ".activeNav ul ul:after { border-color: rgba(204, 204, 204, 0) rgba(204, 204, 204, 0) #f8f8f8; border-width: 5px; margin-top: -3px; }";
            style = + style + "#activeNavPanel { margin-right: 50%; min-width: 200px; margin-top: -25px; min-height: 25px; }";
            style = + style + ".activeNav ul ul { padding: 3px 0 !important; } #activeNavPanel  ul{ float:right; margin:0px; } </style>";
        }

        return style;
    }

    var processActiveNav = function () {
        if (_source !== null) {
            var _activeNavigation = new ActiveNav("activeNavPanel", {
                isAutoLoad: true,
                parseContentID: _sourceID
            });

            // Show active nav popout on navItem click
            $('#activeNavPanel').on('click', '.anKeyword', function (e) {
                e.stopPropagation();
                showNavLinks(this);
                var clickText = $(this).text();
                
                if ((typeof (ga) !== 'undefined')) {
                    ga("send",
                    {
                        hitType: "event",
                        eventCategory: "Active Navigation",
                        eventAction: "Open popout",
                        eventLabel: clickText,
                        nonInteraction: 0
                    });
                } 

            });
        }
    }

    var showNavLinks = function (anch) {
        var popUp = $(anch).next('ul');
        if (popUp.is(':hidden')) {
            popUp.css('visibility', 'hidden');
            popUp.show();
            var docHeight = $('body').height() - $('#footer').height();
            var popupOffset = popUp.offset();
            var popupPos = popUp.height() + popupOffset.top;
            if (popupPos > docHeight) { popUp.addClass('offset') };
            popUp.hide();
            popUp.css('visibility', 'visible');
        }
        $('.activeNav ul li ul').not(popUp).hide();
        popUp.fadeToggle('fast', function () {
            $('html').click(function () {
                popUp.fadeOut('fast');
            });
            var docHeight = $('html').height() - $('#footer').height();
            var popupOffset = popUp.offset();
            var popupPos = popUp.height() + popupOffset.top;
            if (popupPos > docHeight) { popUp.addClass('offset') }
        });
    }

    /*********** PUBLIC FUNCTIONS ***********/

    /****************** INIT *******************/
    init();
};