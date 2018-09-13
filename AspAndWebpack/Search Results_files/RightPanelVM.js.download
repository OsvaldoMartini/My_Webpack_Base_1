/**
* The view model controlling the right hand panels on the search page.
* @param {Search} search - The search object used for performing update requests.
*/
var RightPanelVM = function (search) {

    var self = this;
    self.search = search;
    
    self.panels = ko.observableArray([]);
};

RightPanelVM.prototype.setPanels = function (panels) {
    var self = this;

    for (var i = 0; i < panels.length; i++) {
        var linkPanel = panels[i];
        self.panels.push(new RightPanelItemVM("rightHandPanel_" + i, linkPanel.Text, linkPanel.CssClass, linkPanel.NavigateUrl));
    }

    self.search.registerFinishedCallback(function (result) {
        self.setup();
    });
};

/*
* Sets up the right hand panels.
*/
RightPanelVM.prototype.setup = function () {
    var self = this;

    if (self.panels() === undefined) {
        return;
    }

    for (var i = 0; i < self.panels().length; i++) {

        var panelItem = self.panels()[i];

        var currentHash = self.search.calculateQueryString();
        var sep = '?';
        if (panelItem.url.indexOf('?') > 0) {
            sep = '&';
        }

        var rpUrl = panelItem.url + sep + currentHash.replace(/[#?]/, "");

        $("#" + panelItem.id).webuiPopover('destroy');

        $("#" + panelItem.id).webuiPopover({
            type: 'async',
            url: rpUrl,
            width: 480,
            height: 400,
            closeable: true,
            title: panelItem.title,
            cache: false,
            placement: 'bottom-left'
        }).on('shown.webui.popover', function (e, $el) {
            $el.attr('tabindex', '-1').focus();
        });
    }
};

var RightPanelItemVM = function (id, title, icon, url) {
    var self = this;

    self.id = id;
    self.title = title;
    self.icon = icon;
    self.url = url;
};