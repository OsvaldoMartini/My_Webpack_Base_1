/**
 * View model for saved searches, if proves to be generic enough we will promote it.
 */
var SavedSearchesVm = function() {
    var self = this;
    self.savedSearches = ko.observableArray([]);
    self.savedSearchesLoaded = ko.observable(false);
    // Merging Searches
    self.NewSearchName = ko.observable("New Name");
    self.KeepExistingSearches = ko.observable(true);
    self.Merging = ko.observable(false);
    self.isMerging = function () {
        var aa = _.filter(self.savedSearches(), function (savedSearch) {
            return savedSearch.Merging() === true;
        });
        var wasMerging = self.Merging();
        self.Merging(aa.length > 1);
        if (!wasMerging && self.Merging()) {
            self.NewSearchName(_.reduce(aa, function (m, yy, zz) {
                return m + aa[zz].Name + " ";
            }, ""));
        }
        // if showing, and no text in input
    };
    self.mergeSearches = function () {
        var selected = _.filter(self.savedSearches(), function (savedSearch) {
            return savedSearch.Merging() === true;
        });
        var keep = self.KeepExistingSearches();
        var isOrSearch = false; 
        var name = self.NewSearchName();
        if (name === "")
            return;
        var ids = (_.reduce(selected, function (m, yy, zz) {
            return m + (zz > 0 ? "," : "") + selected[zz].Id;
        }, ""));
        var _url = "MergeSearch?ids=" + ids;// + "&newName=abc&keepExisting=true&isOrSearch=true";
        _url += "&newName=" + self.NewSearchName();
        _url += "&keepExisting=" + keep;
        _url += "&isOrSearch=" + isOrSearch;
        //string newName, bool keepExisting, bool isOrSearch)
        // add the click details to refine on

        $.ajax({
            type: "GET",
            url: _url,
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                self.GetSavedSearches();
            }
        });
    };
    self.GetSavedSearches = function () {
       
        self.savedSearchesLoaded(false);
        $.ajax({
            type: "POST",
            url: "GetMySavedSearches",
            contentType: "application/json; charset=utf-8",
            success: function (msg) {
                self.Merging(false);
                self.savedSearches.removeAll();
                for (var i = 0; i < msg.length; i++) {
                    var ss = new SavedSearchVm(self);
                    ss.Name = msg[i].Name;
                    ss.Description = msg[i].Description;
                    ss.CreateDateTime = msg[i].Created;
                    ss.Id = msg[i].Id;
                    self.savedSearches.push(ss);
                }
                CMP.Utils.ActivityLog.log('SavedSearchesVM.js', 4, 1, "GetSavedSearches loaded:"); //4 = event.click, 1 info.
                ;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                ShowError("An error occurred. " + errorThrown);
            },
            complete: function () {
                self.savedSearchesLoaded(true);
            }
        });
    };
    self.AndOrDescriptionVisible = ko.observable(false);
    /**
     * Load a saved search based on its Id.
     * @param {} savedSearch 
     * @returns {} - reassigns the location.
     */
    self.loadSavedSearch = function (savedSearch) {
        CMP.Utils.ActivityLog.log('SavedSearchesVM.js', 4, 1, "id=" + savedSearch.Id); //4 = event.click, 1 info.
        location.assign("/MySavedSearches/ViewSearch?searchId=" + savedSearch.Id);
    };
    //called when user clicks 'My Saved Searches'
    self.CheckSavedSearchesLoaded = function() {
        if (self.savedSearches().length === 0) {
            self.GetSavedSearches();
        }
    };


    $('body').on('searchSaved', function () {
        CMP.Utils.ActivityLog.log('SavedSearchesVM.js', 4, 1, "searchSaved:"); //4 = event.click, 1 info.
        self.savedSearches([]);
    });
}
var SavedSearchVm = function(parent) {
    var self = this;
    self.parent = parent;
    self.Merging = ko.observable(false);
    self.ToggleMerging = function() {
        self.Merging(!self.Merging());
        self.parent.isMerging();
    };
}
