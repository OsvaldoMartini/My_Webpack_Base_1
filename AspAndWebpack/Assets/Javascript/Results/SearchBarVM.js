var searchBarLoaded = false;
var SearchBarVM = function (search, options) {
    var self = this;
    options = $.extend(
        {
            allowAdvancedSearch: false,
            enableSearchBarAutoComplete: true,
            categoryMapping: "",
            allowGlobalSearch: false,
            redirect: false,
            dropdown: null
        },
        options || {}
    );
    self.search = search;
    self.redirect = options.redirect;
    self.maxSearchBars = 5;
    self.advancedPanel = null;

    self.categoryMapping = ko.observable(options.categoryMapping);
    self.categoryTitle = ko.observable();
    self.categoryUrl = ko.observable();
    self.categoryAutoComplete = ko.observable();
    self.isLoading = ko.observable(false);
    self.isVisible = ko.observable();
    self.allowAdvancedSearch = ko.observable(
        options.allowAdvancedSearch || false
    );
    self.searchCategory = ko.observable(
        self.allowAdvancedSearch() && !!options.categoryMapping
    );
    self.globalSearch = ko.observable();
    self.advancedSearch = ko.observable(false);
    self.advancedSearch_delayed = ko.observable(self.advancedSearch());
    self.searchBars = ko.observableArray();
    self.searchBar = ko.observable(self.addSearchBar(null, null, null, -1));
    self.newSearchText = ko.observable(""); // pending removal
    self.selectedZone = ko.observable(self.getDefaultZone());
    self.dropdownOptions = ko.observableArray(options.dropdown);

    self.allowGlobalSearch = ko.computed(function () {
        return (
            options.allowGlobalSearch ||
            (self.globalSearch() &&
                self.categoryMapping() &&
                self.globalSearch().toLowerCase() !==
                self.categoryMapping().toLowerCase()) ||
            false
        );
    });

    self.dropdown = ko.pureComputed({
        read: function () {
            if (self.dropdownOptions().length) return self.dropdownOptions();
            var dropdown = [];
            if (!self.allowGlobalSearch()) {
                return dropdown;
            }

            dropdown.push({
                key: self.categoryMapping(),
                value: self.categoryTitle()
            });
            if (self.globalSearch() == "janes") {
                dropdown.push({ key: "AllJanes", value: "All Janes" });
            }

            if (
                !self.selectedZone() ||
                !dropdown.filter(function (item) {
                    return item.key == self.selectedZone().key;
                }).length
            ) {
                self.selectedZone(dropdown[0]);
            }
            return dropdown;
        },
        write: function (value) {
            self.dropdownOptions(value);
        }
    });

    self.searchBar().searchText.subscribe(function (text) {
        self.searchBars()[self.advancedSearch() ? 1 : 0].searchText(text);
    });
    self.searchBar().operator.subscribe(function (operator) {
        self.searchBars()[self.advancedSearch() ? 1 : 0].operator(operator);
    });
    self.searchBar().filter.subscribe(function (filter) {
        self.searchBars()[self.advancedSearch() ? 1 : 0].filter(filter);
    });
    self.advancedSearch_delayed.subscribe(function (slideIn) {
        var mainSearchBar = self.searchBars()[slideIn ? 1 : 0];
        self
            .searchBar()
            .update(
            mainSearchBar.searchText(),
            mainSearchBar.operator(),
            mainSearchBar.filter()
            );
    });

    var settingAdvancedSearchDelay = null;
    self.advancedSearch.subscribe(function (shown) {
        if (shown) {
            if (self.searchBars().length < 2) {
                self.addSearchBar();
            }
            self.queryToSearchBars(self.searchBars()[0].searchText());
        }

        self.searchBars().forEach(function (bar, i) {
            if (i) {
                bar.enabled(!!shown);
            }
        });
        if (settingAdvancedSearchDelay)
            window.clearTimeout(settingAdvancedSearchDelay);
        settingAdvancedSearchDelay = window.setTimeout(function () {
            self.advancedSearch_delayed(shown);
        }, 500);
    });

    self.checkVisibility(options.showSearchBar);
    self.enableSearchBarAutoComplete = options.enableSearchBarAutoComplete;

    self.onFocus = function (self, e) {
        //flip
        var target = $(e.target).parents("form");
        if (target.find("input").width() > 100) {
            return;
        }

        flip(target, function (t) {
            t.addClass("active");
        });

        var removeActive = function (e) {
            if (!target.find(e.target).length) {
                flip(target, function (t) {
                    t.removeClass("active");
                });
                $(document).off("click", removeActive);
                $("*").off("focus", removeActive);
            }
        };

        $(document).on("click", removeActive);
        $("*").on("focus", removeActive);
    };

    self.applySearch = function (form) {
        var newQuery = self.calculateQuery();

        $('.ui-autocomplete-input', form || document).each(function (i, input) {
            var uiAutocomplete = $(input).data('uiAutocomplete');
            if (uiAutocomplete) {
                uiAutocomplete.close();
            }
        });
        if (self.selectedZone() && self.selectedZone().applySearch) {
            return self.selectedZone().applySearch(newQuery);
        }

        if (
            self.redirect ||
            (self.allowGlobalSearch() &&
                !self.searchCategory() &&
                (!self.selectedZone() ||
                    self.selectedZone().key !== self.categoryMapping()))
        ) {
            var tempSearch = new Search();

            tempSearch.setQueryValue(tempSearch.queryProperty.search, newQuery);
            tempSearch.setQueryValue(tempSearch.queryProperty.page, 1);

            var queryString = tempSearch.calculateQueryString();

            if (queryString.startsWith("&")) {
                queryString = queryString.substring(1);
            }

            var url = "search?" + queryString;

            var catMap = "";
            if (
                self.searchCategory() ||
                self.selectedZone().key === self.categoryMapping()
            ) {
                catMap = self.categoryMapping();
                url = (self.categoryUrl() || "search") + "?" + queryString;
            } else {
                catMap = self.globalSearch();
            }

            if (catMap) {
                var start = "/" + catMap + "/";
                if (url.substr(0, start.length).toLowerCase() !== start.toLowerCase())
                    url = start + url;
            }

            if (tempSearch.urlPrefix != undefined) {
                url = tempSearch.urlPrefix + url;
            }

            loadUrlWithRequestCancel(url);
        } else {
            self.search.setQueryValue(self.search.queryProperty.search, newQuery);
            self.search.setQueryValue(self.search.queryProperty.page, 1);

            self.search.updateResults(self.search.updateRequestSender.searchBar);
        }
        self.toggleAdvanced(null, null, false);
    };

    self.toggleAdvanced = function (s, e, direction) {
        if (direction === true || direction === false) {
            if (self.advancedSearch() === direction) return;
            self.advancedSearch(direction);
        } else {
            self.advancedSearch(!self.advancedSearch());
        }
        var slideIn = self.advancedSearch();
        var target = self.advancedPanel || (e ? $(e.currentTarget).next() : $('.advanced-search-box'));
        self.advancedPanel = target;
        flip(
            target,
            self.hideAdvancedBox.bind(self, slideIn, target),
            slideIn
                ? "transform .5s cubic-bezier(0.35, 0.78, 0.03, 1.6), z-index .1s linear .4s, opacity .1s ease-in .05s"
                : "transform .5s cubic-bezier(0.35, -0.6, 0.96, 0.16), z-index .1s linear .1s, opacity .1s ease-in .3s",
            {
                opacity: slideIn ? 0 : 1,
                zIndex: slideIn ? -1 : 100
            },
            {
                opacity: slideIn ? 1 : 0,
                zIndex: slideIn ? 100 : -1
            }
        );
        if (!slideIn) {
            self.searchBars()[0].searchText(self.calculateQuery(true));
        }
    };
    self.hideAdvancedBox = function (show, target) {
        target = target || $(".advanced-search-box");
        target.toggleClass("in", !!show);
    };

    self.search.registerPropertyChangedCallback(
        self.search.queryProperty.search,
        function (newValue) {
            self.setup();
        }
    );

    self.search.registerFinishedCallback(function () {
        self.setup();
    });

    self.search.registerPropertyChangedCallback(
        self.search.queryProperty.searchMode,
        function (newValue) {
            self.checkVisibility(newValue);
        }
    );

    self.setup();
};

