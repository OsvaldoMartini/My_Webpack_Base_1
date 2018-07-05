window.Explorer = window.Explorer || {};

/**
 * A function view model to handle changes within a results view.
 * @param {Object} options - Additional options.
 */
Explorer.ExplorerVM = function (options) {
    var self = this;

    self.gridClosed = ko.observable(false);

    self.options = $.extend({
        category : "",
        tree: {
            containerId: undefined,
            category : "",
            rootId: undefined,
            analytics: {
                category: "Explorer",
                nodeSelected: "Node Selected"
            }
        }
    }, options);

    var search = new Search({
        serviceUrl: "/" + self.options.category + "/getResults?",
        queryString: "f=familyrootid(" + self.options.tree.rootId + ")"
    });

    self.treeVM = new Explorer.TreeVM(self.options.tree);
    self.sortVM = new SortVM(search);
    self.gridVM = new GridVM(search);
    self.commandsVM = new CommandsVM(search,
        {
            selectedRecordsFn: self.gridVM.selectedRecords,
            commandsType: 'grid',
            category: self.options.category
        });

	search.registerFinishedCallback(function () {
		setTimeout(function() {
			self.gridClosed(true);
		}, 1000);	
	});

	search.submit();
};

Explorer.ExplorerVM.prototype.closePage = function () {
    window.close();
};