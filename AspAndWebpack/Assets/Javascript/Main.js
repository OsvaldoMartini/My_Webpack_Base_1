// <copyright file="Main.js" company="IHS">
// Copyright © 2011 IHS Inc. and its affiliated and subsidiary companies, all
// rights reserved. All other trademarks are the property of IHS Inc. and its
// affiliated and subsidiary companies.
//
// This product, including software, data and documentation are licensed to the user
// for its internal business purposes only and may not be disclosed, disseminated,
// sold, licensed, copied, reproduced, translated or transferred to any third party.
//
// IHS Inc.
// 15 Inverness Way East
// Englewood, Colorado 80112
// USA
// +1 303-736-3000
// </copyright>

// NOTE : This file is registered on _LayoutMain.cshtml so will be called on each page request.

//service urls etc
var _searchPanelService = '/Services/SearchPanelReceiver.svc/';
var _profileUpdateService = '/Services/ProfileUpdateReceiver.svc/';
var _sessionSearchUpdateService = '/Services/SessionSearchUpdateReceiver.svc/';

/**  Create value for Google adverts, all the ads on the same page want the same ord so here is a good place to put it.      **/
var ord = (Math.random() * 1000000000000).toString().substring(0, 8);

/** Create a keycode map for accessibility. The key map contains 74("j" key), 83("s" key), 76("l" key), 70("f" key), 67("c" key) and 84("t" key) 
 * This map is created on page load based on which keys are required **/
var keyMap = {};

var keyActions = keyActions || {};
keyActions['j + s'] = {
    title: 'Search',
    action: function (event) {
        var act = function () {
            if ($("#searchBox").length) {
                $("#searchBox").focus();
                window.scrollBy(0, -35);
            }
            else if ($("#searchBoxDiv_input").length) {
                $("#searchBoxDiv_input").focus();
            }
        };
        function moveFocus(e) {
            if (keyMap.j || keyMap.s) return;
            act();
            $(document).off('keyup', moveFocus);
        }
        if (event.type == 'click') {
            act();
        } else {
            $(document).on('keyup', moveFocus);
        }
    },
    test: '#searchBox,#searchBoxDiv_input'
};

keyActions['j + f'] = {
    title: 'Filters',
    action: "#myTabContent,#filters_tab_link"
};
keyActions['j + c'] = {
    title: 'Content',
    action: "#main"
};
keyActions['j + t'] = {
    title: 'Scroll to top of the page',
    action: function () {
        //window.location.hash = "#skipoptions";
        $("#skipoptions a").eq(0).focus();
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    }
};

function contextMenuPopup(event, link, isDraggable, isExpandable, isClearBackdrop) {
    var url = link.getAttribute('data-href');
    var title = link.getAttribute('data-title');

    var popupOptions = {
        title: title,
        contentUrl: url
    }

    if (isDraggable) {
        popupOptions.draggableOptions = { handle: ".modal-header" };
    }

    if (isExpandable) {
        popupOptions.expandable = {}
    }

    if (isClearBackdrop) {
        popupOptions.modalOptions = {
            backdrop: false
        }
    }

    showCustomPopup(popupOptions);

    event.stopPropagation();
    event.preventDefault();
    return false;
};

