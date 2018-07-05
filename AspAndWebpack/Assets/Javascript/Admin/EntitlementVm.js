var EntitlementVm = function () {
    var self = this;

    self.loadEntitlements();
    self.loadPresets();
}

EntitlementVm.prototype.loadEntitlements = function () {
    var self = this;
    var count = 0;

    $('#entTable tr:not(.header, .headerSearch)').remove();

    $.ajax({
        url: "/Admin/Entitlement/GetEntitlementsList",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        cache: false
    }).done(function (data) {

        if (data && !data.hasEorror && data.length > 0) {
            $.each(data,
                function(i, item) {
                    $('#entTable').append('<tr>' +
                        '<td class="entName">' +
                        item.Name +
                        '</td>' +
                        '<td class="entDes">' +
                        item.Description +
                        '</td>' +
                        '<td class="entDep">' +
                        item.Dependency +
                        '</td>' +
                        '</tr>');

                    count++;
                });

            self.resetTableColumnWidth("entTable");
            self.updateStatus("statusEntitlements", "Fetched entitlements  Count " + count);
            self.updateLogs("Fetched entitlements  Count " + count);

            $('#entTable tr').click(function() {
                $(this).toggleClass('selected');
            });
        }
        else {
            var message = "Fetched entitlements failed.";

            if (data.ExceptionMessage) {
                var messageStatus = message + " See details in logs below.";
                self.updateStatus("statusEntitlements", messageStatus);
                var messagelog = message + "The error is: \n" + data.ExceptionMessage;
                self.updateLogs(messagelog);
            }
            else {
                message = "No entitlements fetched.";
                self.updateStatus("statusEntitlements", message);
                self.updateLogs(message);
            }
        }
    });
}

EntitlementVm.prototype.addEntitlement = function () {
    var self = this;
    var name = $('form #name').val();
    var dependency = $('form #dependancy').val();
    var jsonData = JSON.stringify({ "name": name, "dependency": dependency });

    if (name === "") {
        return;
    }

    if (self.existedInTable(0, name, "entTable") && self.existedInTable(2, dependency, "entTable")) {
        var message = "You have already have the entitlment: " +
            name.toUpperCase() +
            " with dependency " +
            dependency.toUpperCase();

        self.updateStatus("statusEntitlements", message);
        self.updateLogs(message);
        return;
    }

    $.ajax({
        url: "/Admin/Entitlement/AddEntitlement",
        type: 'POST',
        cache: false,
        contentType: 'application/json; charset=utf-8',
        data: jsonData
    }).done(function (data) {
        
        if (data && !data.hasError && data.length > 0) {
            $.each(data,
                function (i, item) {
                    var message = "Added entitlement " + item.Name + " with dependency " + item.Dependency;
                    self.updateLogs(message);
                });

            self.loadEntitlements();

            $('#entTable tr').click(function () {
                $(this).toggleClass('selected');
            });
        }
        else {
            var message = name + " with dependency " + dependency + " was not added to the system.";

            if (data.ExceptionMessage) {
                var messageStatus = message + " See details in logs below.";
                self.updateStatus("statusEntitlements", messageStatus);
                message = message + "The error is: \n" + data.ExceptionMessage;
                self.updateLogs(message);
            }
            else {
                self.updateStatus("statusEntitlements", message);
                message = message + " Perhaps " + name + " does not have a full name in the mocked category authorisation?";
                self.updateLogs(message);
            }
        }
    });

}

EntitlementVm.prototype.removeSelectedEntitlements = function () {
    var self = this;
    self.removeEntitlements($(".selected"));
    self.resetTableColumnWidth("entTable");
}

EntitlementVm.prototype.removeNonSelectedEntitlements = function() {
    var self = this;
    self.removeEntitlements($("tr").not('.selected, .header .headerSearch'));
    self.resetTableColumnWidth("entTable");
}

