﻿/**
 * A view model for Tutorials.
 * @param {object} options - A collection of options used by the Tutorial View Model.
 *      maxPages: The number of tutorial items available on a page.
 *      hide: A value indicating whether to hide the tutorial on load. Default = false
 *      startingPage: the tutorial item number to start with. Default = 1
 *      cookie: The name of the cookie used to determine if the tutorial has been shown.
 *      name: The name of the tutorial, used to change the user settings.
 *  @param {object} [search=null]  - A reference to the search object so that the TutorialVM can be notified
 *     when the search results have been retrieved.
 */
var TutorialVM = function (options, search) {

    var self = this;

    //Set default values for options if they don't exist.
    options = $.extend({
        hide: false,
        startingPage: 1,
        cookie: "IHS_RESULTS_TUTORIAL_D5816CA0-C2EA-4D42-B244-CD034E4CD5E0",
        name: 'ResultsTutorial',
        maxPages: 2,
        loop: false
    }, options);

    self.search = search;
    self.isActive = ko.observable(false);
    self.activePage = ko.observable(0);
    self.maxPages = options.maxPages;
    self.hide = options.hide;
    self.startingPage = options.startingPage;
    self.cookieName = options.cookie;
    self.name = options.name;
    self.loop = options.loop;

    if (search) {
        search.registerFinishedCallback(function (result, updateRequestSender) {
            if (self.hide === false && updateRequestSender === search.updateRequestSender.pageLoad) {
                self.checkIfActive();
            }
        });
    } else if (self.hide === false) {
        self.checkIfActive();
    }

    self.buttonText = ko.computed(function () {
        if (self.nextPage()) return "Next";
        if (self.loop) return "Back";
        return "Close";
    });

    self.activePage.subscribe(function (page) {
        if (page < 0) {
            self.activePage(0);
            return;
        }
        if (!self.pageIsPossible(page) && self.pageIsPossible(self.maxPages)) {
            self.activePage(self.maxPages);
        }
    });

    self.activePage.subscribe(function (page) {
        var dropdown = $('.highlightHintOutline.dropdown.open');
        if (dropdown.length) {
            dropdown.removeClass('open');
            dropdown.off('hide.bs.dropdown');
        }

        $('.highlightHintOutline').removeClass('highlightHintOutline');
        $('[data-tutorial]').css('display', '');
        var message = $('[data-tutorial="' + page + '"]');
        if (!message.length) return;

        message.css('display', 'block');
        self.addPageFurniture(message);

        window.setTimeout(function () {
            if (document.activeElement) {
                if(document.activeElement.nodeName === 'INPUT'){
                    return;
                }
                document.activeElement.blur();
            }
            var firstMsg = message.first();
            if(firstMsg.attr('tabindex') == null){
                firstMsg.attr('tabindex','-1');
            }
            message.first().focus();
        });

        var valid = message.toArray().reduce(function (valid, msg) {
            var message = $(msg);
            var attach = message.data('tutorial-attach');
            if (!attach) return true;
            if (!(attach = $(attach).first()).length) return valid;

            if (!message.is('[data-attach-no-outline]')) {
                attach.addClass('highlightHintOutline');
            }

            if (attach.is('.dropdown')) {
                attach.addClass('open');
                attach.on('hide.bs.dropdown', function (e) {
                    e.preventDefault();
                });
                attach = attach.find('.dropdown-menu');
                if (!message.is('[data-attach-no-outline]')) {
                    attach.addClass('highlightHintOutline');
                }
            }

            var attachRect = attach.get(0).getBoundingClientRect();
            if (attach.css('display') == 'none') {
                attach.show();
                attachRect = attach.get(0).getBoundingClientRect();
                attach.hide();
            }
            if (message.hasClass('toppointer')) {
                message.css({ top: attachRect.top + attachRect.height + 20, left: attachRect.left + attachRect.width / 2 - message.width() / 2 });
                return true;
            }
            if (message.hasClass('rightpointer')) {
                message.css({ top: attachRect.top + attachRect.height / 2 - message.height() / 2, left: attachRect.left - message.width() - 55 });
                return true;
            }
            if (message.hasClass('bottompointer')) {
                message.css({ top: attachRect.top - message.height() - 30, left: attachRect.left - message.width() / 2 - 10 });
                return true;
            }
            if (message.hasClass('leftpointer')) {
                message.css({ top: attachRect.top + attachRect.height / 2 - message.height() / 2, left: attachRect.left + attachRect.width + 15 });
                return true;
            }
            return true;
        }, false);

        if(!valid){
            self.watchForPage(page)
            self.next();
        }
    });

    self.pageWatches = {};

    self.addStartLinkToHelpMenu();

    $(document).on('keydown', function(e){
        if(e.keyCode !== 27){
            return;
        }
        // escape
        if (self.activePage()){
            self.close();
        }
    })
};