function setupA11yLinks() {
    var template = function () { var a = arguments; return '<a href="#' + (a[3] || '') + '" tabindex="-1" accesskey="' + a[2] + '" data-keycombo="' + a[1] + '"><span>' + a[0] + ':</span> <span>' + a[1] + '</span></a><span class="sr-only">, </span>'; }
    var html = '<div id="skipoptions"><span>Skip to:</span>';
    for (var key in keyActions) {
        if (keyActions.hasOwnProperty(key)) {
            var action = keyActions[key];
            if (!action) continue;
            if (action.test) {
                if (document.querySelector(action.test) === null) continue;
            } else if (typeof action.action == 'string') {
                if (document.querySelector(action.action) === null) continue;
            }
            var accesskey = key.slice(-1);
            html += template(action.title, key, accesskey);
        }
    }
    html += '</div>';
    $('body').prepend(html);
    $('#skipoptions a')
        .on('focus', function (event) {
            var options = $('#skipoptions');
            if (!$(document.body).hasClass('skipoptions-show')) {
                $(document.body).addClass('skipoptions-show');
                options.find('a[tabindex="-1"]').attr('tabindex', '0');
                window.setTimeout(function () {
                    $(window).trigger('resize');
                });
            }
        })
        .on('click', function (event) {
            var cmd = event.currentTarget.getAttribute('data-keycombo');// $(event.target).text();
            if (!keyActions[cmd]) return;
            runAction(event, cmd);
            event.preventDefault();
        })
        .first().attr('tabindex', 0);

    var runAction = function (event, cmd) {
        var action = keyActions[cmd].action;
        Analytics.event("skipoptions", event.type, cmd);
        if (typeof action === 'string') {
            var target = $(action);
            var t;
            for (var i = 0; i < target.length; i++) {
                t = target.eq(i);
                //if(!t.is(':focusable')){
                //    t = t.find(':focusable:first');
                //}
                if (t.length) {
                    var originalTabIndex = t[0].tabIndex;
                    if (originalTabIndex == -1) {
                        t[0].tabIndex = 0;
                    }
                    t.eq(0).focus();

                    t[0].tabIndex = originalTabIndex;
                    return;
                }
            }
            target.eq(0).focus();
            return;
        }
        if (typeof action === "function") {
            action(event);
        }
    };
    var normalizeKey = function (e) {
        return (e.key || String.fromCharCode(e.keyCode)).toLowerCase();
    };

    /** Create a keycode map for accessibility. The key map contains 74("j" key), 83("s" key), 76("l" key), 70("f" key), 67("c" key) and 84("t" key) **/
    //var keyMap = { };
    Object.keys(keyActions).forEach(function (key) {
        key.split(' + ').forEach(function (k) {
            keyMap[k.trim()] = false;
        })
    });
    $(document).keydown(function (e) {
        var keyTarget = e.target.nodeName === "INPUT" && e.target.type === "text";

        var key = normalizeKey(e);
        if (keyMap[key] === undefined) return;
        keyMap[key] = true;
        var activeKeys = Object.keys(keyMap).filter(function (k) { return keyMap[k]; });
        var actionKey = activeKeys.join(' + ');
        if (!keyActions[actionKey]) {
            actionKey = activeKeys.reverse().join(' + ');
        }
        if (keyActions[actionKey]) {
            if (keyTarget) {
                var $target = $(e.target);
                $target.val($target.val().substr(0, $target.val().length - 1));
            }
            runAction(e, actionKey);
            e.preventDefault();
        }
    }).on('keyup', function (e) {
        var key = normalizeKey(e);
        if (keyMap[key] === undefined) return;
        keyMap[key] = false;
    });
}

