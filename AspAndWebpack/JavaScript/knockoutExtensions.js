
/**
 * Opposite to the 'visible' binding.
 */
ko.bindingHandlers.hidden = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        ko.bindingHandlers.visible.update(element, function () { return !value; });
    }
};

/**
 * Stops knockout bindings from continuing down a specific dom tree path.
 */
ko.bindingHandlers.stopBindingChildren = {
    init: function () {
        return { controlsDescendantBindings: true };
    }
};

/**
 * Creates a clear button on html inputs.
 */
ko.bindingHandlers.inputClear = {
    init: function (element, valueAccessor) {

        var options = valueAccessor() || {};

        $(element).addClear({
            showOnLoad: options.showOnLoad || false,
            onClear: function () {
                //trigger the view model to update.
                $(element).change();
            }
        });
    }
};

/**
 * Same as the "html" binding, but will also apply the view model to the dynamic content.
 */
ko.bindingHandlers.dynamicHtml = {
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
        ko.applyBindingsToDescendants(bindingContext, element);
    }
};

/**
 * Adds a watermark to the input.
 */
ko.bindingHandlers.watermark = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var customOptions = valueAccessor();

        var options = { smallWidth: 1024, text: "Search" };
        $.extend(options, customOptions);

        var smallWatermark = (options.smallText || options.text);
        var largeWatermark = options.text;

        if (String.prototype.decodeHtmlEntities) {
            smallWatermark = smallWatermark.decodeHtmlEntities();
            largeWatermark = largeWatermark.decodeHtmlEntities();
        }

        function determinePlaceHolder() {
            var width = $(window).width();
            if (width < 1024) {
                $(element).attr("placeholder", smallWatermark);
            } else {
                $(element).attr("placeholder", largeWatermark);
            }
        };

        $(window).resize(function (event) {
            determinePlaceHolder();
        });

        determinePlaceHolder();
    }
};

/**
 * Invoked by pressing the enter key
 */
ko.bindingHandlers.enterkey = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

/**
 * Create a tipsy tooltip for the bound element and supplied arguments.
 */
ko.bindingHandlers.tipsy = {
    init: function (element, valueAccessor) {
        var options = valueAccessor();
        $(element).tipsy(options);
    }
};

ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {},
            $el = $(element);

        $el.datepicker(options);

        //handle the field changing by registering datepicker's changeDate event
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($el.datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $el.datepicker("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            $el = $(element);

        //handle date data coming via json from Microsoft
        if (String(value).indexOf('/Date(') == 0) {
            value = new Date(parseInt(value.replace(/\/Date\((.*?)\)\//gi, "$1")));
        }

        var current = $el.datepicker("getDate");

        if (value - current !== 0) {
            $el.datepicker("setDate", value);
        }
    }
};


ko.bindingHandlers.dateTimeView = {
  init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    var unwrap = ko.utils.unwrapObservable;
    var dataSource = valueAccessor();
    var binding = allBindingsAccessor();
    var format = 'ddd mmm dd yyyy';

    if (binding.dateTimeViewFormat) {
      format = binding.dateTimeViewFormat;
    }

    if (dataSource) {
      var stringResult = unwrap(dataSource).format(format);

      $(element).text(stringResult);
    }
    else
      $(element).text('');
  },
  update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    //update value based on a model change
    var unwrap = ko.utils.unwrapObservable;
    var dataSource = valueAccessor();
    var binding = allBindingsAccessor();
    var format = 'ddd mmm dd yyyy';

    if (binding.dateTimeViewFormat) {
      format = binding.dateTimeViewFormat;
    }

    var value = unwrap(dataSource),
          $el = $(element);

    if (String(value).indexOf('/Date(') == 0) {
      value = new Date(parseInt(value.replace(/\/Date\((.*?)\)\//gi, "$1")));
    }

    if (value instanceof Date && !isNaN(value.valueOf()) && dataSource) {
      var stringResult = unwrap(dataSource).format(format);

      $el.text(stringResult);
    }
    else
      $el.text('');
  }
};


ko.bindingHandlers.chosen = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext){
        var $element = $(element);
        var options = ko.unwrap(valueAccessor());
        
        if (typeof options === 'object')
            $element.chosen(options);
        else
            $element.chosen();
                
        ['options', 'selectedOptions', 'value'].forEach(function(propName){
            if (allBindings.has(propName)){
                var prop = allBindings.get(propName);
                if (ko.isObservable(prop)){
                    prop.subscribe(function(){
                        $element.trigger('chosen:updated');
                    });
                }
            }
        });        
    }
}

/********************************* EXTENDERS ************************************/

ko.extenders.numeric = function (target, options) {

    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target, //always return the original observables value
        write: function (newValue) {
            var current = target();

            var result = isNaN(newValue) ? 0 : parseFloat(+newValue);

            if (options.precision) {
                var roundingMultiplier = Math.pow(10, options.precision);
                result = Math.round(result * roundingMultiplier) / roundingMultiplier;
            }

            if (options.max && result > options.max) {
                result = options.max;
            }

            if (options.min && result < options.min) {
                result = options.min;
            }

            //only write if it changed
            if (result !== current) {
                target(result);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(result);
                }
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
};