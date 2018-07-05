﻿/**
 * Creates a unique id
 */
ko.bindingHandlers.uniqueId = {
    init: function (element) {
        element.id =
            ko.bindingHandlers.uniqueId.prefix +
            ++ko.bindingHandlers.uniqueId.counter;
    },
    counter: 0,
    prefix: "unique"
};

/**
 * Creates a unique for before or after the last unique id
 * e.g. <label data-bind="uniqueFor: 'before'"></label>
 *      <input data-bind="uniqueId: true">
 *      <label data-bind="uniqueFor: 'after'"></label>
 */
ko.bindingHandlers.uniqueFor = {
    init: function (element, valueAccessor) {
        var after =
            ko.bindingHandlers.uniqueId.counter +
            (ko.utils.unwrapObservable(valueAccessor()) === "after" ? 0 : 1);
        element.setAttribute("for", ko.bindingHandlers.uniqueId.prefix + after);
    }
};

ko.bindingHandlers.closeOnClick = {
    init: function (element, valueAccessor) {
        var options = $.extend(
            {
                /* Whether or not to hide the element if the element itself was clicked. */
                includeSelf: false
            },
            valueAccessor() || {}
        );

        var $elem = $(element);
        $(window).click(function () {
            $elem.hide();
        });

        $elem.click(function (evt) {
            if (options.includeSelf) {
                $elem.hide();
            }

            evt.stopPropagation();
        });
    }
};

/**
 * Creates a unique for before or after the last unique id
 * e.g. <label data-bind="uniqueRef: {before:1,ref:'for'}"></label>
 *      <input data-bind="uniqueId: true">
 *      <label data-bind="uniqueFor:  {after:1,ref:'for'}"></label>
 */
ko.bindingHandlers.uniqueRef = {
    init: function (element, valueAccessor) {
        var value = valueAccessor() || {};
        function handler(value) {
            var isAfter = ko.utils.unwrapObservable(value.after);
            var attr = ko.utils.unwrapObservable(value.ref) || "for";
            var prefix = ko.utils.unwrapObservable(value.prefix) || "";
            var after = ko.bindingHandlers.uniqueId.counter + (isAfter ? 0 : 1);
            element.setAttribute(
                attr,
                prefix + ko.bindingHandlers.uniqueId.prefix + after
            );
        }
        if (Array.isArray(value)) {
            value.forEach(handler);
        } else {
            handler(value);
        }
    }
};

/**
 * Opposite to the 'visible' binding.
 */
ko.bindingHandlers.hidden = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        ko.bindingHandlers.visible.update(element, function () {
            return !value;
        });
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

ko.bindingHandlers.draggable = {
    init: function (element, valueAccessor) {
        var options = valueAccessor();
        $(element).draggable(options);
    }
};

ko.bindingHandlers.modal = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        var options = value.options;

        if (options.show === undefined) {
            options.show = false;
        }

        var show = value.show;

        $(element).modal(options);

        if (show !== undefined) {
            if (ko.isObservable(show)) {
                $(element).on("hide.bs.modal", function () {
                    show(false);
                });
            }
        }
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();

        var show = value.show;
        var options = value.options;
        options.show = ko.utils.unwrapObservable(show);

        $(element).modal(options);
    }
};

/**
 * Same as the "html" binding, but will also apply the view model to the dynamic content.
 */
ko.bindingHandlers.dynamicHtml = {
    init: function () {
        return { controlsDescendantBindings: true };
    },
    update: function (
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
    ) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
        ko.applyBindingsToDescendants(bindingContext, element);
    }
};

/**
 * Invoked by pressing the enter key
 */
ko.bindingHandlers.iviewer = {
    init: function (element, valueAccessor, allBindings) {
        var container = $(element);

        var customOptions = valueAccessor();
        customOptions = ko.unwrap(customOptions);

        var options = { image: "", method: "loadImage" };
        $.extend(options, customOptions);

        container.iviewer({
            src: options.image,
            zoom: 100,
            zoom_min: 10,
            onFinishLoad: function () {
                container.iviewer("fit");
                container.iviewer("update");
            }
        });
    },
    update: function (element, valueAccessor) {
        var container = $(element);

        var customOptions = valueAccessor();
        customOptions = ko.unwrap(customOptions);

        var options = { image: "", method: "loadImage" };
        $.extend(options, customOptions);

        if (options.image && options.image.length > 0) {
            container.iviewer("loadImage", options.image);
            container.iviewer("fit");
            container.iviewer("update");
        }
    }
};

/**
 * Invoked by pressing the enter key
 */
