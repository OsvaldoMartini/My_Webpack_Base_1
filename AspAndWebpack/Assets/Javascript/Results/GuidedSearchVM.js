/**
 * A view model for a guided search.
 * @param {object} search - the search object
 * @param {object} resultsvm - the resultsvm object
 */
var GuidedSearchVM = function(search, resultsVM) {
    var self = this;
    self.search = search;
    self.resultsVM = resultsVM;
    self.showingGuidedSearch = ko.observable(false);
    /** The array of filters to show **/
    self.filters = ko.observableArray();
    self.alphabet = ko.observableArray(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]);
    self.showSingleList = ko.observable(false);
    //Flag to show filters have changed so need to reload when a user clicks the data.
    self.dataChanged = ko.observable(true);
    self.showDataTable = ko.observable(true);
    self.autoUpdate = ko.observable(true);
    self.loadingDataTable = ko.observable(false);
    self.justChangedFilter = ko.observable(false);
    self.lenses = ko.observableArray();
    self.currentLens = ko.observable();
    self.SelectLens = function(lens) {
        // if it is being turned off - set it to null
        self.currentLens(lens.selected() ? null : lens);
        _.each(self.lenses(), function(l) {
            l.selected(l === lens && !lens.selected());
        });
        _.map(self.filters(), function(f) {
            f.included(_.indexOf(this.filters, f.key) > -1 && this.selected());
            f.Visible(false);
        }, lens);
        // _.filter(self.filters(), function(f){return th}is.indexOf(f.name) > 0}, lens.filters)
    }
    self.allSegments = [{
        selected: ko.observable(true),
        key: "FUNCTIONALSEGMENT",
        text: "Function"
    }, {
        selected: ko.observable(false),
        key: "FORCESTRUCTURE",
        text: "Force Structure"
    }, {
        selected: ko.observable(false),
        key: "STD_COUNTRY",
        text: "Country"
    }, {
        selected: ko.observable(false),
        key: "STD_REGION",
        text: "Region"
    }, {
        selected: ko.observable(false),
        key: "PLATFORMTYPE",
        text: "Platform Type"
    }, {
        selected: ko.observable(false),
        key: "STD_SUPPLIER",
        text: "Supplier"
    }, {
        selected: ko.observable(false),
        key: "ITEMLIFECYCLEDESC",
        text: "Life Cycle Position"
    }, {
        selected: ko.observable(false),
        key: "USERORGGEN",
        text: "User Org Gen"
    }, {
        selected: ko.observable(false),
        key: "GOVERNMENT_PRIME",
        text: "Govt Prime"
    }, {
        selected: ko.observable(false),
        key: "PLATFORMFAMILYNAME",
        text: "Platform Family"
    }, {
        selected: ko.observable(false),
        key: "MANNED_UNMANNED",
        text: "Manned Unmanned"
    }, {
        selected: ko.observable(false),
        key: "PARENT_MARKET",
        text: "Technology"
    }, {
        selected: ko.observable(false),
        key: "ITEMPATH",
        text: "Item Path"
    }, {
        selected: ko.observable(false),
        key: "PRODUCTIONTYPE",
        text: "Production Type"
    }, {
        selected: ko.observable(false),
        key: "CTY_FINAL_ASSEMBLY",
        text: "Final Assembly Country"
    }, {
        selected: ko.observable(false),
        key: "FMS",
        text: "Foreign Military Sale"
    }, {
        selected: ko.observable(false),
        key: "SUBSYSTEM_SUPPLIER",
        text: "Subsystem Supplier"
    }, {
        selected: ko.observable(false),
        key: "PLATFORMTYPEDETAIL",
        text: "Platform Type Detail"
    }, {
        selected: ko.observable(false),
        key: "PLATFORMSPECIFIC",
        text: "Platofrm specific"
    }, {
        selected: ko.observable(false),
        key: "SUBSYSTEM_TYPE",
        text: "Subsystem Type"
    }, {
        selected: ko.observable(false),
        key: "BUYERORGGEN",
        text: "Buyer Org Gen"
    }, {
        selected: ko.observable(false),
        key: "BUYER_AGENCY",
        text: "Buyer Agency"
    }, {
        selected: ko.observable(false),
        key: "PROGRAMFAMILY",
        text: "Program Family"
    }];
    self.filteredSegments = ko.computed(function() {
        return _.filter(self.allSegments, function(el) {
            return self.currentLens() ? self.currentLens().segments.indexOf(el.key) > -1 : false;
        });
    });
    self.setCurrentSegment = function(segment) {
        _.each(self.allSegments, function(s) {
            s.selected(false);
        });
        segment.selected(true);
        self.resultsVM.gridChartVM.MarketSegment(segment);
        _.delay(function() {
            self.showChart(false);
        }, 200);
    }
    // self.lenses.push({name:"Markets",filters:["MARKET","STD_REGION"]});
    //used when clicking on the datatable.
    self.filtering = ko.observable(false);
    self.filterValue = ko.observable("");
    self.filter = function(segment) {
        var item = _.find(self.filterValue().filter.items(), function(f) {
            return f.value == self.filterValue().value;
        });
        if (item) {
            item.selected(true);
        } else {
            self.filterValue().filter.items.push({
                value: self.filterValue().value,
                selected: ko.observable(true)
            });
        }
        self.setCurrentSegment(segment);
    }
    self.isAnythingSelected = ko.computed(function() {
        return _.some(self.filters(), function(item) {
            return item.isAnythingSelected();
            //return _.some(item.items(), function(i){ return i.selected===true }) ;
        });
    });
    /**
    Apply any selected facets and hide the dialog
    **/
    self.showChart = function(hideGuided) {
        if (self.autoUpdate() && hideGuided) {
            self.HideGuidedSearch();
            return;
        }
        if (self.showDataTable()) {
            self.loadingDataTable(true);
        }
        var facetsVM = self.resultsVM.facetsVM;
        facetsVM.clearAppliedFacets();
        var facetsToAdd = [];
        facets = facetsVM.getFacetsFromSearch();
        _.each(self.filters(), function(elt) {
            _.each(_.filter(elt.items(), function(item) {
                return item.selected();
            }), function(val, idx, list) {
                facetsToAdd.push({
                    key: this.key,
                    value: val.value
                });
            }, elt);
        });
        for (var i = facetsToAdd.length - 1; i > -1; i--) {
            facetsVM.applyFacet(facetsToAdd[i].key, facetsToAdd[i].value, false, facets, i == 0 ? false : true);
        }
        if (hideGuided)
            self.HideGuidedSearch();
        // }, 350);
    }
    self.refineFurther = function(a, e) {
        var segment = self.resultsVM.gridChartVM.MarketSegment();
        var key = segment.key;
        var filter = _.find(self.filters(), function(f) {
            return f.key == key;
        });
        if (filter) {
            self.filtering(true);
            var obj = {
                filter: filter,
                value: a
            };
            self.filterValue(obj);
            var contextMenu = $("#segmentList");
            contextMenu.draggable({
                handle: ".modal-header"
            });
            //contextMenu.find("#chartContextTitle").text("Refine");
            // contextMenu.find("#topTenLabel").text("m");
            contextMenu.css({
                'z-index': 10000,
                left: e.pageX,
                top: e.pageY - 200
            });
            contextMenu.fadeIn(1500);
            return;
            self.showChart(false);
            var contextMenu = $("#segmentList");
            contextMenu.draggable({
                handle: ".modal-header"
            });
            //contextMenu.find("#chartContextTitle").text("Refine");
            // contextMenu.find("#topTenLabel").text("m");
            contextMenu.css({
                'z-index': 10000,
                left: e.pageX,
                top: e.pageY
            });
            contextMenu.fadeIn(1500);
            self.currentSegmentClicked = segment;
            return false;
        }
    }
    $(document).bind('ChartLoadedEvent', function(e) {
        if (self.showDataTable() == true) {
            var markup = $('.chartDataTable').html().replace(/\'/g, "");
            $('#GuidedDataTable').html(markup);
            $('#GuidedDataTable  a').removeAttr('onclick');
            $('#GuidedDataTable  a').on("click", function(clickevent) {
                self.refineFurther($(this).text(), clickevent);
            }).prepend("<i class=\"icon-search large\"></i>");
            ;self.loadingDataTable(false);
        }
    });
    $(document).bind('ChartUpdatingEvent', function(e) {
        if (self.showDataTable() == true) {
            //show datatable?
            self.loadingDataTable(true);
        }
    });
    self.clearAllSelected = function() {
        // shall we remove anything selected
        _.each(self.filters(), function(elt) {
            _.delay(function() {
                elt.clearSelected();
                elt.Visible(false);
            }, 100);
        });
        $('#GuidedDataTable').html("");
    }
    //filter has been changed
    self._addedFilter = function() {
        if (self.autoUpdate()) {
            _.delay(function() {
                self.showChart(false);
            }, 250);
            self.setJustChangedFilter();
        }
    }
    self.setJustChangedFilter = function() {
        self.justChangedFilter(true);
        _.delay(function() {
            self.justChangedFilter(false);
        }, 1000);
    }
    self.AddedFilter = _.debounce(self._addedFilter, 1000);
    self.RemovedFilter = function(filterVM) {
        if (self.autoUpdate()) {
            if (!filterVM.Visible()) {
                _.each(self.filters(), function(f) {
                    if (f.Visible()) {
                        f.Visible(false);
                        f.ToggleVisible();
                    }
                });
            }
            self.setJustChangedFilter();
            if (self.showDataTable()) {
                self.showChart(false);
            }
        }
    }
    var marketFilter = new GuidedSearchFilterVm(self,"MARKET","Market");
    self.filters.push(marketFilter);
    self.filters.push(new GuidedSearchFilterVm(self,"STD_REGION","Region"));
    self.filters.push(new GuidedSearchFilterVm(self,"STD_COUNTRY","Country"));
    self.filters.push(new GuidedSearchFilterVm(self,"FUNCTIONALSEGMENT","Functional Segment"));
    self.filters.push(new GuidedSearchFilterVm(self,"PLATFORMFAMILYNAME","Platform family"));
    self.filters.push(new GuidedSearchFilterVm(self,"PLATFORMTYPE","Platform type"));
    self.filters.push(new GuidedSearchFilterVm(self,"STD_SUPPLIER","Supplier"));
    self.filters.push(new GuidedSearchFilterVm(self,"USERORGGEN","User Org Gen"));
    self.filters.push(new GuidedSearchFilterVm(self,"ITEMPATH","Item Path"));
    self.filters.push(new GuidedSearchFilterVm(self,"PLATFORMTYPEDETAIL","Platform type detail"));
    self.filters.push(new GuidedSearchFilterVm(self,"SUBSYSTEM_SUPPLIER","Subsystem Supplier"));
    self.filters.push(new GuidedSearchFilterVm(self,"SUBSYSTEM_TYPE","Subsystem Type"));
    //self.filters.push(new GuidedSearchFilterVm(self,"ITEMFAMILY","Item Family"));
    //self.filters.push(new GuidedSearchFilterVm(self,"HOVERFAMILY","Hover Family"));
    self.filters.push(new GuidedSearchFilterVm(self,"FORCESTRUCTURE","Force Structure"));
    self.filters.push(new GuidedSearchFilterVm(self,"PROGRAMFAMILY","Program Family"));
    self.filters.push(new GuidedSearchFilterVm(self,"GOVTPRIME","Govt Prime"));
    //self.filters.push(new GuidedSearchFilterVm(self,"CODENAME","Codename"));
    //self.filters.push(new GuidedSearchFilterVm(self,"BUS_SEGMENT","Business segment"));
    //self.filters.push(new GuidedSearchFilterVm(self,"CTY_FINAL_ASSEMBLY","Cty Final Assembly"));
    self.filters.push(new GuidedSearchFilterVm(self,"PLATFORMSPECIFIC","Platform Specific"));
    //self.filters.push(new GuidedSearchFilterVm(self,"ANNUMBER","ANNUMBER"));
    //self.filters.push(new GuidedSearchFilterVm(self,"ITEMFIXEDSITEDETAIL","ITEMFIXEDSITEDETAIL"));
    //self.filters.push(new GuidedSearchFilterVm(self,"SUBSYSTEMDATA","SUBSYSTEMDATA"));
    //self.filters.push(new GuidedSearchFilterVm(self,"SOURCESDATA","SOURCESDATA"));
    //self.filters.push(new GuidedSearchFilterVm(self,"STAKEHOLDERDATA","STAKEHOLDERDATA"));
    //self.filters.push(new GuidedSearchFilterVm(self,"MANNED_UNMANNED","MANNED_UNMANNED"));
    //self.filters.push(new GuidedSearchFilterVm(self,"LEGACY_SUPPLIER","LEGACY_SUPPLIER"));
    self.filters.push(new GuidedSearchFilterVm(self,"BUYERORGGEN","BUYERORGGEN"));
    self.filters.push(new GuidedSearchFilterVm(self,"BUYER_AGENCY","BUYER_AGENCY"));
    //self.filters.push(new GuidedSearchFilterVm(self,"BUYER_ORG_SPEC","BUYER_ORG_SPEC"));
    //self.filters.push(new GuidedSearchFilterVm(self,"ENDUSERCOUNTRY","ENDUSERCOUNTRY"));
    self.filters.push(new GuidedSearchFilterVm(self,"USERTYPE","USERTYPE"));
    self.filters.push(new GuidedSearchFilterVm(self,"USER_ORG_SPEC","USER_ORG_SPEC"));
    //self.filters.push(new GuidedSearchFilterVm(self,"CONTRACTNO","CONTRACTNO"));
    self.filters.push(new GuidedSearchFilterVm(self,"CONTRACTTYPE","CONTRACTTYPE"));
    //self.filters.push(new GuidedSearchFilterVm(self,"FYDP_PEDS","FYDP_PEDS"));
    //self.filters.push(new GuidedSearchFilterVm(self,"FMS","FMS"));
    //self.filters.push(new GuidedSearchFilterVm(self,"RD_PROJECT_NO","RD_PROJECT_NO"));
    //self.filters.push(new GuidedSearchFilterVm(self,"PROCUREMENT_REF","PROCUREMENT_REF"));
    //self.filters.push(new GuidedSearchFilterVm(self,"RD_PE_NO","RD_PE_NO"));
    //self.filters.push(new GuidedSearchFilterVm(self,"WORKINGARRANGEMENT","WORKINGARRANGEMENT"));
    self.lenses.push({
        selected: ko.observable(false),
        name: "Markets",
        filters: ["MARKET", "STD_REGION", "STD_COUNTRY", "FUNCTIONALSEGMENT", "ITEM_PROGRAM"],
        segments: ["STD_COUNTRY", "FUNCTIONALSEGMENT", "STD_REGION", "USERORGGEN", "STD_SUPPLIER"]
    });
    self.lenses.push({
        selected: ko.observable(false),
        name: "Platforms",
        segments: ["PLATFORMTYPEDETAIL", "PLATFORMFAMILYNAME", "PLATFORMTYPE", "STD_SUPPLIER", "SUBSYSTEM_SUPPLIER", "SUBSYSTEM_TYPE", "PROGRAMFAMILY"],
        filters: ["PLATFORMTYPEDETAIL", "PLATFORMFAMILYNAME", "PLATFORMTYPE", "STD_SUPPLIER", "SUBSYSTEM_SUPPLIER", "SUBSYSTEM_TYPE", "PROGRAMFAMILY"]
    });
    self.lenses.push({
        selected: ko.observable(false),
        name: "Units",
        segments: ["STD_COUNTRY", "MARKET", "STD_REGION"],
        filters: ["STD_REGION", "PLATFORMTYPE"]
    });
    self.lenses.push({
        selected: ko.observable(false),
        name: "Customer",
        segments: ["STD_COUNTRY", "MARKET", "STD_REGION"],
        filters: ["PLATFORMFAMILYNAME", "MARKET"]
    });
    self.lenses.push({
        selected: ko.observable(false),
        name: "Companies",
        filters: ["PLATFORMFAMILYNAME", "PLATFORMTYPE"],
        segments: ["STD_COUNTRY", "MARKET", "STD_REGION"]
    });
    /**
     * Show the modal search dialog which contains the 
     * @returns {modal UI} 
     */
    self.ShowGuidedSearch = function() {
        self.showingGuidedSearch(true);
        $('#container').css("overflow", "none");
        $('#guidedSearchContainer').css({
            left: '0px',
            top: '0px',
            position: 'fixed',
            width: $(window).width(),
            height: $(window).height(),
            'z-index': 10000,
            'opactiy': '0.5',
            padding: '10px 10px 10px 10px'
        }).removeClass("hidden");
    }
    self.LoadData = function(filter, callback) {
        //var form = { facet: filter.key, query: 'f=STD_REGION(Europe)' };
        var form = {
            facet: filter.key,
            query: self.buildQuery()
        };
        var url = "facets/Expand?";

        var posting = $.post(url, form);
        posting.always(function(data) {
            if (data.TopLinks) {
                callback.call(this, data);
            } else {
                filter.loadingData(false);
            }
        });
    }
    self.buildQuery = function() {
        var query = "";
        var q = _.each(self.filters(), function(filter) {
            // if (filter.Visible())
            //{ 
            if (filter.selectedItems().length > 0) {
                if (query.length > 0)
                    query += "<and>";
                query += filter.key + "(" + _.pluck(filter.selectedItems(), 'value').join("||") + ")";
            }
            //}
            //else {
            // filter.items.remove(function(item) { return ! item.selected() });
            //}
        });
        //return _.some(item.items(), function(i){ return i.selected===true }) ;
        return "f=" + query;
    }
    self.HideGuidedSearch = function() {
        self.showingGuidedSearch(false);
        $('#guidedSearchContainer').addClass("hidden");
        return false;
    }
    self.UncheckVisibleFilters = function() {
        _.each(self.filters(), function(elt) {
            elt.Visible(false);
        });
    }
    $(window).resize(function() {
        if (self.showingGuidedSearch()) {
            self.ShowGuidedSearch();
        }
    });
    //set up the slider
    _.delay(function() {
        self.LoadData(marketFilter, marketFilter.UpdateData);
        $('#guidedSearchContainer .tipsyMe').tipsy({
            gravity: "n",
            delayIn: 200,
            delayOut: 200,
            fade: true,
            useCSS: false
        });
        // $('#guidedSearchContainer .tipsyMe')
    }, 1000);
}
/**
 * ************************************************ 
 * ************************************************ 
 * @param {} guidedSearchVM 
 * @param {} key 
 * @param {} name 
 * @returns {} 
 * ************************************************ 
 * ************************************************ 
**/
var GuidedSearchFilterVm = function(guidedSearchVM, key, name) {
    var self = this;
    self.included = ko.observable(false);
    self.GuidedSearchVM = guidedSearchVM;
    self.key = key;
    self.name = name;
    // The list of data
    self.items = ko.observableArray();
    self.items.extend({
        rateLimit: 100
    });
    self.updating = ko.observable(false);
    // The list of selected items
    self.Visible = ko.observable(false);
    self.ToggleVisible = function() {
        var newValue = !self.Visible();
        self.Visible(!self.Visible);
        self.GuidedSearchVM.UncheckVisibleFilters();
        self.Visible(newValue);
        if (newValue) {
            self.loadingData(true);
            var hash = self.getCurrentHash();
            if (sessionStorage[hash]) {
                self.UpdateData(JSON.parse(sessionStorage[hash]));
            } else {
                self.GuidedSearchVM.LoadData(self, self.UpdateData);
            }
        }
    }
    self.getCurrentHash = function() {
        return "CMP_GSK_" + self.key + self.GuidedSearchVM.buildQuery();
    }
    self.loadingData = ko.observable(false);
    self.UpdateData = function(data) {
        var hash = self.getCurrentHash();
        if (hash.split('<and>').length < 3) {
            sessionStorage[hash] = JSON.stringify(data);
        }
        self.items.remove(function(item) {
            return !item.selected();
        });
        _.each(_.keys(data.TopLinks), function(c) {
            self.items.push({
                value: c,
                selected: ko.observable(false)
            });
        });
        _.delay(function() {
            self.loadingData(false);
        }, 350);
    }
    self.selectedLetter = ko.observable("");
    self.setSelectedLetter = function(letter) {
        if (self.selectedLetter() === letter) {
            self.selectedLetter("");
        } else {
            self.selectedLetter(letter);
        }
    }
    self.removeFilter = function(selectedItem) {
        selectedItem.selected(false);
        self.GuidedSearchVM.RemovedFilter(self);
    }
    self.filtertext = ko.observable("");
    self.clearSelected = function() {
        if (self.selectedItems().length > 0) {
            _.each(self.selectedItems(), function(elt) {
                elt.selected(false);
            });
        }
    }
    self.selectedItems = function() {
        return _.filter(self.items(), function(elt) {
            return elt.selected() === true;
        });
    }
    ;
    self.isAnythingSelected = function() {
        return self.selectedItems().length > 0;
    }
    self.filteredItems = ko.computed(function() {
        return _.filter(self.items(), function(itemValue) {
            if (this.toString() != "" && self.filtertext().length > 0) {
                return itemValue.value.toLowerCase().includes(self.filtertext().toLowerCase()) && itemValue.value.toUpperCase().startsWith(this.toString()) && itemValue.selected() === false;
            } else if (this.toString() != "") {
                return (itemValue.value || "").toUpperCase().startsWith(this.toString()) && itemValue.selected() === false;
            } else {
                return (itemValue.value || "").toLowerCase().includes(self.filtertext().toLowerCase()) && itemValue.selected() === false;
            }
        }, self.selectedLetter());
    });
    // self.items(_.sortBy(self.items()));
}