SearchBarVM.prototype.setup = function () {
    var self = this;

    var query = decodeURI(
        self.search.getQueryValue(self.search.queryProperty.search, true) || ""
    );

    self.queryToSearchBars(query);

    if (self.searchBars().length === 0) {
        self.addSearchBar();
    }

    self.checkVisibility(
        self.searchMode[self.advancedSearch() ? "ADVANCED" : "NORMAL"]
    );

    self.hideAdvancedBox(self.advancedSearch());

    if (!self.searchBar().searchText()) {
        var mainSearchBar = self.searchBars()[0];
        mainSearchBar.searchText(self.calculateQuery(self.searchBars().length > 1));
        self
            .searchBar()
            .update(
            mainSearchBar.searchText(),
            mainSearchBar.operator(),
            mainSearchBar.filter()
            );
    }
    searchBarLoaded = true;
};
SearchBarVM.prototype.getDefaultZone = function () {
    var self = this;
    var searchZoneValue = { key: "All", value: "All" };
    var zoneSearchQueryValue = self.search.getQueryValue(
        self.search.queryProperty.zone
    );
    if (zoneSearchQueryValue) {
        var zoneSearchKeyValue = decodeURI(
            zoneSearchQueryValue.replace(/\+/g, "%20")
        ).split("|");
        var zoneSearchValue = zoneSearchKeyValue.pop();
        var zoneSearchKey = zoneSearchKeyValue.join("|");
        searchZoneValue = { key: zoneSearchKey, value: zoneSearchValue };
    }

    return searchZoneValue;
};
SearchBarVM.prototype.calculateQuery = function (full) {
    var self = this;
    var result = "";
    var len = self.searchBars().length;
    if (!full && !self.advancedSearch()) {
        return self.calculateQueryForSearchBar(
            self.searchBars()[0],
            true,
            false,
            false
        );
    }
    var parts = 0;
    for (var i = 1; i < len; i++) {
        var searchBar = self.searchBars()[i];
        var part = self.calculateQueryForSearchBar(searchBar, !result, false, true);
        result += part;
        if (part) parts++;
    }
    if (parts === 1 && !/\w+\(.*\)/.test(result))
        return result.substring(1, result.length - 1);
    return result;
};

