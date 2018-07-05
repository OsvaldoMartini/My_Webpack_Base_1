/**
 * Article View Model.
 * 
 * @class ArticleVM
 * @param {Object} Article data object.
 * @param {Object} knockout observable FilterTabVM object with filtering information.
 */
var ArticleVM = function (data, filter, filterlink) {
    var self = this;

    self.itemId = data.ItemId;
    self.headline = data.Title;
    self.description = data.Summary;
    self.eventDate = new Date(parseInt(data.Date.substr(6)));
    self.eventCountryFlat = data.EventCountry;
    self.eventCountry = data.EventCountry ? data.EventCountry.split('#') : [];
    self.flatTopics = data.FlatTopic;
    self.topics = self.flatTopics ? self.flatTopics.split('#') : [];
    self.pubabbrev = data.PubAbbrev;
    self.link = data.Link;
    self.articleType = data.ArticleType;
    self.isVisible = ko.computed(function () {
        return filter() == null || filter().name === 'All' ||
        this.articleType() === filter().name;
    }, this);
};

/**
 * Filter Tab View Model
 * 
 * @class FilterTabVM
 * @param {string} name Name of filter, used to filter Article on type.
 * @param {Object} knockout observable FilterTabVM containing the selected filter tab.
 */
var FilterTabVM = function (name, selected) {
    this.name = name;
    this.isSelected = ko.computed(function () { return this === selected(); }, this);
};

/**
 * Footer Link View Model
 * 
 * @class FooterLinkVM
 * @param {Object} link Link Object from server.
 */
var FooterLinkVM = function (link, subject) {
    var self = this;
    self.url = ko.computed(function(){
        if (link.NavigateUrl.indexOf('{0}') > -1) {
            return link.NavigateUrl.replace(/\{0\}/, subject);
        } else {
            return link.NavigateUrl;
        }
    });
    
    self.text = ko.observable(link.Text);
    self.target = ko.observable(link.Target);
    self.tooltip = ko.observable(link.ToolTip);
    self.authorised = ko.observable(link.IsAuthorised);
};



/**
 * Article List View Model
 * 
 * @param {string} url Base url to fetch data from.
 * @param {string} country Country to filter on.
 */
var ArticleListVM = function (url, country) {
    var self = this;
    self.articles = ko.observableArray([]);
    self.articleTypes = ko.observableArray([]);
    self.selectedFilter = ko.observable();
    self.baseurl = url;
    self.filterCountry = ko.observable(country);
    self.filterDays = ko.observable();
    self.filterLink = Dashboard.dashboardVM.commands.baseUrl;
    self.footerLinks = ko.observableArray([]);
    self.url = function (country) {
        var url = self.baseurl;
        var join = '?';
        if (url.indexOf('?') > 0) {
            join = '&';
        }

        if (country) {
            url += join + 'country=' + country;
            join = '&';
        }

        var days = self.filterDays();
        if (days) {
            url += join + 'days=' + days;
        }

        return url;
    };

    self.countryLink = function (subject) {
        return self.filterLink.replace(/\{0\}/, subject);
    };

    self.isLoading = ko.observable(false);

    var ajaxRequest;
    var cancelLastRequest = function () {
        if (ajaxRequest && ajaxRequest.abort) ajaxRequest.abort();
    };
    
    var updateContent = function (subject) {
        self.isLoading(true);
        cancelLastRequest();
        ajaxRequest = $.ajax({
            dataType: 'json',
            url: self.url(subject),
            success: function (data) {
                var mappedArticles = [];
                var content = data.Content;
                for (var i = 0, _i = content.length; i < _i; i++) {
                    var item = content[i];
                    mappedArticles.push(new ArticleVM(item, self.selectedFilter, self.filterLink));
                }

                self.articles(mappedArticles);

                var footerLinks = [];
                var links = data.FooterLinks;
                for (var i = 0, _i = links.length; i < _i; i++) {
                    footerLinks.push(new FooterLinkVM(links[i], subject));
                }
                self.footerLinks(footerLinks);

                self.isLoading(false);
            },
            error: function (msg) {
                self.isLoading(false);
                console.warn(msg);
            }
        });
    };
    self.filterCountry.subscribe(updateContent);

    self.updateCountry = function (country) {
        Dashboard.dashboardVM.currentItem(country);
    };

    updateContent(country);
};

if (typeof WidgetBase === 'function') {
    ArticleListVM.prototype = new WidgetBase();
}

ArticleListVM.prototype.onSubjectChange = function (subject) {
    var self = this;
    var country = subject || '';
    self.filterCountry(country);
};
