var SimilarEquipmentVM = function (data) {

    var self = this;

    self.maxSelectable = 3;
    self.preselected = 0;

    var selected = [];
    for (var i = 0; i < data.length; i++) {
        var datum = data[i];
       
        if (datum.IsSelected) {
            selected.push(datum);
            self.preselected++;
            datum._isCheckable = ko.observable(true);
        }

        if (self.preselected >= self.maxSelectable && !datum.IsSelected) {
            datum._isCheckable = ko.observable(false);
        } else {
            datum._isCheckable = ko.observable(true);
        }
    }

    self.equipment = ko.observableArray(data || []);
    self.filterText = ko.observable("");
	self.selectedItems = ko.observableArray(selected);
	self.setMessageVisibility();

    self.filteredEquipment = ko.computed(function () {
        var filterText = self.filterText();

        if (filterText === undefined || filterText === null || filterText === "") {
            return self.equipment();
        }

        filterText = filterText.toLowerCase();

        var result = self.equipment()
            .filter(function (p) {
                return p.Title.toLowerCase().indexOf(filterText) !== -1;
            });

        return result;
    });

    self.calculateDocumentUrl = function (data) {
        return "/DefenceEquipment/Display/" + data.UniqueIdentifier + "?highlight=" + data.Title;
    };

    self.calculateSpecsUrl = function (data) {
        return "/Equipment/Specifications?uid=" + data.Uid + "&newTab=true";
    };

    self.calculateExplorerUrl = function (data) {
        var result;

        if (!data.IsFamily) {
            result = "/equipment/explore/" + data.Uid;
        } else {
            result = "/equipment/explore/" + data.FamilyRootId;
        }

        return result;
    };

    self.clearFilter = function () {
        var self = this;
        self.filterText("");
    };

    self.selectedItems.subscribe(function () {
        var items = self.equipment();

        var maxHit = self.maxSelectable - self.selectedItems().length === 0;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (self.selectedItems.indexOf(item) > -1 || !maxHit) {
                item._isCheckable(true);
            } else {
                item._isCheckable(false);
            }
		}

	    self.setMessageVisibility();
    });
    self.compare = function () {
        var self = this;

        var uids = [];
        var names = [];

        for (var i = 0; i < self.selectedItems().length; i++) {
            var item = self.selectedItems()[i];
            uids.push(item.Uid);
            names.push(item.Title);
        }

        var title = names.join(" vs ");

        window.showCustomPopup({
            title: title,
            contentUrl: "/Equipment/GetExplorerItemComparableContent",
            contentUrlData: {
                uids: uids
            },
            draggableOptions: {
                handle: ".modal-header"
            },
            expandable: {

            },
            modalOptions: {
                backdrop: false
            }
        });
    };
};

SimilarEquipmentVM.prototype.setMessageVisibility = function () {
	var self = this;

	if (self.selectedItems().length === 3) {
		$("#maximumWarning").removeClass("invisible").addClass("visible");
	} else {
		$("#maximumWarning").removeClass("visible").addClass("invisible");
	}
};