EntitlementVm.prototype.removeEntitlements = function (rows) {
    var self = this;
    var entsToRemove = [];

    $(rows).each(function () {
        var name = $(this).find('.entName').text();
        var dependency = $(this).find('.entDep').text();
        entsToRemove.push({ 'name': name, 'dependency': dependency });
    });

    if (entsToRemove.length === 0) {
        return;
    }

    $.ajax({
        url: "/Admin/Entitlement/RemoveEntitlement",
        type: 'POST',
        //cache: false,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ ents: entsToRemove })
    }).done(function (data) {

        if (data && !data.hasError && data.RemovedEntitlements.length > 0) {

            self.updateStatus("statusEntitlements", "Removed " + data.RemovedEntitlements.length + " entitlements. See details in logs.");

            $.each(data.RemovedEntitlements,
                function(i, item) {
                    var message = "Entitlement " + item.Name + " with dependency " + item.Dependency + " has removed";
                    self.updateLogs(message);
                }
            );

            self.loadEntitlements();
        }
        else {

            var message = "Removal of entitlements failed.";

            if (data.ExceptionMessage) {
                
                var messageStatus =  message + " See details in logs below.";
                self.updateStatus("statusEntitlements", messageStatus);
                var messageLog = message + "The error is: \n" + data.ExceptionMessage;
                self.updateLogs(messageLog);
            }
            else {
                
                self.updateStatus("statusEntitlements", message);
                message = message + " Perhaps " + name + " does not have a full name in the mocked category authorisation?";
                self.updateLogs(message);
            }
        }
        

    });
}

EntitlementVm.prototype.resetEntitlements = function () {
    var self = this;
    var count = 0;

    $('#entTable tr:not(.header, .headerSearch)').remove();

    $.ajax({
        url: "/Admin/Entitlement/ResetEntitlements",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        cache: false
    }).done(function (data) {

        if (data && !data.hasEorror && data.length > 0) {
            $.each(data,
                function (i, item) {
                    $('#entTable').append('<tr>' +
                        '<td class="entName">' +
                        item.Name +
                        '</td>' +
                        '<td class="entDes">' +
                        item.Description +
                        '</td>' +
                        '<td class="entDep">' +
                        item.Dependency +
                        '</td>' +
                        '</tr>');

                    count++;
                });

            self.updateStatus("statusEntitlements", "Fetched entitlements  Count " + count);
            self.updateLogs("Fetched entitlements  Count " + count);

            $('#entTable tr').click(function () {
                $(this).toggleClass('selected');
            });
        }
        else {
            var message = "Fetched entitlements failed.";

            if (data.ExceptionMessage) {
                var messageStatus = message + " See details in logs below.";
                self.updateStatus("statusEntitlements", messageStatus);
                var messagelog = message + "The error is: \n" + data.ExceptionMessage;
                self.updateLogs(messagelog);
            }
            else {
                message = "No entitlements fetched.";
                self.updateStatus("statusEntitlements", message);
                self.updateLogs(message);
            }
        }
    });
}

EntitlementVm.prototype.existedInTable = function (colNumber, searchText, tableId) {
    var table = document.getElementById(tableId);

    for (var r = 0, n = table.rows.length; r < n; r++) {

        var text = table.rows[r].cells[colNumber].innerHTML;

        if (text.toUpperCase() === searchText.toUpperCase()) {
            return true;
        }
    }

    return false;
}

EntitlementVm.prototype.searchTable = function(tableId) {
    var self = this;
    var table, tableheaderSearch, tr, i, j;

    table = document.getElementById(tableId);

    tableheaderSearch = table.getElementsByClassName("headerSearch")[0].children;
    tr = table.getElementsByTagName("tr");

    for (i = 2; i < tr.length; i++) {

        var display = true;

        for (j = 0; j < tableheaderSearch.length; j++) {

            var textInTd = tr[i].getElementsByTagName("td")[j];
            var textToSearch = tableheaderSearch[j].getElementsByTagName("input")[0].value;

            if (textInTd && textToSearch && textInTd.innerHTML.toUpperCase().indexOf(textToSearch.toUpperCase()) <= -1) {
                display = false;
                break;
            }
        }

        if (display) {
            tr[i].style.display = "";
        }
        else {
            tr[i].style.display = "none";
        }
    }
}

EntitlementVm.prototype.updateStatus = function(statusId, message) {
    var status = $('#' + statusId);
    status.val("");
    status.val(message);
}

EntitlementVm.prototype.updateLogs = function (message) {
    var self = this;
    var logsbox = $('#logs');
    var currentdate = new Date();
    var currentdatetime = currentdate.getDate().pad(2) + "/"
        + (currentdate.getMonth() + 1).pad(2) + "/"
        + currentdate.getFullYear() + "-"
        + currentdate.getHours().pad(2) + ":"
        + currentdate.getMinutes().pad(2) + ":"
        + currentdate.getSeconds().pad(2) + ": ";

    logsbox.val(logsbox.val().length !== 0 ? logsbox.val() + "\n" + currentdatetime + message : currentdatetime + message);
    logsbox.scrollTop(logsbox[0].scrollHeight);
}

EntitlementVm.prototype.clearTableSearch = function(data, event, tableId) {
    var self = this;
    var input = event.target.parentNode.getElementsByTagName("input")[0];

    input.value = "";
    self.searchTable(tableId);
}