$(document).ready(function () {
    // Prevents ajax calls to be cached (very apparent in IE8/9)
    $.ajaxSetup({
        cache: false
    });

    $(".abortAllRequests").click(function (event) {
        AjaxRequestManager.abortAll();
    });

    // SCROLL TO TOP START
    var scrollToTop = $("#scroll-to-top");
    $(window).scroll(function () {
        if ($(this).scrollTop() > 500) {
            scrollToTop.fadeIn(500);
        } else {
            scrollToTop.fadeOut(500);
        }
    });
    scrollToTop.click(function () {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
    });
    // SCROLL TO TOP END

    ApplyTipsyToolTips(".tipsyMe", "n");

    $(".navFader", "#mainNav").hover(
        function () {
            $(".menuFade").addClass("in");
        },
        function () {
            $(".menuFade").removeClass("in");
        });

    // Tab accessible logo menu
    $('.logodropdown a').last().on("blur", function () {
        $('.logodropdown').removeClass('is-shown');
        $('.logo > span').removeClass('focus');
    });
    setupA11yLinks();

    //Auto load Pop-overs
    $(".webuiPopover.autoload")
        .each(function (i, item) {

            var $popLink = $(item);
            var content = "";

            var divContent = $popLink.find(".webuiPopover-content");
            if (divContent) {
                content = $(divContent).html();
            }

            $popLink.webuiPopover({
                content: content
            });
        });

    //Clear the modal box when it is collapsed.
    $(document).on('hidden.bs.modal', function (e) {
        $(e.target).removeData('bs.modal');
    });

    /// Banner 
    function addClass(element, css) {
        if (element.classList) element.classList.add(css);
        else element.className += ' ' + css;
    }
    function removeClass(element, css) {
        if (element.classList) element.classList.remove(css);
        else element.className.replace(new RegExp('(^|\\b)' + css + ' (\\b|$)', 'gi'), '');
    }

    var subNavTimeout = false;

    var setUpMenuMoreLink = function () {
        var nav = $('#mainNav .nav-bar:first-of-type');
        var navOnExpand = 'nav-on-expand';
        var navItems = nav.children();
        var navMore = navItems.filter('.nav-more');
        navItems = navItems.filter(':not(.nav-more)');
        var curHiddenCount = navItems.filter('.' + navOnExpand).length;

        navItems.removeClass(navOnExpand);
        var hiddenCount = 0;
        for (var i = navItems.length; i > 0;) {
            var $item = $(navItems[--i]);
            if ($item.position().top == 0 && (hiddenCount == 0 || navMore.position().top == 0)) {
                break;
            }
            //if ($item.position().top > 0 || navMore.position().top > 0 && hiddenCount > 0) {
            $item.addClass(navOnExpand);
            hiddenCount++;
            //continue;
            //}

        }
        if (!hiddenCount) navMore.hide(); else navMore.show();

        if (curHiddenCount != hiddenCount) {
            if (expandedNavBar) expandedNavBar.remove();
            expandedNavBar = nav.clone(true, true).addClass('nav-bar-extended').insertAfter(nav);
        }
    };
    var expandedNavBar = false;
    var navMore = $('#mainNav .nav-bar > .nav-more').on('click', function () {
        var navbar = $(this).closest('.navbar-nav').toggleClass('open');
    });

    var setupMenuStretch = function () {
        var nav = $('#mainNav');
        nav.parent().css('height', nav.height() + 'px');
    };

    if (navMore.length) {
        $(window).on('resize', setUpMenuMoreLink);
        setUpMenuMoreLink();
    } else {
        $(window).on('resize', setupMenuStretch);
        setupMenuStretch();
    }

    if (window.a11y != undefined) {
        a11y.menubar($('.nav-bar'));
    }

    if (window.settings != undefined) {
        window.settings.isVisible.subscribe(function () {
            var menubar = $('.action-buttons.nav-bar').data('menu-bar').init();
        });
    }

    var leftScroll = 0;
    window.onscroll = function () {
        if (document.body.scrollLeft === leftScroll) return;
        var fixedx = document.getElementsByClassName('position-fixed-x');
        var transform = 'translateX(' + document.body.scrollLeft + 'px)';
        for (var i = 0; i < fixedx.length; i++) {
            fixedx[i].style.transform = transform;
        }
        leftScroll = document.body.scrollLeft;
    };

});  //end document.ready



/**
 * Allow links to call a js method to change urls and persist the querystring, 
 * @param {} newUrl    --  
 * @param {} checkFor  -- only do querystring and hash if checkFor exists in the url i.e same category  
 * @param {} persistCurrentQuerystring  --
 * @returns {} 
 */
function loadUrlWithRequestCancel(url) {
    $(".mainLoadingOverlay").show();
    AjaxRequestManager.abortAll();
    window.location = url;
}

/**
 * Performs a simple jquery ajax get and the sets the html content
 * of the element with the given id (typically a div)
 * @param {} url -- the url to load content from
 * @param {} id  -- the id of the element to populate.
 * @returns {} 
 */
