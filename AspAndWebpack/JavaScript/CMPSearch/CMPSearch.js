/** Global Namespace  for the CMP.Search object and its allies really**/
var CMP = CMP || {}

    /** The JS equiv of a IHS.Core.Catalog.Model?.Search - kinda  **/
    CMP.Search = function Search(searchName) {
        this.SearchName = searchName;
        this.Sorts = [];
        this.SelectedIndexers = [];
    }

    /** Searches Nested Constraints   **/
    CMP.Constraint = function Constraint(AttributeKey, value, constraintType) {
        this.Constraints = [];
        // range constraints also have the min and max value as part of there constraint identifier
        if (AttributeKey.indexOf("=") > -1) {
            this.AttributeKey = AttributeKey.substr(0,AttributeKey.indexOf("="));
        }
        else {
            this.AttributeKey = AttributeKey;
        }
        this.Identifier = AttributeKey;
        this.Value = value;
        this.Type = constraintType;
    }

    /** Search.Sorts  **/
    CMP.Sort = function Sort(attributeKey, isAscending) {
        this.AttributeKey = attributeKey;
        this.isAscending = isAscending;
        this.SortDirection = (isAscending ? "Ascending" : "Descending");
    }

    /** Helper to get the json rep of the search object**/
    CMP.GetJSONString = function (srch) {
        return '{"jsonSearch":"' + JSON.stringify(srch).replace(/"/gi, "'") + '"}';
    }


    /** Methods for the search object  **/
    CMP.Constraint.prototype.AddConstraint = function (constraint) { this.Constraints.push(constraint); }
    CMP.Search.prototype.SetConstraint = function (constraint) { this.Constraints = constraint; }
    CMP.Search.prototype.SetCategoryKey = function (categoryKey) { this.CategoryKey = categoryKey; }
    CMP.Search.prototype.SetMaxItems = function (maxItems) { this.MaxItems = maxItems; }
    CMP.Search.prototype.SetApplicationName = function (applicationName) { this.ApplicationName = applicationName; }
    CMP.Search.prototype.SetSearchName = function (searchName) { this.SearchName = searchName; }
    CMP.Search.prototype.SetProviderName = function (providerName) { this.ProviderName = providerName; }
    CMP.Search.prototype.AddSort = function (sort) { this.Sorts.push(sort); }
    CMP.Search.prototype.AddSelectedIndexer = function (si) { this.SelectedIndexers.push(si); }
    CMP.Search.prototype.ClearSorts = function () { this.Sorts = []; }
    CMP.Search.prototype.ClearSelectedIndexers = function () { this.SelectedIndexers = []; }
    CMP.Search.prototype.SetResponse = function (response) { this.Response = response; }
    CMP.Search.prototype.ClearResponse = function () { this.Response = null; }
    CMP.Search.prototype.UseCurrentSessionSearchIndexers = function (useCurrentSessionSearchIndexers) { this.UseCurrentSessionSearchIndexers = useCurrentSessionSearchIndexers; }
    CMP.Search.prototype.UseCurrentSessionSearchConstraints = function (useCurrentSessionSearchConstraints) { this.UseCurrentSessionSearchConstraints = useCurrentSessionSearchConstraints; }
    CMP.Search.prototype.InverseGroupedAttributesWhenPresentInConstraints = function (inverseGroupedAttributesWhenPresentInConstraints) { this.InverseGroupedAttributesWhenPresentInConstraints = inverseGroupedAttributesWhenPresentInConstraints; }
    
    /** HelperMethods   *************************************************************** **/

//useful so you dont have to wrap the json string with array braces each time
    CMP.ConvertStringResultToJSONObject = function (json) { if (json !== undefined &&  json != null )  return JSON.parse('[' + json + ']'); }

    // Use this it execute a custom function per item
    CMP.IterateAndRunFunctionPerItem = function(funcToRun, arrayOfItems)
    {
        if (funcToRun == null) return;

        for (var i = 0; i < arrayOfItems.length; i++) {
            funcToRun(arrayOfItems[i]);
        }
    }

    CMP.GetGroupedDataFromCurrentSessionSearch = function (useSessionConstraints, attributeKey, searchname, completionfunction, completionfunctionArg, pageSize) {
        var srch = new CMP.Search(searchname);
        srch.UseCurrentSessionSearchConstraints(useSessionConstraints);
        srch.AddSort(new CMP.Sort(attributeKey, true));
        srch.ClearSelectedIndexers();
        srch.AddSelectedIndexer(attributeKey);
        srch.InverseGroupedAttributesWhenPresentInConstraints = true;
        srch.SetMaxItems(pageSize || 0);
        var req = $.ajax({
            type: "POST",
            url: urlToSearchPanelService + "GetGroupedJSONData",
            contentType: "application/json; charset=utf-8",
            data: CMP.GetJSONString(srch)
        });
        req.done(function (msg) {
            var jsonObject = CMP.ConvertStringResultToJSONObject(msg.d);

            if (completionfunction != null)
                completionfunction(jsonObject, completionfunctionArg, attributeKey);

        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            ShowError("Request failed: " + jqXHR.statusText);
            return null;
        })
        //'EVENT_COUNTRY'
    }

    CMP.AppendValueToCurrentSearch = function (AttributeKey, AttributeValue, removeIfExists, metaData, completionFunction) {

        var req = $.ajax({
            type: "POST",
            url: urlToSearchPanelService + "AppendValueToCurrentSearch",
            contentType: "application/json; charset=utf-8",
            data: '{"AttributeKey":"' + AttributeKey + '", "AttributeValue":"' + AttributeValue +
                    '","removeIfExists":' + removeIfExists + ', "metaData":"' + metaData + '"}'
        });
        req.done(function (msg) {
            var jsonObject = CMP.ConvertStringResultToJSONObject(msg.d);
            if (completionFunction != null)
                completionFunction();
        });
        req.fail(function () {
            ShowError("Request failed: " + jqXHR.statusText);
            return null;
        })
    }

    CMP.AppendRangeToCurrentSearch = function (AttributeKey, min, max, isDateRange, removeIfExists, metaData, completionFunction) {

        var reqRange = $.ajax({
    type: "POST",
    url: urlToSearchPanelService + "AppendRangeToCurrentSearch",
    contentType: "application/json; charset=utf-8",
    data: '{"AttributeKey":"' + AttributeKey + '", "min":"' + min + '", "max":"' + max +
                    '","isDateRange":' + isDateRange + ',"removeIfExists":' + removeIfExists + ', "metaData":"' + metaData + '"}'
    });
        reqRange.done(function (msg) {

            var jsonObject = CMP.ConvertStringResultToJSONObject(msg.d);
        if (completionFunction != null)
            completionFunction();


    });
        reqRange.fail(function () {
            ShowError("Request failed: " + jqXHR.statusText);
            return null;
    })
        //'EVENT_COUNTRY'
}













/** stuff below here is only demo **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/
/** DEMO METHODS BELOW  *************************************************************** **/

function AddButtonToDemoCMPSearch() {
    //add a button near the search bar tp click, writes output to console
    $('<div>Click <a href="#" onclick=\'LoadSearchDemo();\'>here</a> to invoke the search stuff<br><input text=\'s\' text=\'Click\' onclick=\'LoadSearchDemo();\' type=\'button\'/></div>').insertAfter($('#searchBar'));
    
}

/** Load Search Demo, does a simple search and returns data in msgbox -- call AddButtonToDemoCMPSearch()**/
function LoadSearchDemo() {
    var srch = new CMP.Search("JDSFProgramsQuery");
    srch.SetApplicationName("JANES");
    srch.SetCategoryKey("JDSF14");
    srch.SetProviderName("JanesDSF14Provider");
    srch.AddSelectedIndexer("ITEMNAME");
   // srch.AddSelectedIndexer("ITEMDESC");
    srch.SetMaxItems(30);

    //Top Level Constraint
    var c = new CMP.Constraint("", "", "ANDNested");
    //Or Constraint to allow provider to OR c2 and c3
    var c1 = new CMP.Constraint("", "", "ORNested");
    var c2 = new CMP.Constraint("RECORDID", "505394", "Equals");
    var c3 = new CMP.Constraint("RECORDID", "505395", "Equals");

    // stack up the constraints correctly 
    // Method is PARENT.AddConstraint(CHILD)
    c.AddConstraint(c1);
    c1.AddConstraint(c2);
    c1.AddConstraint(c3);

    // applying the constraints to the search object is slightly different to get the schema of the c# class right
    srch.SetConstraint(c);

    //SORTS
        var sort = new CMP.Sort();
        sort.AttributeKey = "ITEMNAME";
        sort.isAscending = "true";
        //can be called multiple times
        srch.AddSort(sort);

    var request1 = $.ajax({
        type: "POST",
        url: urlToSearchPanelService + "GetJSONData",
        contentType: "application/json; charset=utf-8",
        data: CMP.GetJSONString(srch) 
    });
    request1.done(function (msg) {
        var jsonObject = CMP.ConvertStringResultToJSONObject(msg.d);
        CMP.IterateAndRunFunctionPerItem(CustomFunctioWhichYouCanRunAgainstEachRecordInResultsViaIterateAndRunFunctionPerItem2, jsonObject);
        GetGroupedDataNext(srch);
    });
    request1.fail(function () {
        //  alert( "error" );
    })
}
/** grouped data demo **/
function GetGroupedDataNext(srch)
{

    //remove all the indexers so we can group on a groupable column else they will all be unique
    srch.ClearSelectedIndexers();
    srch.AddSelectedIndexer("FUNCTIONALSEGMENT");
    srch.ClearSorts();

    var sort = new CMP.Sort();
    sort.AttributeKey = "FUNCTIONALSEGMENT";
    sort.isAscending = "true";

    srch.AddSort(sort);

    srch.ClearResponse();
    srch.SetSearchName("groupeddatatable");
    srch.SetConstraint(null);

    var request2 = $.ajax({
        type: "POST",
        url: urlToSearchPanelService + "GetGroupedJSONData",
        contentType: "application/json; charset=utf-8",
        data: CMP.GetJSONString(srch)
    });
    request2.done(function (msg) {
        srch.SetResponse(JSON.parse('[' + msg.d + ']'));
        var x = CMP.ConvertStringResultToJSONObject(msg.d);
        CMP.IterateAndRunFunctionPerItem(CustomFunctioWhichYouCanRunAgainstEachRecordInResultsViaIterateAndRunFunctionPerItem, x);
    });
    request2.fail(function () {
        //  alert( "error" );
    })
}

// so these functions will be typical of something you add to your own page and fire the results 
function CustomFunctioWhichYouCanRunAgainstEachRecordInResultsViaIterateAndRunFunctionPerItem2(item) {
    cw('NAME = ' + item.ITEMNAME);
}

function CustomFunctioWhichYouCanRunAgainstEachRecordInResultsViaIterateAndRunFunctionPerItem(item)
{
    cw(item.FUNCTIONALSEGMENT);
}

function updateDropdown(dropDownId, attributeId, searchName, useSessionConstraints)
{
    var dropdown = $('#' + dropDownId);
    if ($('#' + dropDownId + '_chosen > ul > li > input').hasClass("CMPDataLoading"))
    {
        $('#' + dropDownId + '_chosen > ul > li > input').addClass("chosen-sp-loading");
        // dropdown is loading and user has clicked away then clicked back in , 
        // show the loading symbol again as it will be removed once data loaded
    }   
    if (dropdown.find("option").length == 0) {
        dropdown.css({ opacity: 0.5 });
        $('#' + dropDownId + '_chosen > ul > li > input').addClass("chosen-sp-loading");
        $('#' + dropDownId + '_chosen > ul > li > input').addClass("CMPDataLoading");

        // add in a fake option immediately to stop this being executed multiple times
        var options = "<option value='' selected='selected'>Loading...</option>";
        dropdown.html(options);

        CMP.GetGroupedDataFromCurrentSessionSearch(useSessionConstraints, attributeId, searchName, reloadDropdown, dropDownId);
    }
}
 
function reloadDropdown(jsonObject, dropdownId, attributeId)
{
    var dropdown = $('#' + dropdownId);

    if (jsonObject == null || jsonObject.length == 0 || jsonObject[0] == null) {
        $('#' + dropdownId + '_chosen > ul > li > input').removeClass("chosen-sp-loading");
        $('#' + dropdownId + '_chosen > ul > li > input').removeClass("CMPDataLoading");
        return;
    }

    var thisValue = "";
    var operator = (dropdownId.toLowerCase().indexOf("__like__") > 0 ? "like" : "equals");

    dropdown.empty();
    dropdown.chosen();
    dropdown.css({ opacity: 1 });

    var options = "";

    if (dropdown.hasClass("search_panel_dropdown_single")) {
        options = "<option value='' selected='selected'></option>";
    }

    for (var i = 0; i < jsonObject.length; i++) {
        var item = jsonObject[i];

        thisValue = eval('item.' + attributeId);

        //IGNORE Unassigned Values - KISS to start with but might need to extend if dropdowns have a valid value of 'unassigned'.
        if (thisValue != 'Unassigned') {
            var dis = "";
            if (thisValue == "") {
                dis = "disabled";
                thisValue = "None Available";
            }

            value = attributeId + '::' + operator + '::' + thisValue;          //EVENT_COUNTRY::equals::Algeria
            options = options + "<option value=\"" + value + "\" " + dis + ">" + thisValue + "</option>";
        }
    }
    dropdown.html(options);
    $('#' + dropdownId + '_chosen > ul > li > input').removeClass("chosen-sp-loading");
    $('#' + dropdownId + '_chosen > ul > li > input').removeClass("CMPDataLoading");
    if (!bowser.msie || (bowser.msie && parseInt(bowser.version, 10)) > 7) {
        dropdown.trigger("chosen:updated");

        if (dropdown.hasClass("search_panel_dropdown")) {
            // the below keeps chosen open when selecting values in multi-select dropdowns
            var chosen = dropdown.data("chosen");
            if (typeof (chosen) != "undefined") {
                var _fn = chosen.result_select;
                chosen.result_select = function (evt) {
                    evt["metaKey"] = true;
                    evt["ctrlKey"] = true;
                    chosen.result_highlight.addClass("result-selected");
                    return _fn.call(chosen, evt);
                };
            }
        }
    }
}


function FilterButtonClicked(filterbutton, e, datatype)
{
    var datatype = $(filterbutton).attr("datatype").toUpperCase();
    attributeTextForFilterCheckboxes = $(filterbutton).data("title");//.parent().text();
    $(filterbutton).parent().addClass("gridRefinerLoading");
    var attribute = $(filterbutton).attr('attributekey');
    var completionArg = { "eventargs": e, "datatype": datatype };
    switch(datatype)
    {
        case "STRING": CMP.GetGroupedDataFromCurrentSessionSearch(true, attribute, "", SetGridColumnRefinerData, completionArg, 1000); break;
        case "NUMERIC": break;
        default: break;
    }
    ShowGridColumnRefiner(null, completionArg, attribute);
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        event.returnValue = false;
    }
    return false;
}

