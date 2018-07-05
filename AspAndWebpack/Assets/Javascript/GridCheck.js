// <copyright file="GridCheck.js" company="IHS">
// Copyright © 2011 IHS Inc. and its affiliated and subsidiary companies, all
// rights reserved. All other trademarks are the property of IHS Inc. and its 
// affiliated and subsidiary companies.
//
// This product, including software, data and documentation are licensed to the user 
// for its internal business purposes only and may not be disclosed, disseminated, 
// sold, licensed, copied, reproduced, translated or transferred to any third party.
//
// IHS Inc. 
// 15 Inverness Way East 
// Englewood, Colorado 80112
// USA 
// +1 303-736-3000
// </copyright>

/*The following variables are dynamically added from the code behind
_domain
_compileCategory
_gridId
_noSelectedWarning
_compileLimit
_compileLimitWarning
_compilePage
_compileAllPage
_hasCheckboxes
_totalItems
*/

function CheckAllNodes(checked) {
    $(_gridId + " .gridCheckbox input[type=checkbox]").prop('checked', checked);
}

// gets the ids of the selected rows in the grid constrained by compile limit setting
// constrainToCompileLimit can be left undefined, it defaults to false
function GetSelectedIds(constrainToCompileLimit) {
    if (constrainToCompileLimit == undefined) {
        constrainToCompileLimit = false;
    }

    var selectedIds = "";

    var ids = [];

    // Added in to fix bug DE30673 - will be reverted when the jqgrid has been cleaned again.
    $(_gridId).find("[data-itemid]").each(function (i, item) {

        if ($(item).is(':checked')) {
            var id = $(item).data("itemid");

            if (id !== undefined) {
                ids.push(id);
            }
        }
    });

    if (ids.length == 0) {
        // no items specifically ticked
    }
    else {
        if (constrainToCompileLimit && (ids.length > _compileLimit)) {
            ids = ids.slice(0, _compileLimit);
        }

        selectedIds = ids.join();
    }

    return selectedIds;
}

function btnExport_Click(exportAll) {
    // get the number of selected items
    // defaults to "all" if none specifically selected
    var selectedIds = "";

    if (typeof (exportAll) == "undefined") {
        exportAll = false;
    }

    if (!exportAll && _hasCheckboxes) {
        selectedIds = GetSelectedIds();
    }

    // this method is registered server side in the search results grid control
    CallServerForExport("COMPILEOREXPORT" + selectedIds, "");

    //stop the postback
    return false;
}

// btnExport_Click Callback - called from the server side control
function ReceiveServerExportData(arg, context) {



    // method located in the file Scripts.js
    open_export(arg, _totalItems);
}

function btnCompileAll_Click() {
    var response = true;
    if (_totalItems > _compileLimit) {
        response = confirm(_compileLimitWarning);
    }

    if (response) {
        // method located in the file Scripts.js
        open_compile(_compileAllPage, _domain, _compileCategory);
    }

    return false;
}

function btnCompile_Click() {
    var checkedCounter = $(_gridId + " .gridCheckbox input[type=checkbox]:checked").length;

    if (checkedCounter > 0) {
        var response = true;
        if (checkedCounter > _compileLimit) {
            response = confirm(_compileLimitWarning);
        }

        if (response == true) {
            // this method is registered server side in the search results grid control
            CallServerForCompile("COMPILEOREXPORT" + GetSelectedIds(true));
        }
    }
    else {
        alert(_noSelectedWarning);
    }

    return false;
}

// btnCompile_Click Callback - called from the server side control
function ReceiveServerCompileData(arg, context) {
    // method located in the file Scripts.js
    open_compile(_compilePage, _domain, _compileCategory, arg);
}


function GetSelectedUWIs() {
    var selectedIds = GetSelectedIds(false);
    var ids = selectedIds.split(",");
    var theGrid = $(_gridId);
    var cellContent;
    var data = "";

    for (i = 0; i < ids.length; i++) {
        cellContent = '';
        // find the correct id from the columns - try UWI first

        cellContent = theGrid.getCell(ids[i], "ODD_Reporting$WellID");

        if (!cellContent) {
            cellContent = theGrid.getCell(ids[i], "RigActivity_Reporting$UWI");
        }

        if (!cellContent) {
            cellContent = theGrid.getCell(ids[i], "License_Reporting$uwi");
        }

        if (cellContent.length > 0) {
            if (data.length > 0) {
                data = data + ","
            }

            data = data + cellContent;
        }
    }

    if (ids.length == 1) {
        // special case for drilling curves
        var hasCurve = theGrid.getCell(ids[0], "ODD_Reporting$HasCurveReport");
        if (hasCurve != "") {
            data = "hasCurve|" + data;
        }
    }



    return data;
}

function btnCreateRpt_Click(arg, context) {
    var haveCheckboxes = $(_gridId + " .gridCheckbox input[type=checkbox]").length;

    if (haveCheckboxes == 0) {
        // if no checkboxes but the button is available just open up the report window.
        open_window('CustomPages/IHSDrillingData/ChooseReports.aspx?itemCount=' + _totalItems, 700, 700, null, null);
    }
    else {
        var checkedCounter = $(_gridId + " .gridCheckbox input[type=checkbox]:checked").length;

        if (checkedCounter > 0) {
            var selectedIds = GetSelectedUWIs();
            if (selectedIds != "") {
                var qs = "";
                if (selectedIds.indexOf("hasCurve|") > -1) {
                    qs = "?hasCurve=true";
                    selectedIds = selectedIds.replace("hasCurve|", "");
                }

                Set_Cookie('Reports', selectedIds, 1, '/', '');
                open_window('CustomPages/IHSDrillingData/ChooseReports.aspx' + qs, 700, 700, null, null);
            }
            else {
                // no selected ids blank at this point means the report key column couldn't be found
                alert("Unable to create reports. No report key column in metadata.");
            }
        }
        else {
            alert(_noSelectedWarning);
        }
    }

    return false;
}

function btnCancel_Click(arg, context) {
    window.close();
}

function CheckboxFormatter(cellvalue, options, rowObject) {
    if (rowObject[0] == "0") {
        return "";
    }
    else {
        return "<input type='checkbox' value='false' data-itemid='" + rowObject[0] + "' offval='no'>";
    }
}