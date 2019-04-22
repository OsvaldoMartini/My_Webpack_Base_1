//initialize the knockout stuff
init();

//definition of the ViewModel:
function Greeter() {
    var _this = this;

    this.color = ko.observable('red');
    this.name = ko.observable('World');
    this.message = ko.observable('Hello');
    this.line = ko.computed(function () {
        return _this.message() + ' ' + _this.name() + '!';
    });
}

//create viewmodel
var vm = new Greeter();

//apply bindings
ko.applyBindings(vm);

//subscribe to change - add message when a 
//change of the view model occurs. Throttle
//it by 500ms:
ko.subscribe(vm, function (vm) {
    var $div = $('<div></div>').text(vm.line());
    $div.css({
        color: vm.color(),
        border: 'solid 3px ' + vm.color()
    });

    $('body').append($div);

    $div.fadeOut(2000);
}, 500);

//change it by hand:
vm.message('This is a ');
vm.name('Test Message');

//some arrays with data
var colors = ['red', 'green', 'purple', 'orange', '#F7A'];
var names = ['World', 'NSA', 'Kees', 'Earth', 'Moon', 'Visitor'];
var messages = ['Hello', 'Welkom', 'Goede morgen', 'Bye', 'Bazinga'];

//create a new random message every two seconds
window.setInterval(function () {
    
    //randomize the time it will show:
    var i = Math.floor(Math.random() * 10) * 1000;

    //show message
    window.setTimeout(function () {
        vm.color(colors[Math.floor(Math.random() * colors.length)]);
        vm.name(names[Math.floor(Math.random() * names.length)]);
        vm.message(messages[Math.floor(Math.random() * messages.length)]);
    }, i);
}, 1000);

//init function for readability
function init() {

    (function () {

        //stores the subscriptions
        var subscriptions = [];

        //maintains a unique identifier 
        var id = 0;

        ko.subscribe = function (vm, fnOnChange, throttle) {

            var myId = ++id;

            //store subscription - add throttle
            subscriptions.push({
                id: myId,
                change: _.throttle(function () {
                    fnOnChange(vm);
                }, throttle)
            });

            //subscripe model with id.
            _subscribe(vm, myId)
        };

        ko.unsubscribe = function (vm, fnOnChange) {
            _.remove(subscriptions, function (item) {
                return item.vm == vm && item.change == fnOnChange;
            });
        };

        function _subscribe(vm, id) {

            if (_.isArray(vm)) {

                //loop through array values and subscribe to each item
                for (var i = 0; i < vm.length; i++) {
                    _subscribe(vm[i], id);
                }
            } else {

                //prevent double subscriptions by checking
                //a 'magic' property:
                var subscriberId = '_ko_subscr_' + id;

                if (_.isUndefined(vm[subscriberId])) {

                    vm[subscriberId] = true;

                    //subscribe to each observable
                    for (var n in vm) {

                        var observable = vm[n];

                        if (ko.isObservable(observable) && !ko.isComputed(observable)) {

                            observable.subscribe(function (newValue) {

                                //subscribe the new observable value
                                _subscribe(newValue, id);

                                //fire event, because something just changed
                                fire(id);
                            });

                            //subscribe to current value stored by observable
                            var currentValue = observable();
                            _subscribe(currentValue, id);
                        }
                    }
                }
            }
        }

        function fire(id) {
            _.forEach(subscriptions, function (item) {
                if (item.id == id) {
                    item.change();
                }
            });
        }

    })();

    ko.isComputed = function (instance) {
        if ((instance === null) || (instance === undefined) || (instance.__ko_proto__ === undefined)) {
            return false;
        }

        if (instance.__ko_proto__ === ko.dependentObservable) {
            return true;
        }

        // Walk the prototype chain
        return ko.isComputed(instance.__ko_proto__);
    };
};