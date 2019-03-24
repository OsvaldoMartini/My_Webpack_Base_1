var ns = ns || {};

ns.ComplexObj = function (item) {
    var self = this;

    if (!item) {
        item = {};
    }

    self.id = item.Id || '';
    self.company = ko.observable(item.Company || '');
    self.email = ko.observable(item.Email || '');

    self.company.subscribe(function () {
        console.log('debug: company changed');
    });
    
    self.email.subscribe(function () {
        console.log('debug: email changed');
    });

    return self;
};

ns.mainvm = function () {
    var simpleObject = ko.observable('i am pretty simple');
    simpleObject.subscribe(function (newValue) {
        document.getElementById('simpleSubscribtionFeedback').innerText = newValue;
    });

    var complexObject = ko.observable(ns.ComplexObj());
    complexObject.subscribe(function (newValue) {
        // i would like to react to any change in complex object
        document.getElementById('complexSubscribtionFeedback').innerText = 'i dont get executed :(';
    });

    return {
        simpleObject: simpleObject,
        complexObject: complexObject
    };
};

var container = document.getElementById('wrapper');
if (container) {
    ko.applyBindings(ns.mainvm, container);
} else {
    console.warn("container for binding ko not found");
}