SearchBarVM.prototype.calculateQueryForSearchBar = function (
    searchBar,
    ignoreOperator,
    ignoreFilter,
    wrapText
) {
    var result = "";
    var searchText = searchBar.searchText();

    if (searchText.length > 0) {
        if (!ignoreFilter) {
            var filter = searchBar.filter();
            result = String.format(filter.urlFormat, searchText);
        }

        if (result && wrapText) {
            //wrap the text and filter up in a search bar identifier
            result = String.format("[{0}]", result.replace(/^[\[]+|[\]]+$/g, ""));
        }

        if (!ignoreOperator) {
            var operator = searchBar.operator();
            result = String.format(operator.urlFormat, result);
        }
    }

    result = result.replace(/%/g,  "");
    return result;
};
SearchBarVM.prototype.queryToSearchBars = function (query) {
    var self = this;

    //self.searchBars([]);

    var bar = 1;
    var regexp = new RegExp(
        "(" +
        objectValues(self.booleanOperators)
            .map(function (op) {
                return op.urlString;
            })
            .join("|") +
        ")"
    );
    var filterTypes = objectValues(self.filters)
        .map(function (op) {
            return op.urlString;
        })
        .filter(function (op) {
            return op;
        })
        .join("|");
    var filterRegex = new RegExp(
        "(?:\\[?(?:(" +
        filterTypes +
        ")\\((.+)\\)|(.+))\\]|(?:(" +
        filterTypes +
        ")\\((.+)\\)|(.+)))"
    );
    var matches = query.split(regexp);
    var i = 0;
    var operator = self.booleanOperators.AND;
    while (i < matches.length) {
        if (i) {
            operator = self.getObjectByProperty(
                self.booleanOperators,
                "urlString",
                matches[i - 1]
            );
        }
        var parts = filterRegex.exec(matches[i]);
        var filterType = parts ? parts[1] || parts[4] : "";
        var value = parts ? parts[2] || parts[3] || parts[5] || parts[6] : "";

        var filter = filterType
            ? self.getObjectByProperty(self.filters, "urlString", filterType)
            : self.filters.FULL;

        if (self.searchBars().length > bar) {
            self.searchBars()[bar].update(value, operator, filter);
        } else {
            self.addSearchBar(value, operator, filter);
        }
        bar++;
        i += 2;
    }
    if (self.searchBars().length < bar) {
        self.searchBars.unshift(self.addSearchBar(null, null, null, -1));
    }
    while (self.searchBars().length > bar) {
        self.removeSearchBar(self.searchBars()[self.searchBars().length - 1]);
    }
};

SearchBarVM.prototype.getObjectByProperty = function (obj, property, value) {
    var result;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && obj[key][property] === value) {
            result = obj[key];
            break;
        }
    }

    return result;
};

SearchBarVM.prototype.clear = function () {
    var self = this;
    self.newSearchText("");
};

SearchBarVM.prototype.clearAll = function () {
    var self = this;
    self.searchBars([]);
    while (self.searchBars().length < (self.advancedSearch() ? 2 : 1)) {
        self.addSearchBar();
    }
};

