var CustomViewVM = function () {
    var containerId;
    // Cache container for faster jquery selecting
    var $container;

    var setup = function (containerID) {
        containerId = containerID;
        $container = $("#" + containerId);

        //  Initialise sortable 
        $container.find(".sortable").sortable({
            handle: "i",
            items: "div:not(#toggleSwitch)"
        });

        // Initialise checkbox checkall
        $container.find(":checkbox[name=tickAll]").click(function () {
            var name = $(this).attr("toToggle");
            $(":checkbox[name=" + name + "]").not("[disabled]").prop("checked", this.checked);
        });

        // This is required in case the user clicks off the modal and there is not opportunity to re-render template list
        $(".remove-template").on("click", function () {
            var templateName = $.trim($(this).closest("td").closest("tr").find(".template-name").text());
            if (templateName.length > 0) {
                var $templates = $("#user-grid-views");
                $templates.find("#template-" + templateName.replace(/ /g, "_")).hide();
            }
        });
    }

    var columnChecked = function (checkBox, isSorts) {
        if (checkBox.checked) {
            if (isSorts) {
                $(checkBox).siblings("select").removeProp('disabled');
            }
        } else {
            if (isSorts) {
                $(checkBox).siblings("select").prop('disabled', "disabled");
            }
        }
    }

    var rebindPaginationKo = function () {
        var $el = $("[data-bind='with: paginationVM']")[0];
        var vm = ko.dataFor($el);
        if (vm) {
            ko.cleanNode($el);
            ko.applyBindings(vm, $el);
        }
    }

    var showHelp = function (type) {
        // Hide Restore Defaults (Unless the Manage Custom Views tab is explicitly being viewed)
        $container.find(".restore-defaults").removeClass("in");
        if (type === "display" || type === "export") {
            $container.find(".sortTabDescription").hide();
            $container.find(".displayTabDescription").show();
            $container.find(".manageTabDescription").hide();
        } else if (type === "sort") {
            $container.find(".sortTabDescription").show();
            $container.find(".displayTabDescription").hide();
            $container.find(".manageTabDescription").hide();
        } else if (type === "manage") {
            $container.find(".sortTabDescription").hide();
            $container.find(".displayTabDescription").hide();
            $container.find(".manageTabDescription").show();
            // We only want to show this button when the user is viewing the Manage Views panel.
            $container.find(".restore-defaults").addClass("fade in");
        } else {
            $container.find(".sortTabDescription").hide();
            $container.find(".displayTabDescription").hide();
            $container.find(".manageTabDescription").hide();
        }
    }

    var showManageTab = function () {
        // This can be cleaned up...
        $container.find(".nav-tabs>li.active").removeClass("active");
        $container.find("div.modal-scroll>div").removeClass("in active");
        $container.find("#manageViewsTab").addClass("active");
        $container.find(".manage-view-tab").addClass("in active");
        showHelp("manage");
    }
    var showLoading = function () {
        $container.find(".loadingContainer").show();
        $container.find("form").hide();
    }
    var hideLoading = function () {
        $container.find(".loadingContainer").hide();
        $container.find("form").show();
    }
    var callBack = function (closeModal) {
        rebindPaginationKo();
        hideLoading();
        if (closeModal) {
            window.closePopup();
        } else {
            showManageTab();
        }
    }

    return {
        Setup: setup,
        ShowHelp: showHelp,
        ShowLoading: showLoading,
        CallBack: callBack,
        ColumnChecked: columnChecked
    }
}();