function populateElement(url, id) {

    $.ajax({
        url: url,
        type: 'GET',
        cache: false,
        timeout: 30000
    })
        .done(function (data) {
            $("#" + id).html(data);
        })
        .fail(function () {
            $("#" + id).html("<a href=\"javascript:populateElement('" + url + "', '" + id + "')\" class=\"btn btn-primary\">Reload</a><p>(panel took too long to load)</p>");
        });
}

/**
 * Allow links to call a js method to change urls and persist the querystring, 
 * @param {} newUrl    --  
 * @param {} checkFor  -- only do querystring and hash if checkFor exists in the url i.e same category  
 * @param {} persistCurrentQuerystring  --
 * @returns {} 
 */
function changeUrl(newUrl, checkFor, persistCurrentQuerystring) {
    //alert("qs=" + location.search);
    //alert("hash=" + location.hash);

    //does the newUrl have a hash? if so strip it and stick it at the end in a minute
    var hashIndex = newUrl.search('[#?]');
    var currentHash = location.hash || location.search;
    var newHash = "";
    if (hashIndex > -1) {
        newHash = newUrl.substr(hashIndex);
        newUrl = newUrl.substr(0, hashIndex);
    }
    //make sure we override any clashes - newUrl wins
    if (currentHash != "") {
        if (location.href.search(checkFor) > -1 && persistCurrentQuerystring) {
            newHash = mergeHashes(newHash, currentHash);
        }
    }


    window.location.href = newUrl + '#' + newHash.replace(/[#?]/, "");
    if (newUrl == window.location.pathname && !window.location.search) {
        window.location.reload();
    }
}
function mergeHashes(hash1, hash2) {
    if (!hash1) return hash2;

    var arrNewHash = hash1.replace(/[#?]/, "").split("&");
    var arrCurrentHash = hash2.replace(/[#?]/, "").split("&");
    var returnHash = "";
    var thisArr;

    for (var i = 0; i < arrNewHash.length; i++) {

        thisArr = arrNewHash[i].split('=');


        for (var j = 0; j < arrCurrentHash.length; j++) {
            if (arrCurrentHash[j].split('=')[0] === thisArr[0]) {
                if (vm && vm.facetsVM && vm.facetsVM.facetQueryKey == thisArr[0]) {
                    var curFac = vm.facetsVM.decodeFacets(arrCurrentHash[j].split('=')[1]);
                    var newFac = vm.facetsVM.decodeFacets(thisArr[1]);
                    $.extend(curFac, newFac);
                    thisArr[1] = vm.facetsVM.encodeFacets(curFac);
                }

                arrCurrentHash[j] = thisArr.join('=');
                break;
            }

            //no match, add it.
            if (j == arrCurrentHash.length - 1) {
                arrCurrentHash.push(thisArr.join('='));
            }
        }
    }

    return arrCurrentHash.join("&");
}

// create an event to broadcast resize has happened
// to subscribe to it do something like $(document).bind('ResizeEventCalled', function (e) { yourFunction(); });
var ResizeEventCalled = jQuery.Event("ResizeEventCalled");
var resizeTimeout = null;
var winWidth = $(window).width(), winHeight = $(window).height();

$(window).resize(function () {
    var onResize = function () {
        $(document).trigger(ResizeEventCalled);
    }

    //New height and width
    var winNewWidth = $(window).width(),
        winNewHeight = $(window).height();

    // compare the new height and width with old one
    if (winWidth != winNewWidth || winHeight != winNewHeight) {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(onResize, 300);
    }
    //Update the width and height
    winWidth = winNewWidth;
    winHeight = winNewHeight;
});

// add extension to array
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

function ApplyTipsyToolTips(selector, pos) {
    var gravity = function () {
        var placement = $(this).data('placement');
        placement = placement && placement
            .replace('top', 's')
            .replace('right', 'w')
            .replace('bottom', 'n')
            .replace('left', 'e')
            .replace('-', '');

        return placement || pos;
    };
    $(selector).tipsy({ gravity: gravity, delayIn: 200, delayOut: 200, fade: true, aria: true });
}

function ShowSuccess(text, timeout) {
    return ShowAlert(1, text, timeout);
}

function ShowInfo(text, timeout) {
    return ShowAlert(2, text, timeout);
}

function ShowError(text, timeout) {
    return ShowAlert(3, text, timeout);
}

function ShowAlert(t, text, timeout) {

    var qm = $("#quickMessage");
    if (qm.length > 0) {
        qm = qm.clone().attr('id', '').addClass('quickMessage').appendTo('body');
        if ($.isFunction(text)) {
            text(qm.find("#quickMessageText"));
        } else {
            qm.find("#quickMessageText").text(text);
        }
        if (t === 1) {
            if (timeout == undefined) {
                timeout = 1000;
            }
            qm.find(".close").hide();
            qm.removeClass("alert-danger alert-warning");
            qm.addClass("alert-success");
        } else if (t === 2) {
            qm.find(".close").show();
            qm.removeClass("alert-success alert-danger");
            qm.addClass("alert-warning");
        } else if (t === 3) {
            qm.find(".close").show();
            qm.removeClass("alert-success alert-warning");
            qm.addClass("alert-danger");
        }

        // setup the auto hide
        if (timeout != undefined) {
            var msgTimeout = setTimeout(function () {
                qm.fadeOut();
                clearTimeout(msgTimeout);
            }, timeout);
        }

        qm.fadeIn();
    }

    return qm;
}

// Show banner menu on small devices
$(".menu").click(function (event) {
    $(".main").toggleClass('show');
    $('html').click(function () {
        $(".main").removeClass('show');
    });
    event.stopPropagation();
});

function ShowFeedback(event, feedbackName, feedbackMetadata) {
    showCustomPopup({
        title: "Feedback",
        contentUrl: "/Feedback/Index"
    });

    event.stopPropagation();
    event.preventDefault();
}


function loadPopup(title, url, data, viewModel, closeCallback, openCallback, modalSelector) {
    /**
     * **************************************************************************************************************
     * OBSOLETE - TRY AND USE THE SHOW CUSTOM POPUP INSTEAD - OBSOLETE
     * * **************************************************************************************************************
     */
    $.ajax({
        url: url,
        method: "GET",
        data: data || {},
        async: true
    })
        .done(function (result) {
            showPopup(title, result, viewModel, closeCallback, openCallback, null, modalSelector);
        })
        .fail(function () {
            showPopup(title, "Something has gone wrong!");
        });
}

function showCustomPopup(options) {

    var opts = $.extend({},
        {
            modalId: "generalDialog",
            title: "",
            body: "<div style='height:100px'><span class='loading' /></div>",
            contentUrl: undefined,
            contentUrlData: {},
            viewModel: undefined,
            closeCallback: function () { },
            openCallback: function () { },
            modalOptions: undefined,
            draggableOptions: undefined,
            resizableOptions: undefined,
            expandable: false,
            bodySelector: ".modal-body",
            titleSelector: ".modal-title",
            headerSelector: ".modal-header",
            size: undefined
        },
        options);

    var modalSelector = opts.modalId.lastIndexOf("#", 0) === 0 ? opts.modal : "#" + opts.modalId;

    var $popupContainer = $(modalSelector);
    var popup = $popupContainer.get(0);
    var $modalBody = $popupContainer.find(opts.bodySelector);
    var modalBody = $modalBody.get(0);
    var $modalTitle = $popupContainer.find(opts.titleSelector);
    var $modalDialog = $popupContainer.find(".modal-dialog");
    var $resizeButton = $popupContainer.find(".modal-expand");

    if ($popupContainer.hasClass("in")) {
        //clear any remaining events or bindings
        $popupContainer.trigger('hidden.bs.modal');
    }

    $popupContainer.on('hidden.bs.modal');
    if (window.ko && modalBody !== undefined) {
        ko.cleanNode(modalBody);
    }

    if (!popup) {
        return;
    }

    $modalBody.html(opts.body);
    $modalTitle.text(opts.title);

    $modalDialog.removeClass('modal-lg modal-sm');
    if (opts.size) {
        $modalDialog.addClass('modal-' + opts.size);
    }

    if (opts.contentUrl) {
        $.ajax({
            url: opts.contentUrl,
            method: "GET",
            traditional: true,
            data: opts.contentUrlData || {},
            async: true
        })
            .done(function (result) {
                $modalBody.html(result);

                if (window.ko && opts.viewModel) {
                    ko.applyBindings(opts.viewModel, modalBody);
                }
            })
            .fail(function () {
                $modalBody.html("Something has gone wrong...");
            });
    }

    $popupContainer.off('hidden.bs.modal');
    $popupContainer.on('hidden.bs.modal', function () {
        if (window.ko && modalBody !== undefined) {
            ko.cleanNode(modalBody);
        }

        if (opts.draggableOptions && $popupContainer.is('ui-draggable')) {
            //reset position and classes if the dialog was resizable
            $popupContainer.css({
                top: 0,
                left: 0
            });
            $popupContainer.removeClass("draggable");
            $popupContainer.draggable('destroy');
        }

        if (opts.expandable) {
            $popupContainer.removeClass("expandable");

            if ($popupContainer.hasClass("max")) {
                $resizeButton.removeClass("icon-resize-full");
                $resizeButton.removeClass("icon-resize-small");
                $popupContainer.removeClass("max");
            }
            
            $resizeButton.addClass("icon-resize-full");
            $resizeButton.off("click");
        }

        if (opts.resizableOptions && $popupContainer.is('ui-resizable')) {
            $popupContainer.resizable('destroy');
        }

        opts.closeCallback(modalBody);

        $(this).removeData();
    });
    $popupContainer.off('shown.bs.modal');
    $popupContainer.on('shown.bs.modal', function () {
        if (window.ko && opts.viewModel && !ko.dataFor(modalBody)) {
            ko.applyBindings(opts.viewModel, modalBody);
        }
        opts.openCallback(modalBody);
    });

    opts.modalOptions ? $popupContainer.modal(opts.modalOptions) : $popupContainer.modal('show');

    if (opts.draggableOptions) {
        $popupContainer.addClass("draggable");
        $popupContainer.draggable(opts.draggableOptions);
    }

    if (opts.expandable) {
        $popupContainer.addClass("expandable");
        $resizeButton.click(function () {
            $popupContainer.toggleClass("max");
            $resizeButton.toggleClass("icon-resize-full");
            $resizeButton.toggleClass("icon-resize-small");
            if (opts.draggableOptions) {
                $popupContainer.toggleClass("draggable");
                var isExpanded = $popupContainer.hasClass("max");
                $popupContainer.draggable(isExpanded ? "disable" : "enable");
            }
        });
    }

    if (opts.resizableOptions) {
        $popupContainer.resizable(opts.resizableOptions);
    }
};

/**
 * Shows popup on any MVC page that inherits from _LayoutMain.cshtml
 * @param {string} The title of the popup
 * @param {string or html} The body of the popup can accept text or html node
 * @param {function} Function to call when the modal closes
 * @param {function} Function to call when modal opens
 * @param {string} Selector for the modal body, null defaults to ".modal-body"
 * @param {string} If you do not wish to use the default modal box on the page you can specify another custom one.
 */
function showPopup(title, body, viewModel, closeCallback, openCallback, bodySelector, modalSelector) {
    /**
     * **************************************************************************************************************
     * OBSOLETE - TRY AND USE THE SHOW CUSTOM POPUP INSTEAD - OBSOLETE
     * * **************************************************************************************************************
     */
    modalSelector = modalSelector || "#generalDialog";
    var $popupContainer = $(modalSelector);
    var popup = $popupContainer.get(0);
    var $modalBody = $(modalSelector).find(bodySelector || ".modal-body");
    var modalBody = $modalBody.get(0);
    var $modalTitle = $popupContainer.find(".modal-title");

    //clear any remaining events or bindings
    $popupContainer.on('hidden.bs.modal');
    if (window.ko && modalBody !== undefined) {
        ko.cleanNode(modalBody);
    }

    if (popup !== null && popup !== undefined) {
        $modalBody.html(body);
        $modalTitle.text(title);

        if (window.ko && viewModel) {
            ko.applyBindings(viewModel, modalBody);
        }

        $popupContainer.off('hidden.bs.modal');
        $popupContainer.on('hidden.bs.modal', function () {
            if (closeCallback) {
                if (window.ko && modalBody !== undefined) {
                    ko.cleanNode(modalBody);
                }
                closeCallback(modalBody);
            }
        });
        $popupContainer.off('shown.bs.modal');
        $popupContainer.on('shown.bs.modal', function () {
            if (openCallback) {
                openCallback(modalBody);
            }
        });


        $popupContainer.modal('show');
    }
}

function closePopup(modalId) {

    var id = "#generalDialog";

    if (modalId) {
        id = modalId.startsWith("#") ? modalId : "#" + modalId;
    }

    var $popupContainer = $(id);
    var popupContainer = $popupContainer.get(0);

    $popupContainer.modal("hide");

    if (typeof (ko) !== "undefined" && !!ko.dataFor(popupContainer)) {
        ko.cleanNode(popupContainer);
    }
};

var opendialog = function (dpos, did) {
    if (typeof did === "undefined") {
        var selector = '.dialog.arrow.' + dpos;
    } else {
        var selector = '.dialog.arrow.' + did;
    };
    var thisdialog = $(selector);
    var thisheight = $(this).height();
    var thiswidth = $(this).width();
    var thisdialogheight = thisdialog.outerHeight();
    var thisdialogwidth = thisdialog.outerWidth();
    var thispos = $(this).offset();
    var ba = $(".bottomadd");
    var ta = $(".topadd");
    var la = $(".leftadd");
    var ra = $(".rightadd");
    var or = $(".offsetright");
    var callback = function (e) {
        if (!$(e.target).parents().andSelf().is('.dialog')) {
            thisdialog.hide();
            ba.removeClass("bottom bottomadd").addClass("top");
            ta.removeClass("top topadd").addClass("bottom");
            la.removeClass("left leftadd").addClass("right");
            ra.removeClass("right rightadd").addClass("left");
            or.removeClass("offsetright");
            $(document).off('click', callback);
        }
    };
    console.log(this);
    $(".dialog").hide();
    ba.removeClass("bottom bottomadd").addClass("top");
    ta.removeClass("top topadd").addClass("bottom");
    la.removeClass("left leftadd").addClass("right");
    ra.removeClass("right rightadd").addClass("left");
    or.removeClass("offsetright");
    if (dpos == "top") {
        thisdialog.addClass("top").css({
            top: thispos.top - thisdialogheight - thisheight + 5,
            left: thispos.left - (thisdialogwidth / 2) + (thiswidth / 2)
        });
        if (thisdialog.offset().top > (thispos.top - thisdialogheight)) {
            thisdialog.removeClass("top").addClass("bottom bottomadd").css({
                top: thispos.top + thisheight + 15
            });
        } else if (thispos.left - (thisdialogwidth / 2 - thiswidth / 2) < 0) {
            console.log("off to left", thispos.left - (thisdialogwidth / 2 - thiswidth / 2))
            thisdialog.addClass("offsetright").css({
                left: thispos.left - (thisdialogwidth / 10) + (thiswidth / 2)
            });
        };
    } else if (dpos == "bottom") {
        thisdialog.addClass("bottom").css({
            top: thispos.top + (thisdialogheight / 2) - 15,
            left: thispos.left - (thisdialogwidth / 2) + (thiswidth / 2)
        });
        if (((thispos.top + thisdialogheight + thisheight) - (thisdialog.offset().top)) > ($(window).height())) {
            thisdialog.removeClass("bottom").addClass("top topadd").css({
                top: thispos.top - thisdialogheight - thisheight + 5
            });
        }
    } else if (dpos == "right") {
        thisdialog.addClass("right").css({
            top: thispos.top - (thisdialogheight / 2) + (thisheight / 2),
            left: thispos.left + thiswidth + 15
        });
        if ((thispos.left + thiswidth + thisdialogwidth) > $(window).width()) {
            thisdialog.removeClass("right").addClass("left leftadd").css({
                left: thispos.left - (thisdialogwidth) - 15
            });
        };
    } else if (dpos == "left") {
        thisdialog.addClass("left").css({
            top: thispos.top - (thisdialogheight / 2) + (thisheight / 2),
            left: thispos.left - (thisdialogwidth) - 15
        });
        if ((thispos.left - thisdialogwidth - 15) < 0) {
            thisdialog.removeClass("left").addClass("right rightadd").css({
                left: thispos.left + thiswidth + 15
            });
        };
    }
    thisdialog.fadeIn('fast', function () {
        if (thisdialog.is(":visible")) {
            $(document).on('click', callback);
        }
    });
};


$('#generalDialog').on('hidden.bs.modal', function (event) {
    var $target = $(event.target);
    $target.removeData('bs.modal');
    $target.find('.close.remoteclose').remove();
    $target.find('.modal-content').html($target.data('base'));
    $target.removeData('base');
});

$('#generalDialog').on('show.bs.modal', function (event) {
    var $target = $(event.target);
    $target.data('base', $target.find('.modal-content').html());
});

$(document).on('show.bs.dropdown', function (e) {
    var btn = $(e.relatedTarget);
    var parent = btn.parent();
    var menu = parent.find('.dropdown-menu').eq(0);
    if (btn.offset().top + btn.height() + menu.height() > document.body.scrollHeight) {
        parent.addClass('dropup');
        parent.data('dropped-up', true);
    }
});

$(document).on('hidden.bs.dropdown', function (e) {
    var btn = $(e.relatedTarget).parent();
    if (btn.data('dropped-up')) {
        btn.removeClass('dropup');
        btn.removeData('dropped-up');
    }
});

window.post = function (path, params, method) {
    method = method || "post";
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

/**
 * Clears the message for the users UI
 * @param {string} The messageName or identifier
 */
function closeMessage(messageId) {
    $.getJSON("/widget/Message/clear/" + messageId)
        .done(function () {
            // Dont need to do anything
        })
        .fail(function (error) {
            CMP.Utils.ErrorLogging.logError("Could not clear Message", "Main.js", null, null, error.statusText);
        });
};

/**

Can we cache the results from a request reliably and consistently? If so its a good thing to do in some circumstances.
use $.get2 or $.post2
**/

var useFacetCaching = false;
var StorageObject = sessionStorage; // may elect to change to localstorage aka jmf - be sure to clear down often
jQuery.each(["get", "post"], function (i, method) {
    jQuery[method + "2"] = function (url, data, callback, type) {


        // Shift arguments if data argument was omitted
        if ($.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        var ajaxArguments = $.extend({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        },
            jQuery.isPlainObject(url) && url
        );

        if (useFacetCaching) {
            var cacheKey = window.location.pathname + (ajaxArguments.url + "::" + JSON.stringify(ajaxArguments.data)).replace(/["']/g, "");
            var cacheValue = undefined;
            if ((cacheValue = StorageObject.getItem(cacheKey)) !== null) {
                cacheValue = JSON.parse(cacheValue);

                if ($.isFunction(ajaxArguments.success)) {
                    ajaxArguments.success(cacheValue);
                }

                return $.Deferred().resolve(cacheValue);
            }

            if (!$.isArray(ajaxArguments.success)) ajaxArguments.success = [ajaxArguments.success];
            ajaxArguments.success.push(function (data) {
                StorageObject.setItem(cacheKey, JSON.stringify(data));
            });
        }
        // The url can be an options object (which then must have .url)
        return jQuery.ajax(ajaxArguments)
    };
});