SearchBarVM.prototype.removeSearchBar = function (searchBar) {
    var self = this;

    self.searchBars.remove(searchBar);
    while (self.searchBars().length < (self.advancedSearch() ? 2 : 1)) {
        self.addSearchBar();
    }
};
SearchBarVM.prototype.addSearchBar = function (text, operator, filter, index) {
    var self = this;
    if (self.searchBars().length >= self.maxSearchBars) {
        console.log("Maximum search bars reached!");
        return;
    }

    var filterList = objectValues(self.filters);
    var operatorList = objectValues(self.booleanOperators);
    var line = new SearchBarLineVM(
        (typeof text === "string" ? text : "") || "",
        operatorList.indexOf(operator) >= 0 ? operator : self.booleanOperators.AND,
        filterList.indexOf(filter) >= 0 ? filter : self.filters.FULL,
        operatorList,
        filterList
    );
    line.parent = self;
    if (index === undefined) self.searchBars.push(line);
    else if (index >= 0) self.searchBars.splice(index, 0, line);

    return line;
};

SearchBarVM.prototype.addAdditionalTerm = function () {
    var self = this;
    var line = self.addSearchBar();
    $("#" + line.id).focus();
};

SearchBarVM.prototype.checkVisibility = function (mode) {
    var self = this;

    if (mode === undefined || mode === null) {
        mode = self.search.getQueryValue(self.search.queryProperty.searchMode);
    }
    self.advancedSearch(mode === self.searchMode.ADVANCED);

    if (mode === true || mode === false) {
        self.isVisible(mode);
        return;
    }

    if (mode === undefined || mode === null) {
        self.isVisible(true);
    } else {
        self.isVisible(mode === self.searchMode.NORMAL);
    }
};

/**
 * Called once the enter key is pressed. Will cause a search submit.
 * @param {string} categoryMapping - The category map key that will be used for the search.
 */
/*SearchBarVM.prototype.enterClick = function (categoryMapping) {

    var self = this;

    //need to somehow mvvm this IF...
    var dropdown = $(".search-bar-dropdown");
    if (dropdown) {
        dropdown.css("display", "none");
    }

    self.applySearch(categoryMapping);
};*/

SearchBarVM.prototype.setZone = function (key, value) {
    var self = this;
    self.search.removeQueryValue(self.search.queryProperty.zone);

    if (key !== "All") {
        var zoneSearch = String.format("{0}|{1}", key, value);
        self.search.setQueryValue(self.search.queryProperty.zone, zoneSearch);
    }

    self.selectedZone(value);
};

SearchBarVM.prototype.autocompleteSource = function (request, response) {
    var self = ko.dataFor(this.element[0]);

    if (
        self.parent.selectedZone() &&
        self.parent.selectedZone().autocompleteSource
    ) {
        return self.parent.selectedZone().autocompleteSource(request, response);
    }
    var urlPath = self.parent.categoryAutoComplete();
    if (!urlPath) return;
    self.isLoading(true);
    var escapedQueryString = encodeURIComponent(request.term);
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: urlPath,
        data: JSON.stringify({
            prefixText: escapedQueryString,
            count: 10,
            context: ""
        }),
        dataType: "json",
        async: true,
        success: function (data) {
            self.isLoading(false);
            response(data);
        },
        error: function (result) {
            self.isLoading(false);
            //suppress the exception
        }
    });
};
SearchBarVM.prototype.autocompleteSelect = function (event, ui) {
    var self = ko.dataFor(this);
    if (
        self.parent.selectedZone() &&
        self.parent.selectedZone().autocompleteSelect
    ) {
        return self.parent.selectedZone().autocompleteSelect(event, ui);
    }
    ko.dataFor(this).searchText(ui.item.value);
    $(this)
        .closest("form")
        .submit();
};
SearchBarVM.prototype.switchSearchMode = function () {
    var self = this;

    self.search.setQueryValue(
        self.search.queryProperty.searchMode,
        self.searchMode.ADVANCED
    );
    self.search.updateHash();
};

SearchBarVM.prototype.toggleMode = function () {
    this.advancedSearch(!this.advancedSearch());
};
SearchBarVM.prototype.searchMode = {
    NORMAL: "normal",
    ADVANCED: "advanced"
};

SearchBarVM.prototype.booleanOperators = {
    AND: { label: "AND", urlString: "<and>", urlFormat: "<and>{0}" },
    OR: { label: "OR", urlString: "<or>", urlFormat: "<or>{0}" },
    NOT: { label: "NOT", urlString: "<not>", urlFormat: "<not>{0}" }
};