EntitlementVm.prototype.clearLogs = function(data, event) {
    var input = event.target.parentNode.getElementsByTagName("textarea")[0];
    input.value = "";
}

EntitlementVm.prototype.resetTableColumnWidth = function(tableId) {
  
    var $table = $('#' + tableId);
    var $bodyRow = $table.find('tbody tr:first');
    var $bodyCells = $bodyRow.children();
    var colWidth;
    var scrollBarWidth;

    // Adjust the width of thead cells when window resizes
    $(window).resize(function () {
        // Get the tbody columns width array
        colWidth = $bodyCells.map(function () {
            return $(this).width();
        }).get();

        scrollBarWidth = $table.width() - $bodyRow.width();
        colWidth[colWidth.length - 1] = colWidth[colWidth.length - 1] + scrollBarWidth;

        // Set the width of thead columns
        $table.find('thead tr').each(function (i, x) {
            $(x).find('th').each(function(j, y) {
                $(y).width(colWidth[j]);
            });
        });
    }).resize(); // Trigger resize handler
}

EntitlementVm.prototype.switchTabs = function (tabId, event) {
    var i, tabcontent, tablinks, self = this;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabId).style.display = "block";
    event.currentTarget.className += " active";

    $("#statusTabs").val("");

    switch (tabId) {
        case "Presets":
            self.loadPresets();
            break;
        case "Category":
            break;
        case "Placeholder":
            break;
    } 

    self.resetTableColumnWidth(tabId);
}

EntitlementVm.prototype.loadPresets = function() {
    var self = this;
    var count = 0;

    $('#presetTable tr:not(.header, .headerSearch)').remove();

    $.ajax({
        url: "/Admin/Entitlement/GetPresetList",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        cache: false
    }).done(function (data) {

        if (data && !data.hasEorror && data.length > 0) {
            $.each(data,
                function(i, item) {
                    $('#presetTable').append(
                        '<tr data-key="' + item.Key + '" data-preset="' + item.Preset + '" data-label="' + item.Label + '">' +
                        '<td>'
                        + item.Label.toUpperCase() +
                        '</td>' +
                        '<td>' +
                        '<a href="#">Add</a>, <a href ="#">Remove</a>' +
                        '</td>' +
                        '</tr>');

                    count++;
                });

            self.resetTableColumnWidth("presetTable");
            self.updateStatus("statusTabs", "Fetched presets  Count " + count);
            self.updateLogs("Fetched presets  Count " + count);

            $('#presetTable').on('click',
                'a',
                function(event) {
                    event.preventDefault();
                    var tr = $(this).closest('tr');
                    self.applyPreset(tr.attr("data-key"), tr.attr("data-preset"), tr.attr("data-label"), $(this).html());
                });
        }
        else {
            var message = "Fetched presets failed.";

            if (data.ExceptionMessage) {
                var messageStatus = message + " See details in logs below.";
                self.updateStatus("statusTabs", messageStatus);
                var messagelog = message + "The error is: \n" + data.ExceptionMessage;
                self.updateLogs(messagelog);
            }
            else {
                message = "No presets fetched.";
                self.updateStatus("statusTabs", message);
                self.updateStatus(message);
            }
        }
    });
}

EntitlementVm.prototype.applyPreset = function (key, preset, label, action) {

    var jsonData = JSON.stringify({ Key: key, Preset: preset, Label: label });
    var url = "";
    var actionName = "";
    var self = this;

    switch(action) {
        case "Add":
            url = "/Admin/Entitlement/AddPreset";
            actionName = "added";
            break;
        case "Remove":
            url = "/Admin/Entitlement/RemovePreset";
            actionName = "removed";
            break;
    }

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        cache: false,
        data: jsonData
    }).done(function (data) {

        if (data && !data.hasEorror && data.length > 0) {

            self.loadEntitlements();
            self.updateStatus("statusTabs", "Presets " + data + " has been " + actionName + " successfully");
            self.updateLogs("Presets " + data + " has been " + actionName + " successfully");

        }
        else {
            var message = "Presets have " + actionName + " failed. ";

            if (data.ExceptionMessage) {
                var messageStatus = message + " See details in logs below.";
                self.updateStatus("statusTabs", messageStatus);
                var messagelog = message + "The error is: \n" + data.ExceptionMessage;
                self.updateLogs(messagelog);
            }
            else {
                message = "No presets " + actionName;
                self.updateStatus("statusTabs", message);
                self.updateStatus(message);
            }
        }
    });
}

Number.prototype.pad = function(number) {
    return (new Array(number + 1).join("0") + this).slice(-number);
}