var attributeTextForFilterCheckboxes = "";
function ShowGridColumnRefiner(jsonObject, completionArg, attributeKey) {
   
    var e = completionArg.eventargs;
    var datatype = completionArg.datatype;
    var gridRefineColumnChooserContainer = $("#gridRefineColumnChooserContainer");
    if ($("#gridRefineColumnChooserContainer").length > 0) gridRefineColumnChooserContainer.remove();// just while debugging as I have turned off the mouseout option
    gridRefineColumnChooserContainer = $("<div class='gridRefineColumnChooserContainer' id='gridRefineColumnChooserContainer'></div>");
    var html = "<button type='button' class='close cancel' aria-label='Close'><span aria-hidden='true'>&times;</span></button>Refine on: <span class='gridRefineColumnChooserBigMsg'>" + attributeTextForFilterCheckboxes + "</span><br/>";
    //hide the loading spinner
    $(".gridRefinerLoading").removeClass("gridRefinerLoading");
    html += "<input id='gridRefinerDataType' type='hidden' value='" + datatype + "'>";
    html += "<input id='gridRefinerAttributeKey' type='hidden' value='" + attributeKey + "'>";
    if (datatype == "NUMERIC")
    {
        html += "<div class='gridrefinerRangeDiv'><br/><span class='gridrefinerRange'>From</span><input id='gridRefinerInputFrom' class='gridrefinerRangetextbox' type=text> <spanclass='gridrefinerRange'>&nbsp;&nbsp;To</span> ";
        html += "<input  class='gridrefinerRangetextbox' id='gridRefinerInputTo' type=text> </div>";
    }
    if (datatype == "STRING")
    {
        //all this code makes the little popup where you chos
        if (jsonObject != null && jsonObject.length > 1) {
        html += "<input  class='gridRefineColumnChooserFilterTextbox'  id='gridRefineColumnChooserFilterTextbox' placeholder='Filter List' type='text'/>";
        }
        html += "<div id='gridRefineColumnChooserDiv_" + attributeKey + "' class='gridRefineColumnChooserDiv'><ul id='gridRefineColumnChooserUL' class='gridRefineColumnChooserUL'>";
    
        var totalRecordsListed = 0;
        var maxRecordsListed = 1000;
        if (jsonObject == null) {
            html += "<li attributeValue='LOADING'  class='gridRefineColumnChooserLI'>";
            html += "<div class='Loading small' id='Loading'>Loading, Please Wait</div></li>";
        }
        else
        {
            for (var i = 0; i < jsonObject.length; i++) {
                if (totalRecordsListed < maxRecordsListed) {
                    var item = jsonObject[i];
                    var itemVal = eval('item.' + attributeKey);
                    if ($.trim(itemVal) != "") {
                        html += "<li attributeValue='" + itemVal + "'  class='gridRefineColumnChooserLI'><input id='gridRefineColumnChooserLI" + i + "' attributeValue='" + itemVal + "' attributeKey='" + attributeKey + "' type=checkbox  >";
                        html += "<label for='gridRefineColumnChooserLI" + i + "'>" + $.trim(itemVal) + "</label></li>";
                        totalRecordsListed++;
                    }
                }
                else
                    break;
            }
        }
        html += "</ul></div>";
        if (jsonObject != null && jsonObject.length > 1) {
            if (totalRecordsListed < maxRecordsListed) {
                html += "<div id='gridRefineColumnChooserSmallMsg' class='gridRefineColumnChooserSmallMsg'>" + totalRecordsListed.toString() + " records listed.</div><br/>";
            }
            else {
                html += "<div class='gridRefineColumnChooserSmallMsg'>Showing the first " + maxRecordsListed.toString() + " records.</div><br/>";
            }

        }
    } // END if (datatype == "STRING")

    html += "<input class='ihsStandardButton' style='width:73%' onclick=\"gridRefineColumnButtonClick('gridRefineColumnChooserContainer');\" type=button value='Refine Search'/> <input class='ihsStandardButton white cancel'style='width:25%' type=button value='Cancel'/>";
     gridRefineColumnChooserContainer.html(html);

     var target = $(e.target);
     if ((bowser.msie && parseInt(bowser.version, 10) <= 8)) {
         target = $(e.srcElement);
     }
     var par = target.parent();
    if (par.length == 0) {
        par = $("#ctl00_mainContent_gridResults_grid1_" + attributeKey.replace("$","\\$"));
    }
    par.append(gridRefineColumnChooserContainer);
     gridRefineColumnChooserContainer.css("margin-top", "9px");
     gridRefineColumnChooserContainer.css("margin-left", ((par.width() - gridRefineColumnChooserContainer.width()) / 2) + "px");
     
     $("#gridRefineColumnChooserContainer .cancel").click(function () {
         $('#gridRefineColumnChooserContainer').remove();
     })

    //refine the list of checkboxes based on the users input
    $('.gridRefineColumnChooserFilterTextbox').on("keyup", (function () {
        var searchText = $('#gridRefineColumnChooserFilterTextbox').val().toUpperCase();
        var searchTextLength = searchText.length;

        var listItems = $('.gridRefineColumnChooserLI');
        var hiddenCount = 0;
        var shownCount = 0;

        for (var i = 0; i < listItems.length; i++) {
            var anItem = $(listItems[i]);
            var val = anItem.attr("attributeValue").toUpperCase();
            var thisCheckbox = anItem.find('input[type=checkbox]');
            if (val != null && !thisCheckbox.prop("checked"))
            {
                if (val.indexOf(searchText) == -1) {
                    anItem.addClass('hidden');
                    hiddenCount++;
                }
                else {
                    anItem.removeClass('hidden');
                    shownCount++;
                }
            }
        }

        //tell the user how many records have been shown and how many have been hidden
        var msg = hiddenCount.toString() + " records hidden, " + shownCount.toString() + " records shown."
        $('#gridRefineColumnChooserSmallMsg').text(msg);
    }));
   
}
function SetGridColumnRefinerData(jsonObject, e, attributeKey) {
    $('#gridRefineColumnChooserContainer').remove();
    ShowGridColumnRefiner(jsonObject, e, attributeKey);
}
   

    ////refine the list of checkboxes based on the users input
    //$('.gridRefineColumnChooserFilterTextbox').on("keyup", (function () {
    //    var searchText = $('#gridRefineColumnChooserFilterTextbox').val().toUpperCase();
    //    var searchTextLength = searchText.length;

    //    var listItems = $('.gridRefineColumnChooserLI');
    //    var hiddenCount = 0;
    //    var shownCount = 0;

    //    for (var i = 0; i < listItems.length; i++) {
    //        var anItem = $(listItems[i]);
    //        var val = anItem.attr("attributeValue").toUpperCase();
    //        var thisCheckbox = anItem.find('input[type=checkbox]');
    //        if (val != null && !thisCheckbox.prop("checked")) {
    //            if (val.indexOf(searchText) == -1) {
    //                anItem.addClass('hidden');
    //                hiddenCount++;
    //            }
    //            else {
    //                anItem.removeClass('hidden');
    //                shownCount++;
    //            }
    //        }
    //    }

    //    //tell the user how many records have been shown and how many have been hidden
    //    var msg = hiddenCount.toString() + " records hidden, " + shownCount.toString() + " records shown."
    //    $('#gridRefineColumnChooserSmallMsg').text(msg);
    //}));

 
 