SearchBarVM.prototype.filters = {
    FULL: { label: "Full Text", urlString: "", urlFormat: "{0}" },
    TITLE: { label: "Title", urlString: "title", urlFormat: "title({0})" }
};

function SearchBarLineVM(
    defaultText,
    defaultOperator,
    defaultFilter,
    booleanOperators,
    filters
) {
    var self = this;
    self.parent = null;
    self.searchText = ko.observable(defaultText);
    self.operator = ko.observable(defaultOperator);
    self.filter = ko.observable(defaultFilter);
    self.booleanOperators = booleanOperators;
    self.filters = filters;

    self.isLoading = ko.observable(false);
    self.enabled = ko.observable(false);

    self.loaded = ko.observable(false);

    self.isDirty = ko.computed(function () {
        return !!self.searchText();
    });

    self.id = "SearchBarLineVM_" + (Math.random() + "").substr(2);

    self.visible = ko.observable(true);

    window.setTimeout(function () {
        self.loaded(true);
    });
    self.update = function (defaultText, defaultOperator, defaultFilter) {
        self.searchText(defaultText);
        self.operator(defaultOperator);
        self.filter(defaultFilter);
    };
}

ko.bindingHandlers.searchBarAutoComplete = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var self = viewModel;

        var options = valueAccessor();

        if (options.enableAutoComplete && $ && $.ui && $.ui.autocomplete) {
            $.ui.autocomplete.prototype._renderItem = function (ul, item) {
                item.label = item.label.replace(
                    new RegExp(
                        "(?![^&;]+;)(?!<[^<>]*)(" +
                        $.ui.autocomplete.escapeRegex(this.term) +
                        ")(?![^<>]*>)(?![^&;]+;)",
                        "gi"
                    ),
                    "<strong>$1</strong>"
                );
                ul.css({ position: "absolute", "z-index": 2000 });
                ul.addClass("search-bar-dropdown");

                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.label + "</a>")
                    .appendTo(ul);
            };
            var form = $(element).closest("form");
            $(element).autocomplete({
                messages: {
                    noResults: "",
                    results: function () { }
                },
                source: self.parent.autocompleteSource,
                minLength: options.chars || 3,
                select: self.parent.autocompleteSelect
            });
        }
    }
};

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

var targetTime = 0;
if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback) {
        var currentTime = +new Date;
        targetTime = Math.max(targetTime + 16, currentTime);
        var timeoutCb = function () { callback(+new Date); }
        return window.setTimeout(timeoutCb, targetTime - currentTime);
    };

function flip(target, action, transition, initialStyles, endStyles) {
    var first = target[0].getBoundingClientRect();
    action(target); //.addClass('active');
    var last = target[0].getBoundingClientRect();
    var deltaX = first.left - last.left;
    var deltaY = first.top - last.top;
    var deltaW = first.width / last.width;
    var deltaH = first.height / last.height;
    function matrix(w, h, x, y) {
        return "matrix(" + [w, 0, 0, h, x, y].join(",") + ")";
    }
    target.css(
        $.extend(
            {
                // position: 'absolute',
                transition: "",
                transformOrigin: "top left",
                transform: matrix(deltaW, deltaH, deltaX, deltaY)
            },
            initialStyles || {}
        )
    );

    transition = transition || "transform .1s linear";
    setTimeout(function () {
        requestAnimationFrame(function () {
            target.css(
                $.extend(
                    {
                        transform: "",
                        transition: transition
                    },
                    endStyles || {}
                )
            );
        });
    });

    // Capture the end with transitionend
    target[0].addEventListener("transitionend", function (event) {
        if (event.propertyName === "transform") {
            target.css(
                $.extend(
                    {
                        transition: "",
                        opacity: ""
                    },
                    Object.keys(endStyles || {}).reduce(function (obj, key) {
                        obj[key] = "";
                        return obj;
                    }, {})
                )
            );
        }
    });
}

var objectValues = function (obj) {
    var arr = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(obj[key]);
        }
    }

    return arr;
};

$(function () {
    setTimeout(function () {
        var bars = $(".with-search-bar.with-data-bind");
        bars.each(function (bar) {
            if (ko.dataFor(this)) return;
            if (window.searchBarVM === false) return;
            window.searchBarVM = window.searchBarVM || new SearchBarVM(new Search(), { redirect: true });
            ko.applyBindings(window, this);
        });
    }, 500);
});

function SearchBarSource() {
    var self = this;
}