ko.bindingHandlers.watermark = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var customOptions = valueAccessor();

        var options = { smallWidth: 1024, text: "Search" };
        $.extend(options, customOptions);

        var smallWatermark = options.smallText || options.text;
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
        }

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
            var keyCode = event.which ? event.which : event.keyCode;
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
        var options = $.extend(
            {},
            { aria: true, trigger: ["hover", "focus"] },
            valueAccessor()
        );
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
        if (String(value).indexOf("/Date(") == 0) {
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
        var format = "ddd mmm dd yyyy";

        if (binding.dateTimeViewFormat) {
            format = binding.dateTimeViewFormat;
        }

        try {
            if (dataSource) {
                var value = unwrap(dataSource);
                if (String(value).indexOf("/Date(") == 0) {
                    value = new Date(
                        parseInt(value.replace(/\/Date\((.*?)\)\//gi, "$1"))
                    );
                }
                if (value instanceof Date && !isNaN(value.valueOf()) && dataSource) {
                    var stringResult = value.format(format);

                    $(element).text(stringResult);
                } else $(element).text("");
            } else $(element).text("");
        } catch (err) {
            $(element).text("");
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        //update value based on a model change
        var unwrap = ko.utils.unwrapObservable;
        var dataSource = valueAccessor();
        var binding = allBindingsAccessor();
        var format = "ddd mmm dd yyyy";

        if (binding.dateTimeViewFormat) {
            format = binding.dateTimeViewFormat;
        }

        var value = unwrap(dataSource),
            $el = $(element);

        try {
            if (String(value).indexOf("/Date(") == 0) {
                value = new Date(parseInt(value.replace(/\/Date\((.*?)\)\//gi, "$1")));
            }

            if (value instanceof Date && !isNaN(value.valueOf())) {
                var stringResult = value.format(format);

                $el.text(stringResult);
            } else {
                $el.text("");
            }
        } catch (err) {
            $(element).text("");
        }
    }
};

ko.bindingHandlers.chosen = {
    init: function (
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
    ) {
        var $element = $(element);
        var options = ko.unwrap(valueAccessor());

        if (typeof options === "object") $element.chosen(options);
        else $element.chosen();

        if (allBindings.has("enable")) {
            var prop = allBindings.get("enable");
            if (ko.isObservable(prop)) {
                prop.subscribe(function (newValue) {
                    $element.prop("disabled", !newValue);
                });
                $element.prop("disabled", !prop()).trigger("chosen:updated");
            }
        }

        if (allBindings.has("disable")) {
            var prop = allBindings.get("disable");
            if (ko.isObservable(prop)) {
                prop.subscribe(function (newValue) {
                    $element.prop("disabled", newValue).trigger("chosen:updated");
                });
                $element.prop("disabled", prop()).trigger("chosen:updated");
            }
        }

        ["options", "selectedOptions", "value"].forEach(function (propName) {
            if (allBindings.has(propName)) {
                var prop = allBindings.get(propName);
                if (ko.isObservable(prop)) {
                    prop.subscribe(function () {
                        $element.trigger("chosen:updated");
                    });
                }
            }
        });
    }
};
ko.bindingHandlers.slider = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().sliderOptions || {};
        options = $.extend({}, options, {
            classes: {
                "ui-slider": "form-control",
                "ui-slider-handle": "",
                "ui-slider-range": ""
            }
        });
        $(element).slider(options);
        ko.utils.registerEventHandler(element, "slidechange", function (event, ui) {
            var observable = valueAccessor();
            observable(ui.values || ui.value);
        });
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).slider("destroy");
        });
        ko.utils.registerEventHandler(element, "slide", function (event, ui) {
            var observable = valueAccessor();
            observable(ui.values || ui.value);
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var valueType = "value";
        if ($.isArray(value)) {
            valueType = "values";
            value = [+value[0] || 0, +value[1] || 0];
        } else {
            value = +value[0] || 0;
        }

        var $el = $(element);
        // DE87237 - Below prevents DOM/UI from being updated if the value has not changed.
        if ($el.slider(valueType).toString() === value.toString()) {
            return false;
        }
        $el.slider(valueType, value);
    }
};

ko.bindingHandlers.scrollbar = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = valueAccessor() || {};
        options = $.extend({}, { theme: "dark" }, options);
        customScrollbar(element, options);
    }
};

ko.bindingHandlers.tabbable = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var tabIndex = ko.utils.unwrapObservable(valueAccessor()) ? 0 : -1;
        element.setAttribute("tabindex", tabIndex);
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var tabIndex = ko.utils.unwrapObservable(valueAccessor()) ? 0 : -1;
        element.setAttribute("tabindex", tabIndex);
    }
};

ko.bindingHandlers.toggleClick = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();

        ko.utils.registerEventHandler(element, "click", function () {
            value(!value());
            return false;
        });
    }
};

/**
 * Disable dropdown from closing when clicking on child element
 */
ko.bindingHandlers.interactiveDropdown = {
    init: function (element) {
        var $el = $(element);
        if (!$el.is(".dropdown")) {
            $el = $el.parents(".dropdown").first();
        }
        if (!$el.length) return;

        ko.utils.registerEventHandler(element, "click", function () {
            $el.off("hide.bs.dropdown").on("hide.bs.dropdown", function (e) {
                e.preventDefault();
                $el.off("hide.bs.dropdown");
            });
            return true;
        });
    }
};

// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
ko.bindingHandlers.fadeVisible = {
    init: function (element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function (element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};

ko.bindingHandlers.popover = {
    init: function (
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
    ) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (!value) return;
        var options = ko.toJS(value);
        if (typeof value.content === "function") {
            options.content = value.content;
        }

        $(element).webuiPopover(options);
    }
};

/********************************* EXTENDERS ************************************/

ko.extenders.numeric = function (target, options) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko
        .pureComputed({
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
        })
        .extend({ notify: "always" });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
};
