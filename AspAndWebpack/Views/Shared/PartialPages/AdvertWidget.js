var AdvertWidget = function() {
    var self = this;
    self.advertSlot = null;
};


//Inherit from WidgetBase
if (typeof WidgetBase === 'function') {
    AdvertWidget.prototype = new WidgetBase();
}

AdvertWidget.prototype.onWidgetLoaded = function() {
    var self = this;
    //if this is a dashboard widget, update the settings
    var date = new Date();

    //Remember Javascript months are zero-based
    var utcDate = ('0' + date.getUTCDate()).slice(-2) +
        '/' +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) +
        '/' +
        date.getUTCFullYear();

    self.updateSettings("lastOpen", utcDate);
    googletag.pubads().refresh([self.advertSlot]);
};

AdvertWidget.prototype.onWidgetMoveStart = function(container) {
};

AdvertWidget.prototype.onWidgetMoveEnd = function(container) {
    var self = this;
    googletag.pubads().refresh([self.advertSlot]);
};