TutorialVM.prototype.addPageFurniture = function ($messages){
    var self = this;
    if ($messages.find('.hideTutorialBox').length) return;
    $messages.filter('.startHint')
        .each(function(i, m){
            var buttons = $('<div><button class="btn btn-primary" data-bind="text:buttonText, click:next">Next</button>' +
                '<button class="btn btn-link hideTutorialBox pull-right" data-bind="click:close">Hide Tutorial</button>' +
                '<button class="close hideTutorialBox" tabindex="-1" data-bind="click:close">&times;</button></div>');
            $(m).append(buttons);
            ko.cleanNode(buttons[0]);
            ko.applyBindings(self, buttons[0]);
        });
};

TutorialVM.prototype.start = function () {
    var self = this;
    self.activePage(self.startingPage);

    Cookies.createCookie(self.cookieName, false, 365);

    $.post("/MyProfile/SetSetting?propertyName=Hide" + self.name + "&value=false");

    self.checkIfActive();
};

TutorialVM.prototype.checkIfActive = function () {

    var self = this;
    var hideTutorial = Cookies.readCookie(self.cookieName) || false;

    if (!hideTutorial || hideTutorial == "false" || hideTutorial == "DISABLED") {
        $.get("/MyProfile/GetSetting?propertyName=Hide" + self.name,
                function(data) {
                    if (data === undefined || data === null || data.length === 0 || data === false || data === "False"
                    ) {
                        self.isActive(true);
                        self.activePage(self.startingPage);
                    }
                })
            .fail(function () {
                self.isActive(true);
                self.activePage(self.startingPage);
            });
    } else {
        self.isActive(false);
        self.activePage(0);
    }
};

TutorialVM.prototype.close = function () {
    var self = this;

    self.activePage(0);

    Cookies.createCookie(self.cookieName, true, 365);

    $.post("/MyProfile/SetSetting?propertyName=Hide" + self.name + "&value=true");
};

TutorialVM.prototype.back = function () {
    var self = this;
    var activePage = self.activePage();
    self.activePage(activePage - 1);
};

TutorialVM.prototype.next = function () {
    var self = this;
    var nextPage = self.nextPage(true);

    if (nextPage) self.activePage(nextPage);
    else if (self.loop) self.activePage(self.startingPage);
    else self.close();
};

TutorialVM.prototype.pageIsPossible = function (page, setWatch) {
    var self = this;
    if (page == 0) return true;
    var pages = $('[data-tutorial="'+page+'"]');
    if(!pages.length) return false;
    if (!pages.children().length) return false;
    var when = pages.data('tutorial-when');
    if(!when) {
        var attach = pages.data('tutorial-attach');
        if(!attach) return true;
        if(self.isVisible(attach)) return true;
        when = attach
    }

    var isPossible = self.isVisible(when);

    if (isPossible) return true;

    if(setWatch) this.watchForPage(page);
    return false
};

TutorialVM.prototype.nextPage = function (setWatch) {
    var self = this;
    var page = self.activePage() + 1;
    while ($('[data-tutorial="' + page + '"]').length) {
        if (self.pageIsPossible(page, setWatch)) {
            return page;
        }
        page++;
    }
    return false;
}

TutorialVM.prototype.isActivePage = function (page) {
    var self = this;
    return self.activePage() == page
};

TutorialVM.prototype.watchForPage = function (pageNo) {
    var self = this;
    var page = $('[data-tutorial="' + pageNo + '"]');
    var when = page.data('tutorial-when');
    if (!when) {
        when = page.data('tutorial-attach');
    }
    if (self.pageWatches[when]) return;
    self.pageWatches[when] = pageNo;
    function watch() {
        if (self.isVisible(when)) {
            delete self.pageWatches[when];
            window.setTimeout(function(){
                self.activePage(pageNo);
            },500);
            return;
        }
        setTimeout(watch, 500);
    }
    watch();
};
TutorialVM.prototype.isVisible = function (selector) {
    selector = $(selector);
    if(!selector.length) return false;
    if (!selector.is(':visible')) return false;
    var parents = selector.parents('svg');
    if (parents.length) {
        return parents.eq(0).parent().is(':visible');
    }
    return true;
}

TutorialVM.prototype.addStartLinkToHelpMenu = function () {
    var self = this;
    if (!self.pageIsPossible(self.startingPage)) return;

    var helpMenu = $('#helpMenu ul > li:nth-child(3)');
    var newItem = helpMenu.clone();
    newItem.find('a')
        .attr({
            'href': '#',
            target: ''
        })
        .text('Start Tutorial')
        .click(function () {
            self.start();
            return false;
        });
    newItem.insertAfter(helpMenu);
};