function ToggleCheckedValue(container)
{
    var checkBoxes = $('#' + container + ' input[type=checkbox]');
    // swap cehceked state = checkBoxes.each(function () { this.checked = !this.checked; })
   checkBoxes.prop("checked", !checkBoxes.prop("checked"));
}

function gridRefineColumnButtonClick(container)
{
   

    var datatype = $('#gridRefinerDataType').val();
    var attributeKey = $('#gridRefinerAttributeKey').val();

    switch(datatype)
    {
        case"STRING":
            var attributeValues = [];
            var checkBoxes = $('#' + container + ' input[type=checkbox]');
            var someRemainsUnchecked = false;

            checkBoxes.each(function () {

                //attributeKey = $(this).attr('attributeKey');
                var attributeValue = $(this).attr('attributeValue');

                if (this.checked) {
                    attributeValues.push(attributeValue);
                    updated = true;
                }
                else {
                    someRemainsUnchecked = true;
                }
            });

            if (attributeValues.length > 0) {
                if (typeof SendData === "function") {
                    CurrentFiltersMessage = "";
                    for (var i = 0; i < attributeValues.length; i++) {
                        CurrentFiltersMessage += "<<" + attributeKey + "::equals::" + attributeValues[i] + ">>,";
                    }
                    SendData();
                } else {
                    var attributes = attributeValues.join('$$');
                    CMP.AppendValueToCurrentSearch(attributeKey, attributes, false, "", function () { document.location.reload(); });
                }
            };
            break;
        case "NUMERIC":  
            var From = $('#gridRefinerInputFrom').val();
            var To = $('#gridRefinerInputTo').val();
            if (typeof SendData === "function") {
                CurrentFiltersMessage = "<<RANGE:" + attributeKey + "::null::" + From + "!!" + To + "::>>";
                SendData();
            } else {
                CMP.AppendRangeToCurrentSearch(attributeKey, From, To, false, true, "", function () { document.location.reload(); });
            }
            break;
        default: break;
    }

    $('#gridRefineColumnChooserContainer').remove();
}
 

