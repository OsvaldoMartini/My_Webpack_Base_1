/**
************
SEARCH PANEL
************

Intended to sit just below the breadcrumb to provide an NON-REFINING (pros and cons) FILTER on the current data.

Points of interest.

document.ready - hook up all inputs in search panel to fire SearchPanelEventFilterChanged()
when the input changes. inputs come from control config xml file.

SearchPanelEventFilterChanged() will collect a big string of selections and send them off to the server.
this will get received by the server and will affect the session.corecatalogsearch constraints.

once this has succeeded the search panel will fire an event -  SessionSearchChangedEvent; (see just below)

other controls such as grid, chart, map may subscribe to this event and can choose to do what they like.
e.g. $(document).bind('SessionSearchChangedEvent', function (e) { grid.refresh()  });
**/

//user friendly filters message .
var SelectedDetails = "";

//server friendly filters message
var CurrentFiltersMessage = "";

// create an event to fire when session search gets changed by search panel
var SessionSearchChangedEvent = jQuery.Event("SessionSearchChangedEvent");
var PreSessionSearchChangedEvent = jQuery.Event("PreSessionSearchChangedEvent");
var CrumbLoadedEvent = jQuery.Event("CrumbLoadedEvent");

// Event so devs can preserve state and reset if they have custom input elements elsewhere on the page
// User can attach to the 'clearedSelections' event, and rebuild their inputs
// dev must cache their state prior to this.
var clearedSelections = jQuery.Event("clearedSelections");

//any control which wants to know when search panel has changed session core search, subscribes to the event as follows...
// ** NOTE **, the subscriber is the owner of the code which gets executed as per normal events
//$(document).bind('SessionSearchChangedEvent', function (e) { var abc = 'SessionSearchChangedEvent has fired!'; /**alert(abc);**/ });
//$(document).bind('SessionSearchChangedEvent', function (e) { UpdateCharts(); });
//$(document).bind('SessionSearchChangedEvent', function (e) { UpdateMap; });
//etc etc

// 2 arrays to hold key and resource value for attributes - get populated in searchpanel.ascx.cs.BuildResourceKeyArrayForJavascriptCalls();
var SearchControlAttributeKeys = [];
var SearchControlAttributeResourceValues = [];

function GetAttributeNameFromThreePartId(controlId) {
    // id will be "search_panel_input_element__ATTRIBUTE::SOMETHING::SOMETHING
    // we want to return just, ATTRIBUTE
    return controlId.toString().split('::')[0].replace(/search_panel_input_element__/gi, "");
}
function GetOperatorFromThreePartId(controlId, bUserFriendly) {
    // id will be "search_panel_input_element__ATTRIBUTE::SOMETHING::SOMETHING
    // we want to return just, ATTRIBUTE
    var operator = controlId.toString().split('::')[1];
    if (operator == "fulltext" && bUserFriendly)
        operator = "LIKE";
    return operator;
}

// cookie stuff for recalling the state of the search pane
var SEARCHPANEL_TOGGLE_STATUS = 'SearchPanelToggleStatus';
var BLOCK = 'BLOCK';
var HIDDEN = 'HIDDEN';
var boolDEBUG = true;
//var boolWriteLogToDivForIE7 = true;

// in case there is no console for the next function below
if (!(window.console && console.log)) {
    console = {
        log: function () { },
        debug: function () { },
        info: function () { },
        warn: function () { },
        error: function () { }
    };
}

//console.writeline
function cw(message) {
    //if (boolDEBUG) {
    //    var d = new Date();
    //    console.log(d.toTimeString() +  ' ****  ' + message);
    //}
    //if (boolWriteLogToDivForIE7) {
    //    var d = new Date();
    //    $('#divLogging').append(d.toTimeString() + ' ****  ' + message + "<br/><br/><hr/><br>");
    //}
}

$(document).ready(function () {
    setupSearchPanel();
});
// end doc ready func

function LoadSearchDemo() {
    var srch = new CMP.Search("JDSFProgramsQuery");
    srch.SetApplicationName("JANES");
    srch.SetCategoryKey("JDSF14");
    srch.SetProviderName("JanesDSF14Provider");
    srch.AddSelectedIndexer("ITEMNAME");
    // srch.AddSelectedIndexer("ITEMDESC");
    srch.SetMaxItems(121);

    var c = new CMP.Constraint("Root", "Root", "ORNESTED");
    var c2 = new CMP.Constraint("NAME", "DAVE", "EQUALSCONSTRAINT");
    var c3 = new CMP.Constraint("NAME", "JOHN", "EQUALSCONSTRAINT");
    var c4 = new CMP.Constraint("AnotherOr", "AnotherOr", "ORNESTED");

    c.AddConstraint(c2);
    c.AddConstraint(c3);
    c4.AddConstraint(c2);
    c4.AddConstraint(c3);

    var sort = new CMP.Sort();
    sort.AttributeKey = "ITEMNAME";
    sort.isAscending = "true";

    srch.AddSort(sort);
    var jsonString = '{"jsonSearch":"' + JSON.stringify(srch).replace(/"/gi, "'") + '"}';

    var request1 = $.ajax({
        type: "POST",
        url: urlToSearchPanelService + "GetJSONData",
        contentType: "application/json; charset=utf-8",
        data: jsonString
    });
    request1.done(function (msg) {
    });
    request1.fail(function () {
        ShowError("error");
    })
}

function setupSearchPanel() {
    var helpIsVisble = false; //bool to show if user is currently viewing help notes on search panel selection strategy

    // check if there are selectable columns for a full text search, initially hide the panel if it exists
    if ($('#search_panel_input_element__ColumnsExpander').length > 0) {
        //$('#search_panel_input_element__Columns').hide();
        $('#search_panel_input_element__Columns').css("visibility", "hidden")
    }

    // allow the user to show/hide the full text search column list panel when they click the expander widget
    $('#search_panel_input_element__ColumnsExpander').click(function () {
        //$('#search_panel_input_element__Columns').slideToggle(500);
        $('#search_panel_input_element__Columns').css('visibility', function (i, visibility) {
            return (visibility == 'visible') ? 'hidden' : 'visible';
        });
    });

    $('#searchPanelHelpIcon').click(function () {
        // $("#divCurrentSelections").fadeOut(500);
        if (helpIsVisble)
            $("#searchPanelHelp").fadeOut(500);
        else
            $("#searchPanelHelp").fadeIn(500);

        helpIsVisble = !helpIsVisble;
    });

    // $('.searchpanelDropdownOption').tipsy({ gravity: 'n', delayIn: 200, delayOut: 200, fade: true });

    $(document).on("mouseover", "a", function () { $(this).css('cursor', 'pointer'); });
    $('#ctl00_masterBreadcrumb').css('min-height', '10px');

    // auto-complete textboxes need hooking up with auto-complete
    $("#SearchPanel .search_panel_autoComplete").each(function () {
        var attributeName = GetAttributeNameFromThreePartId($(this).attr("id"));

        // if this flag has been set - udpate attribute to reflect we want a specific search based on attribute name
        // thus there should be a tsql query == attribute in the tsql config xml file for this attribute
        if ($(this).attr("USEATTRIBUTEASSEARCHNAME").length > 0) {
            attributeName += "_USEATTRIBUTEASSEARCHNAME";
        }
        $(this).autocomplete({
            open: function () {
                // After menu has been opened, set width to 100px
                $('.ui-menu')
                    .width(300);
                $(this).autocomplete('widget').css('z-index', 10000);
            },
            minLength: 3,
            select: function (a, b) {
                $(this).val(b.item.value);
                SearchPanelEventFilterChanged();
                //cw('ui item selected a='+a+', b=' + b);
            },
            delay: 750,
            source: function (term, data) {
                //cw('about to ajax to ' + urlToSearchPanelService + 'FindTerms, term.term=' + term.term);
                $.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    url: urlToSearchPanelService + "FindTerms",

                    data: { "term": attributeName + "::" + term.term },
                    success: function (response) {
                        try {
                            //cw('FindTerms success response=' + response);
                            data(response.d);
                        }
                        catch (e) {
                            //cw('FindTerms failed in success, error message = ' + e.toString());
                        }
                    },
                    error: function (xhr, status, error) {
                        var err = eval('(' + xhr.responseText + ')');
                        //alert(err.Message);
                        //alert(xhr.responseText);
                        //alert(status);
                    }
                });
            }
        });
    });

    $("#SearchPanel .search_panel_autoComplete").each(function () {
        $(this).on("autocompletechange", function (event, ui) { SearchPanelEventFilterChanged(); });
    });

    // any input with class = search_panel_input_element_decimal in the searchpanel should only allow numbers and dec.
    $('#SearchPanel :input[type="text"].search_panel_input_element_decimal').each(function () {
        $(this).keyup(function () {
            if (this.value != this.value.replace(/[^0-9\.]/g, '')) {
                this.value = this.value.replace(/[^0-9\.]/g, '');
            }
            SearchPanelEventFilterChanged();
        })
    });
    // integers only
    $('#SearchPanel :input[type="text"].search_panel_input_element_integer').each(function () {
        $(this).keyup(function () {
            if (this.value != this.value.replace(/[^0-9,]/g, '')) {
                this.value = this.value.replace(/[^0-9,]/g, '');
            }
            SearchPanelEventFilterChanged();
        })
    });
    //dates only
    $('#SearchPanel :input[type="text"].search_panel_input_element_datetime').each(function () {
        $(this).addClass("datepicker");
    });

    $(function () {
        $(".datepicker").datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: "-30:+0"
        });
        $(".datepicker").change(function () {
            $(".datepicker").datepicker("option", "dateFormat", "D, d M, yy");
            SearchPanelEventFilterChanged();
        });

        //handle date ranges
        $('#SearchPanel #search_panel_input_element__Range\\:Min\\:\\:START_DATE').datepicker('option', {
            onClose: function (selectedDate) {
                $("#search_panel_input_element__Range\\:Max\\:\\:START_DATE").datepicker("option", "minDate", selectedDate);
            }
        });

        $('#SearchPanel #search_panel_input_element__Range\\:Max\\:\\:START_DATE').datepicker('option', {
            onClose: function (selectedDate) {
                $("#search_panel_input_element__Range\\:Min\\:\\:START_DATE").datepicker("option", "maxDate", selectedDate);
            }
        });
    });

    $(document).bind('SessionSearchChangedEvent', function (e) {
        if (bowser.msie && parseInt(bowser.version, 10) < 8) {
            HookUpChosen($("#SearchPanel .ApplyChosen"));
        }
        else {
            $("#SearchPanel .ApplyChosen").empty().trigger("chosen:updated");
        }
    });

    //hook up any controls to chosen plugin - selector is the ApplyChosen class set in APPNAMEcontrolConfig.xml - inside search_panel_input_element
    HookUpChosen($("#SearchPanel .ApplyChosen"));

    //hook up the change events
    $('select.search_panel_dropdown').change(function () { SearchPanelEventFilterChanged(); });
    $('select.search_panel_dropdown_single').change(function () { SearchPanelEventFilterChanged(); });
    $('select.search_panel_range').change(function () { SearchPanelEventFilterChanged(); });
    $('input.search_panel_input').change(function () { SearchPanelEventFilterChanged(); });
    $('input:text.search_panel_input').keyup(function () { SearchPanelEventFilterChanged(); });
    $('input:text.search_panel_input_element').change(function () { SearchPanelEventFilterChanged(); });
    $('input:text.search_panel_input_element').keyup(function () { SearchPanelEventFilterChanged(); });
    $("#SearchPanel input[type='checkbox'] ").change(function () { SearchPanelEventFilterChanged(); });
    $("#SearchPanel input[type='radio']:checked").change(function () { SearchPanelEventFilterChanged(); });
    $("input[type='checkbox'].searchPanelNotToggle").change(function () { ToggleNOTStatus(this); });
    $('input:text.search_panel_input').keypress(function (e) {
        if (e.which == 13) {
            SendData();
        }
    });

    $('input:text.search_panel_input_element_string').keypress(function (e) {
        if (e.which == 13) {
            SendData();
        }
    });

    $("#SearchPanel select").dblclick(function () { SearchPanelEventFilterChanged(); SendData() });
    // search tabs look like links
    $('div.TabHdr').mouseover(function () { $(this).css('cursor', 'pointer'); });

    //auto select first search tab
    $('div.TabHdr').first().addClass('TabHdrSelected');

    //hide all the tab data then select the first one
    var tabBar = $('div.searchPanelTab');
    tabBar.css('display', 'none');
    tabBar.css('visibility', 'hidden');
    tabBar.eq(0).css('display', 'Block');
    tabBar.eq(0).css('visibility', 'visible');

    //handle changing what is visible when user clicks tabs
    $('div.TabHdr').click(function () {
        //Show the corresponding Table afte hiding everything
        var ix = $(this).index();

        tabBar.css('display', 'none');
        tabBar.css('visibility', 'hidden');
        tabBar.eq(ix - 1).css('display', 'Block');
        tabBar.eq(ix - 1).css('visibility', 'visible');

        $('div.TabHdrSelected').addClass('TabHdr');
        $('div.TabHdrSelected').removeClass('TabHdrSelected');
        $(this).addClass('TabHdrSelected');
        var wl = window.location.toString();
        var filename = wl.substring(wl.lastIndexOf('/') + 1);
        setFilterHeight();
    });

    setFilterHeight();
    // Makes tabs fixed width if they wrap to 2 or more lines
    $(document).ready(function () {
        if ($('.searchPanelHeader').height() > 60) {
            $('.searchPanelHeader').addClass('fixed');
        }
    });
}
/// a special checkbox has been clicked, get the target control and update the control
/// add a class called search_panel_appendNOTConstraint
function ToggleNOTStatus(checkbox) {
    var targetcontrolid = $(checkbox).attr('targetControlId');
    var isChecked = $(checkbox).prop('checked');

    if (targetcontrolid != null && isChecked) {
        $('#' + targetcontrolid).addClass('applyAsANOTContstraint');
    }
    else if (targetcontrolid != null) {
        $('#' + targetcontrolid).removeClass('applyAsANOTContstraint');
    }

    SearchPanelEventFilterChanged(false);
}
function HookUpChosen(selector) {
    //hook up controls to chosen plugin
    if (selector.length > 0) {
        try {
            if (bowser.msie && parseInt(bowser.version, 10) < 8) {
                var dropdowns = $("#searchPanelLeft .search_panel_dropdown");
                if (dropdowns.length > 0) {
                    for (var i = 0; i < dropdowns.length; i++) {
                        var aDropdown = $(dropdowns[i]);
                        var useSessionSearchConstraints = aDropdown.attr('sp_UseSearchConstraints');
                        var attrId = aDropdown.attr('sp_AttributeKey');
                        var searchName = aDropdown.attr('sp_SearchName');
                        if (attrId != null) {
                            updateDropdown(aDropdown.attr("id"), attrId, searchName, useSessionSearchConstraints);
                        }
                    }
                }
            }
            else {
                selector.empty().trigger("chosen:updated");

                selector.chosen({ no_results_text: "Nothing found" });

                //when a chosen is selected, we will need to get the data if its empty
                // while this is happeing show loading
                selector.on("chosen:hiding_dropdown", function () { $('#' + this.id + '_chosen > ul > li > input').removeClass("chosen-sp-loading"); });
                selector.on("chosen:showing_dropdown", function (evt, params) {
                    var useSessionSearchConstraints = $('#' + this.id).attr('sp_UseSearchConstraints');
                    var attrId = $('#' + this.id).attr('sp_AttributeKey');
                    var searchName = $('#' + this.id).attr('sp_SearchName');
                    if (attrId != null) {
                        updateDropdown(this.id, attrId, searchName, useSessionSearchConstraints);
                    }
                });
            }
        }
        catch (e) {; }//gracefully ignore chosen for the minute
    }
}
// end setupSearchPanel ***********************************************

// the 3 buttons fire this
function SendData(operator) {
    if (operator == undefined) {
        operator = "AND";
    }

    if ($('#search_panel_selections_strategy_and').prop('checked')) {
        operator = "AND";
    }
    else if ($('#search_panel_selections_strategy_replace').prop('checked')) {
        operator = "REPLACE";
    }
    else if ($('#search_panel_selections_strategy_or').prop('checked')) {
        operator = "OR";
    }
    $('.LoadingDiv').each( function () { $(this).css("display", "block") });

    $("#no-country-warning").remove();
    
    /* Says: Update search provided that either:
       • Not a Defence Budgets graph       
       • User has selected country in the dropdown
       • CurrentFiltersMessage is empty (necessary because system seems to make gratuitous calls to SendData)
       • User has previously selected a country and this is in the breadcrumb 
       • The Combine Countries switch is on 
       This is a hacky fix which is necessary because of the UI design */
    if (!$("div.intel h1:first:contains('Defence Budgets')").length  || 
            CurrentFiltersMessage.indexOf("COUNTRY") > -1||
            CurrentFiltersMessage === "" ||
            $("span.crumbLabel:contains('Country')").length ||
            $("input#ctl00_mainContent_UseCombine[checked='checked']").length)
    {
        UpdateSessionSearch(CurrentFiltersMessage, operator);
    } /* Says: Add the first warning if the Combine Country switch is there or the second warning if it isn't */
    else if (!$("input#ctl00_mainContent_UseCombine").length)
    {
        $("#search_panel_input_element__equal__COUNTRY").before("<b id='no-country-warning' style='color:red'>Too many results to display.  Please select a country from the dropdown box.</b>");
    }
    else 
    {
        $("#search_panel_input_element__equal__COUNTRY").before("<b id='no-country-warning' style='color:red'>Too many results to display.  Either select a country from the dropdown box or switch on the Combine Countries control.</b>");
    }
}

//NOTE = urlToSearchPanelService is a js variable written out into searchpanel.ascx
function UpdateSessionSearch(constraints, operator, replaceMethod) {
    //$.xhrPool.abortAll();
    if (constraints == null || constraints.toString() == "") {
        // don't bother doing request -
        // alert('nothing to send - halting');
        return;
    }

    var dataToSend;
    if (operator == "SINGLE_UNASSIGNED_ATTRIBUTE") {
        dataToSend = '{ "SearchPanelCriteria":"SINGLE::' + constraints;
    }
    else if (operator == "MULTI_UNASSIGNED_ATTRIBUTE") {
        dataToSend = '{ "SearchPanelCriteria":MULTI::"' + constraints;
    }
    else {
        dataToSend = '{ "SearchPanelCriteria":"' + operator + ']' + constraints;
    }

    if (operator != "SINGLE_UNASSIGNED_ATTRIBUTE" && operator != "MULTI_UNASSIGNED_ATTRIBUTE") {
        $(document).trigger('PreSessionSearchChangedEvent');
    }

    if (replaceMethod != undefined) {
        dataToSend += '", "replaceMethod":"' + replaceMethod + '" }';
    } else {
        dataToSend += '" }';
    }

    var request = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: urlToSearchPanelService + "UpdateSearch",
        data: dataToSend
    });

    request.done(function (msg) {
        if (operator == "SINGLE_UNASSIGNED_ATTRIBUTE" || operator == "MULTI_UNASSIGNED_ATTRIBUTE") {
            $(document).trigger('SessionSearchIndexerChangedEvent');
        }
        else {
            clearSelections();
            $(document).trigger('SessionSearchChangedEvent');
        }

        $('.LoadingDiv').each(
        function () { $(this).css("display", "none") });
    });

    request.fail(function (jqXHR, textStatus) {
        ShowError("Request failed: " + jqXHR.statusText);
    });
}

//the user selected / changed something in the search panel.
// build up a string of selected stuff across all the tabs then
// show this to the user for ease of use.
//also create the message to send to the server
function SearchPanelEventFilterChanged() {
    SearchPanelEventFilterChanged(false);
}

function SearchPanelEventFilterChanged(clearing) {
    SelectedDetails = "";
    CurrentFiltersMessage = "";

    if (!clearing) {
        //*********************************************************************************************************
        //events
        var multiDropdowns = $("#SearchPanel .search_panel_dropdown");
        if (multiDropdowns.length > 0) {
            for (var i = 0; i < multiDropdowns.length; i++) {
                // The values are in the following format INDEXER::OPERATOR::VALUE
                // i am going to get the first indexer and the remove all the rest from the string
                // so it looks  ok the screen when reporting back to the user what they have selected
                // SelectedDetails = user message on screen
                // CurrentFiltersMessage = message being passed to server

                var currentDropdown = $(multiDropdowns[i]);
                var metaDataLabel = currentDropdown.attr("metaDataLabel");
                var multipleValues = currentDropdown.val() || [];
                if (multipleValues.length > 0) {
                    var cleanedValues = new Array();
                    for (var m = 0; m < multipleValues.length; m++) {
                        var mVal = multipleValues[m];
                        if (mVal != "") {
                            if (metaDataLabel != undefined) {
                                cleanedValues.push(mVal + "::label=" + metaDataLabel);
                            }
                            else {
                                cleanedValues.push(mVal);
                            }
                        }
                    }

                    if (cleanedValues.length > 0) {
                        var IndexerName = cleanedValues[0].split('::')[0];
                        if (IndexerName != null && IndexerName != "") {
                            var displayName = "";
                            //now we have the indexerName, strip it from the mult
                            if (metaDataLabel != undefined) {
                                displayName = metaDataLabel;
                            }
                            else {
                                displayName = GetResourceValue(IndexerName);
                            }

                            //do we need to add a NOT hint to the message?
                            var applyAsNOTConstraint = currentDropdown.hasClass("applyAsANOTContstraint");
                            if (applyAsNOTConstraint) {
                                for (var c = 0; c < cleanedValues.length; c++) {
                                    var cVal = cleanedValues[c];
                                    if (cVal != "" && cVal.indexOf("::") !== -1) {
                                        cleanedValues[c] = cleanedValues[c].replace("::", "::NOT");
                                    }
                                }
                            }
                            CurrentFiltersMessage += '<<' + cleanedValues.join(">>,<<") + '>>,';
                            SelectedDetails += "<br/><br/>" + displayName + (applyAsNOTConstraint ? " NOT " : " = ") + " (";

                            // now the server message has been created, edit the user message to make it more readable.
                            // values in multipleValues will be like 'equals::Afghanistan' so we get rid of everything before ::
                            for (var c = 0; c < cleanedValues.length; c++) {
                                var cVal = cleanedValues[c];
                                if (cVal != "" && cVal.indexOf("::") !== -1) {
                                    cleanedValues[c] = cVal.split("::")[2];
                                }
                            }
                            var valuesInOneStringWithOr = cleanedValues.join(" OR ");
                            valuesInOneStringWithOr = valuesInOneStringWithOr.split(displayName + '::').join('');

                            SelectedDetails += valuesInOneStringWithOr;
                            SelectedDetails += '), ';
                        }
                    }
                }
            }
        }

        //single select dropdown
        var singleDropdowns = $("#SearchPanel .search_panel_dropdown_single");
        if (singleDropdowns.length > 0) {
            for (var i = 0; i < singleDropdowns.length; i++) {
                // The values are in the following format INDEXER::OPERATOR::VALUE
                // i am going to get the first indexer and the remove all the rest from the string
                // so it looks  ok the screen when reporting back to the user what they have selected
                // SelectedDetails = user message on screen
                // CurrentFiltersMessage = message being passed to server
                var currentDropdown = $(singleDropdowns[i]);
                var Value = currentDropdown.val();
                if (Value != null && Value.length > 0) {
                    var IndexerName = Value.split('::')[0];
                    if (IndexerName != null && IndexerName != '') {
                        //now we have the indexerName, strip it from the mult
                        SelectedDetails += "<br/><br/>" + GetResourceValue(IndexerName) + " = (";

                        CurrentFiltersMessage += '<<' + Value + '>>,';

                        // now the server message has been created, edit the user message to make it more readable.
                        // values in multipleValues will be like attribute::equals::Afghanistan' so we get rid of everything before ::
                        if (Value.indexOf("::") !== -1) {
                            Value = Value.split("::")[2];
                        }

                        SelectedDetails += Value;
                        SelectedDetails += '), ';
                    }
                }
            }
        }

        //set up register of ranges which need adding to the message.
        // if the min or max is selected / has value, we add the MIN object to the array, if it already exists - don't add it again
        var RangesToProcess = [];
        var textRanges = $("input:text.search_panel_range");
        if (textRanges.length > 0) {
            for (var i = 0; i < textRanges.length; i++) {
                var currentRange = $(textRanges[i]);
                if (currentRange.val() != '') {
                    if (currentRange.attr('id').indexOf(":Min:") !== -1) {
                        if ($.inArray(currentRange.attr('id'), RangesToProcess) == -1)
                            RangesToProcess.push(currentRange.attr('id'));
                    }
                    else {
                        var minId = currentRange.attr('id').replace(/Max/gi, "Min");
                        if ($.inArray(minId, RangesToProcess) == -1)
                            RangesToProcess.push(minId);
                    }
                }
            }
        }

        var selectRanges = $("select.search_panel_range");
        if (selectRanges.length > 0) {
            for (var i = 0; i < selectRanges.length; i++) {
                var currentRange = $(selectRanges[i]);
                if (currentRange.val() != '') {
                    if (currentRange.attr('id').indexOf(":Min:") !== -1) {
                        if ($.inArray(currentRange.attr('id'), RangesToProcess) == -1)
                            RangesToProcess.push(currentRange.attr('id'));
                    }
                    else {
                        var minId = currentRange.attr('id').replace(/Max/gi, "Min");
                        if ($.inArray(minId, RangesToProcess) == -1)
                            RangesToProcess.push(minId);
                    }
                }
            }
        }

        if (RangesToProcess.length > 0) {
            ProcessRanges(RangesToProcess);
        }

        var sliders = $("div.search_panel_range_slider");
        if (sliders.length > 0) {
            for (var i = 0; i < sliders.length; i++) {
                var currentSlider = $(sliders[i]);
                var friendlyId = currentSlider.attr("id").replace(/search_panel_input_element__/gi, "").replace("SliderRange_", "");

                var MinVal = currentSlider.slider("values", 0);
                var MaxVal = currentSlider.slider("values", 1);

                var extraData = "";
                if (currentSlider.hasClass("multiple_constraints")) {
                    extraData = "allowMultipleConstraints";
                }

                SelectedDetails += "<br/><br/>" + friendlyId + " between  " + MinVal + "  and  " + MaxVal + "<br/>";
                CurrentFiltersMessage += "<<RANGE:" + friendlyId + "::null::" + MinVal + "!!" + MaxVal + '::' + extraData + ">>,";
            }
        }

        var textInputs = $("input:text.search_panel_input_element");
        if (textInputs.length > 0) {
            for (var i = 0; i < textInputs.length; i++) {
                var currentInput = $(textInputs[i]);
                if (currentInput.val() != '' && !currentInput.hasClass('search_panel_range') && !currentInput.hasClass('searchPanelNotToggle')) {
                    if (!currentInput.hasClass('search_panel_range')) {
                        var friendlyId = currentInput.attr("id").replace(/search_panel_input_element__/gi, "")

                        // if the full text search has a selectable columns list
                        var columnNames = "";
                        if ($('#search_panel_input_element__ColumnsExpander').length > 0) {
                            var checkboxCount = $('#search_panel_input_element__Columns').find(':checkbox').length;
                            var checkedBoxes = $('#search_panel_input_element__Columns').find("[type='checkbox']:checked");

                            // if the user has selected specific columns i.e. not all/none of them
                            if ((checkedBoxes.length > 0) && (checkedBoxes.length < checkboxCount)) {
                                // collect the selected column list (map from the selected checkbox to it's value - the field name)
                                columnNames = "||" + checkedBoxes.map(function () { return $(this).val(); }).get().join('||');
                            }
                        }

                        // ensure any quotes in the constraints (full text searches really) are double escaped to prevent JSON errors, need to cover both JSON & JavaScript
                        var value = currentInput.val().replace(/\"/g, "\\\"");
                        CurrentFiltersMessage += '<<' + friendlyId + columnNames + '::' + value + '>>,';

                        friendlyId = GetAttributeNameFromThreePartId(currentInput.attr('id'));
                        SelectedDetails += "<br/><br/>" + GetResourceValue(friendlyId) + ' ' + GetOperatorFromThreePartId(currentInput.attr('id'), true) + ' ' + currentInput.val() + ', ';
                    }
                }
            }
        }

        var searchPanelCheckboxes = $("#SearchPanel input[type='checkbox']");
        if (searchPanelCheckboxes.length > 0) {
            for (var i = 0; i < searchPanelCheckboxes.length; i++) {
                var currentCheckbox = $(searchPanelCheckboxes[i]);

                // do NOT add FULLTTEXT_COLUMN checkboxes to the filter criteria, they'll get added as part of the full text search
                if (currentCheckbox.is(':checked') && !currentCheckbox.hasClass('notSearchPanelSelection') &&
                     !currentCheckbox.hasClass('searchPanelNotToggle') && GetAttributeNameFromThreePartId(currentCheckbox.attr('id')) != "FULLTEXT_COLUMN") {
                    var friendlyId = currentCheckbox.attr("id").replace(/search_panel_input_element__/gi, "")
                    SelectedDetails += "<br/><br/>" + GetResourceValue(friendlyId) + ', ';
                    CurrentFiltersMessage += '<<' + currentCheckbox.val() + '>>,';
                }
            }
        }

        var searchPanelRadios = $("#SearchPanel input[type='radio']:checked");
        if (searchPanelRadios.length > 0) {
            for (var i = 0; i < searchPanelRadios.length; i++) {
                var currentRadio = $(searchPanelRadios[i]);
                var friendlyId = currentRadio.attr("id").replace(/search_panel_input_element__/gi, "")
                SelectedDetails += "<br/><br/>" + GetResourceValue(friendlyId) + ', ';
                CurrentFiltersMessage += '<<' + currentRadio.val() + '>>,';
            }
        }
    }

    var divSelect = $('#divCurrentSelections');
    var searchPanelButton = $(".searchPanelButton", "#searchPanelRight");
    var searchPanelSelectionStrategyDiv = $('#ctl00_SearchPanel1_srchpnlSelectionStrategyDiv');

    // feedback for the user about if they have criteria selected and what to do with it
    if (SelectedDetails == '') {
        divSelect.hide();
        if (searchPanelButton.length > 0) {
            searchPanelButton.attr("disabled", "true");
            searchPanelButton.addClass("disabled");
        }
        if (searchPanelSelectionStrategyDiv.length > 0) {
            searchPanelSelectionStrategyDiv.addClass("hidden");
        }
    }
    else {
        divSelect.show();
        if (searchPanelButton.length > 0) {
            searchPanelButton.removeAttr("disabled");
            searchPanelButton.removeClass("disabled");
        }
        if (searchPanelSelectionStrategyDiv.length > 0) {
            searchPanelSelectionStrategyDiv.removeClass("hidden");
        }

        SelectedDetails = SelectedDetails.substring(10);
    }

    if (searchPanelAuto) {
        SendData();
        return false;
    }
    else {
        divSelect.html(SelectedDetails, 2000);
        setFilterHeight();
    }
}

function ProcessRanges(RangesToProcess) {
    for (var i = 0; i < RangesToProcess.length; i++) {
        var currentId = RangesToProcess[i];
        var isSelect = false; //default is input aot to a select html element
        var isDateRange = $("input[id='" + currentId + "']").hasClass('search_panel_input_element_datetime');

        var isFromSelected = false;
        var isToSelected = false;

        // get the max value
        try {
            var maxId = $("input[id='" + currentId + "']").attr('id').replace(/Min/gi, "Max");
            var minId = $("input[id='" + currentId + "']").attr('id').replace(/Max/gi, "Min");
        }
        catch (e) {
            isSelect = true;
            var maxId = $("select[id='" + currentId + "']").attr('id').replace(/Min/gi, "Max");
            var minId = $("select[id='" + currentId + "']").attr('id').replace(/Max/gi, "Min");
        }
        var friendlyId = GetResourceValue(minId.replace(/search_panel_input_element__Range:Min::/gi, ""));
        var serverId = (isDateRange ? "DATERANGE:" : "RANGE:") + minId.replace(/search_panel_input_element__Range:Min::/gi, "");

        var extraData = "";
        if ($("input[id='" + currentId + "']").hasClass("multiple_constraints")) {
            extraData = "allowMultipleConstraints";
        }

        if (!isSelect) {
            var MinVal = $("input[id='" + minId + "']").val();
            var MaxVal = $("input[id='" + maxId + "']").val();
        }
        else {
            var MinVal = $("select[id='" + minId + "']").val();
            var MaxVal = $("select[id='" + maxId + "']").val();
        }

        if (MinVal != null && MinVal != "") isFromSelected = true;
        if (MaxVal != null && MaxVal != "") isToSelected = true;

        if (isFromSelected && isToSelected) {
            SelectedDetails += "<br/><br/>" + friendlyId + ' between  ' + MinVal + '  and  ' + MaxVal + '<br>';
            CurrentFiltersMessage += '<<' + serverId + '::null::' + MinVal + '!!' + MaxVal + '::' + extraData + '>>,';
        }
        else if (isFromSelected && !isToSelected) {
            SelectedDetails += "<br/><br/>" + friendlyId + ' from  ' + MinVal + '<br>';
            CurrentFiltersMessage += '<<' + serverId + '::null::' + MinVal + '!!Null::' + extraData + '>>,';
        }
        else if (!isFromSelected && isToSelected) {
            SelectedDetails += "<br/><br/>" + friendlyId + ' up to  ' + MaxVal + '<br>';
            CurrentFiltersMessage += '<<' + serverId + '::null::null!!' + MaxVal + '::' + extraData + '>>,';
        }
    }
}

function clearSelections() {
    //check what the dropdown is set to at the moment - REPLACE, AND or OR
    var selectedQuickDateVal = $('#search_panel_selections_strategy').val();

    //if there is LM on the page clone treeview to preserve user inputs
    var arcGISControlTree = $("div[id$='tvServiceTree']");
    var arcGISControlTreeClone;
    if (arcGISControlTree.length > 0) { arcGISControlTreeClone = arcGISControlTree.clone(); }

    $('#searchPanelReset').trigger('click');

    // Ring the warning bell.
    $(document).trigger('clearedSelections');

    //restore LM user inputs
    {
        $("div[id$='tvServiceTree'] input[type=checkbox]").each(function () {
            $(this).prop('checked', $(arcGISControlTreeClone).find("#" + $(this)[0].id).prop("checked"));
        });
    }

    $('.search_panel_quickdate option:first-child').attr("selected", true);

    SearchPanelEventFilterChanged(true);
    $('.ApplyChosen').trigger('chosen:updated');
    //reset the dropdown value
    $('#search_panel_selections_strategy').val(selectedQuickDateVal);
    $('#SearchPanel').find('.applyAsANOTContstraint').removeClass('applyAsANOTContstraint');
}

///returns the resourced value of a given attribute - if it exists - else returns the input.
function GetResourceValue(attributeName) {
    var retVal = attributeName;
    try {
        var a = SearchControlAttributeKeys.indexOf(attributeName);
        if (a > -1)
            retVal = SearchControlAttributeResourceValues[SearchControlAttributeKeys.indexOf(attributeName)];
    }
    catch (e) {; };

    return retVal;
}

// what to do with the data before the grid control gets focus again for the data.
// should return the argument as expected in grid.js
function PostDataRecieveFunction(argument, thegrid) {
    var newArg = argument;

    if (argument.indexOf("**BREADCRUMB**") != -1) {
        // if the crumb has come down, then we need to empty the grid
        $(thegrid).jqGrid('clearGridData')

        //reset the grid variable _counter
        _counter = 1;

        var breadcrumbMarkup = argument.substring(argument.indexOf("**BREADCRUMB**") + 14);
        $('#ctl00_masterBreadcrumb').html(breadcrumbMarkup);
        $('#ctl00_masterBreadcrumb').show();
        $(document).trigger('CrumbLoadedEvent');
        newArg = argument.substring(0, argument.indexOf("**BREADCRUMB**"));
        var ItemMarkup = "";
        if (newArg.indexOf("**TOTALINCIDENTS**") != -1) {
            var totalIncidents = newArg.substring(argument.indexOf("**TOTALINCIDENTS**") + 18);
            if (totalIncidents == "1")
                ItemMarkup = totalIncidents + " Incident.";
            else if (totalIncidents == "0")
            { ItemMarkup = ""; }
            else
            { ItemMarkup = totalIncidents + " Incidents."; }

            newArg = newArg.substring(0, argument.indexOf("**TOTALINCIDENTS**"));
        }

        if (newArg.indexOf("**TOTALITEMS**") != -1) {
            var totalItemsFromAjaxCall = newArg.substring(argument.indexOf("**TOTALITEMS**") + 14);
            _totalItems = totalItemsFromAjaxCall;
            $('#ctl00_mainContent_gridResults_lblItemCount').html(ItemMarkup + " " + totalItemsFromAjaxCall);
            newArg = newArg.substring(0, argument.indexOf("**TOTALITEMS**"));

            if ($('#ctl00_mainContent_gridResults_divNoResults').length) {
                if (_totalItems > 0) {
                    $('#ctl00_mainContent_gridResults_divNoResults').hide();
                    $('#gbox_ctl00_mainContent_gridResults_grid1').show();
                    $('#ctl00_mainContent_gridResults_grid1').show();
                    $('#ctl00_mainContent_gridResults_btnExport_li').show();
                    $('#ctl00_mainContent_gridResults_btnExportAll_li').show();
                } else {
                    $('#ctl00_mainContent_gridResults_divNoResults').show();
                    $('#ctl00_mainContent_gridResults_grid1').hide();
                    $('#gbox_ctl00_mainContent_gridResults_grid1').hide();
                    $('#ctl00_mainContent_gridResults_btnExport_li').hide();
                    $('#ctl00_mainContent_gridResults_btnExportAll_li').hide();
                }

                var liExportAll = $("#ctl00_mainContent_gridResults_btnExportAll_li");
                if (liExportAll.length) {
                    var list = liExportAll.parent().children("li");
                    var display = false;

                    for (var i = 0; i < list.length; i++) {
                        if ($(list[i]).css("display") != "none") {
                            display = true;
                            i = list.length
                        }
                    }

                    if (display) {
                        $("#ctl00_mainContent_gridResults_btnMoreActions").show();
                    } else {
                        $("#ctl00_mainContent_gridResults_btnMoreActions").hide();
                    }
                }
            }
        }

        ////AB 31/10/14 I believe there is no need to move it anymore
        //// Move search panel down in line with gridbar
        //if ($('.gridBar:visible').length) {
        //    var goffset = $('.gridBar').position();
        //    $('#ctl00_searchPanelContainer').offset({ top: goffset.top });
        //};
    }
    else {
        newArg = argument;
    }

    if ((newArg.indexOf("total\":0") != -1) || (newArg.indexOf("total\":-1") != -1)) {
        $('#ctl00_mainContent_gridResults_lblItemCount').html(" 0 Items. " + GetResourceValue("ZeroItemsPhrase"));
        $('#itemLabel').html("");
        $('#gbox_ctl00_mainContent_gridResults_grid1').hide();
    }
    clearSelections();

    //make sure the link is available again!
    /*if ($("#ctl00_masterBreadcrumb:contains('Hide')").length == 0) {
        $('#ctl00_Breadcrumb1_divBreadcrumb').css('width', '90%');
        $('#ctl00_masterBreadcrumb').append("<div style='top:-20px; margin-right:5px; float:right;position:relative;'><a id='SearchPanelHideLink'>Hide</a><a  id='SearchPanelShowLink' style='display:none;'>Show</a>   </div>");
    }*/

    return newArg;
};

/**
Called by specific QuickDate dropdowns for searchpanel date ranges.
updates the range fields with the selected date range.
**/
function QuickDate(dropdown) {
    var selectedQuickDateVal = $(dropdown).val();
    var targetMinField = dropdown.id.replace(/QuickDate/gi, "Min");
    var targetMaxField = dropdown.id.replace(/QuickDate/gi, "Max");

    if (selectedQuickDateVal != "") {
        $('[id="' + targetMinField + '"]').val("");
        $('[id="' + targetMaxField + '"]').val("");

        var Today = new Date();
        //create new date with correct timespan
        var TargetDate = new Date(Today.getTime() - (1000 * 60 * 60 * 24 * selectedQuickDateVal));
        var formatted = $.datepicker.formatDate("D, d M, yy", TargetDate);

        $('[id="' + targetMinField + '"]').val(formatted);
        $(".datepicker").datepicker();
    }
    SearchPanelEventFilterChanged();
}
// Cookie stuff for remebering if the tab is open etc
// will be either BLOCK or HIDDEN

/*
        function checkSearchPanelCookie() {
        var ToggleStatus = getSearchPanelCookie(SEARCHPANEL_TOGGLE_STATUS);
        if (ToggleStatus != null && ToggleStatus != "") {
            if (ToggleStatus != "BLOCK") {
                $('#SearchPanelHideLink').click();
            }
        }
        else {
            setSearchPanelCookie(SEARCHPANEL_TOGGLE_STATUS, BLOCK, 365);
            }
        }

        function setSearchPanelCookie(c_name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value;
        }

        function getSearchPanelCookie(c_name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return unescape(y);
                }
            }
        }*/
/**
THIS SECTION IS A HOST FOR THE CHART PAGE SCRIPTS
REASON FOR BEING HERE - ALLOWS CHANGING OF THE SCRIPT IN DEV
its in a function which is
**/
function RunChartJS() {
    $('.LoadingDiv').each(
        function () { $(this).css("display", "none") });

    $(document).bind('SessionSearchChangedEvent', function (e) {
        $.get('chart2.aspx', function (data) {
            var z = data;
            var breadcrumbMarkup = $(data).find('#ctl00_masterBreadcrumb').first();
            var chartMarkup = $(data).find('#ctl00_mainContent_theChart_chartPanel');
            //alert('Load was performed.');
            $('#ctl00_mainContent_theChart_chartPanel').html(chartMarkup);
            $('#ctl00_masterBreadcrumb').html(breadcrumbMarkup);
            Resize();
            //
        });
    });
}

function RunLiveMapArcGISWithSearchPanelJS() {
    //hide the counter on the map page for the minute as its wrong numbers
    $('div#count').css("display", "none");
    $('#search_panel_input_element__equals__EVENT_COUNTRY').after('<br/><a style="font-size:10px;float:left;padding:4px 4px 4px 5px;"  title="Click here to select all EU countries available" onclick="SelectEUCountries();">EU Countries</a>');
    $('#search_panel_input_element__equals__EVENT_COUNTRY').after('&nbsp;<a style="font-size:10px;float:left;padding:4px 4px 4px 0px;"  title="Click here to select all NATO countries available" onclick="SelectNatoCountries();">NATO Countries</a>');
    $(".breadcrumbContainer").insertAfter(".navtabs");

    $('.LoadingDiv').each(
      function () { $(this).css("display", "none") });

    $(document).bind('SessionSearchChangedEvent', function (e) {
        CMPPostback();
    });
}

//hard coded for jticonline grid page,
// link clicked so user wants to select
function SelectEUCountries() {
    var EUCountries = "Austria, Belgium, Bulgaria, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, the Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, United Kingdom".split(', ');
    $('#search_panel_input_element__equals__EVENT_COUNTRY').val('');
    $(EUCountries).each(function () {
        var euName = this.toString();
        $('#search_panel_input_element__equals__EVENT_COUNTRY  option').each(function () {
            if (this.text == euName) {
                this.selected = true;
            }
        });
    });
    $('#search_panel_input_element__equals__EVENT_COUNTRY').change();//call this to refilter any other lists dependant on event country dd
    SearchPanelEventFilterChanged();
}

//hard coded for jticonline grid page,
// link clicked so user wants to select
function SelectNatoCountries() {
    var NatoCountries = "United States,United Kingdom,Turkey,Spain,Slovenia,Slovakia,Romania,Portugal,Poland,Norway,Netherlands,Luxembourg,Lithuania,Latvia,Italy,Iceland,Hungary,Greece,Germany,France,Estonia,Denmark,Czech Republic,Croatia,Canada,Bulgaria".split(',');
    $('#search_panel_input_element__equals__EVENT_COUNTRY').val('');
    $(NatoCountries).each(function () {
        var cName = this.toString();
        $('#search_panel_input_element__equals__EVENT_COUNTRY  option').each(function () {
            if (this.text == cName) {
                this.selected = true;
            }
        });
    });
    $('#search_panel_input_element__equals__EVENT_COUNTRY').change();//call this to refilter any other lists dependant on event country dd
    SearchPanelEventFilterChanged();
}

function hideLoadingDiv() {
    $('.LoadingDiv').each(
   function () { $(this).css("display", "none") });
    $('#Loading').each(
  function () { $(this).css("display", "none") });
}

function setFilterHeight() {
    $("#leftnavandmainarea").css("min-height", function () {
        return $('#searchPanelLeft').height() + $('#searchPanelRight').height() + 220;
    });
    $("#ctl00_searchPanelContainer").css("min-height", function () {
        return $('#searchPanelLeft').height() + $('#searchPanelRight').height();
    });
};

//put all ajax requests into a queue
// if we hit apply again we stop all processing work.

// Sticky jQuery plugin
//$(document).ready(function () {
//    var filtersOffset = $('.gridBar').offset();
//    var stickyNavTop = filtersOffset.top;
//    var stickyHeight = $('.filterContainer').height();
//    var stickyLimit = stickyNavTop + stickyHeight - 200;

//    var stickyNav = function () {
//        var scrollTop = $(window).scrollTop();

//        if (scrollTop > stickyNavTop) {
//            $('#searchPanelRight').addClass('sticky');
//            if (scrollTop > stickyLimit) {
//                $('#searchPanelRight').addClass('stickymax');
//                $('#searchPanelRight').css('top', stickyHeight - 200);
//            } else {
//                $('#searchPanelRight').removeClass('stickymax');
//                $('#searchPanelRight').css('top', '');
//            }
//        } else {
//            $('#searchPanelRight').removeClass('sticky');
//        }
//    };

//    stickyNav();

//    $(window).scroll(function () {
//        stickyNav();
//    });
//});

// Filter large select menus
// uses the UseFilterTextbox="true"  setting in searchpanel.searchpanelinput
//doesnt work yet, needs troubleshooting
$(document).ready(function () {
    jQuery.fn.filterByText = function (selectSingleMatch) {
        return this.each(function () {
            var select = this;
            var textbox = $(select).prev("input.filterbox");
            var options = [];
            $(textbox).focus(function () {
                $(textbox).removeClass("greyed").val("");
            });
            $(select).find('option').each(function () {
                options.push({ value: $(this).val(), text: $(this).text() });
            });
            $(select).data('options', options);
            $(textbox).bind('change keyup focus', function () {
                var options = $(select).empty().data('options');
                var search = $(this).val().trim();
                var regex = new RegExp(search, "gi");

                $(select).removeAttr("selected");
                $.each(options, function (i) {
                    var option = options[i];
                    if (option.text.match(regex) !== null) {
                        $(select).append(
                           $('<option>').text(option.text).val(option.value)
                        );
                    }
                });
            });
        });
    };

    $(function () {
        $('.filter').filterByText();
    });
});

//search panel list boxes can be refined based on another listbox changing, requires the xml ExtraAttribute being set in searchpanel xml
var InitialSearchPanelListItems = {}
function filterListBasedOnParentListChange(parentListId, thisListId, tagName, filterTimeBufferMilliSeconds, bZeroMatchesShowAllOptions) {
    var dueFilterTime = new Date();

    var milliseconds = dueFilterTime.getTime() + filterTimeBufferMilliSeconds;

    InitialSearchPanelListItems[thisListId + 'LastChangeMs'] = milliseconds;

    setTimeout(function () {
        filterListBasedOnParentListChangeWork(parentListId, thisListId, tagName, bZeroMatchesShowAllOptions)
    }, filterTimeBufferMilliSeconds);
}
function filterListBasedOnParentListChangeWork(parentListId, thisListId, tagName, bZeroMatchesShowAllOptions) {
    var dtNow = new Date();
    var msThen = InitialSearchPanelListItems[thisListId + 'LastChangeMs'];

    if (dtNow.getTime() < msThen)
        return;

    if (undefined == InitialSearchPanelListItems[thisListId + 'TitleHtml']) {
        InitialSearchPanelListItems[thisListId + 'TitleHtml'] = $('#' + thisListId).parent().children(".search_panel_input_title").html();
    }
    else {
        UpdateSearchPanelListBoxTitle(thisListId, InitialSearchPanelListItems[thisListId + 'TitleHtml']);
    }

    //reset the timestamp
    InitialSearchPanelListItems[thisListId + 'LastChange'] = Date.now;

    //cache the initial list before filtering
    if (undefined == InitialSearchPanelListItems[thisListId]) {
        InitialSearchPanelListItems[thisListId] = $("#" + thisListId).html();
    }

    var newList = [];
    $("#" + parentListId + " > option:selected").each(function () {
        //cw('SELECTED OPTION FROM PARENT: ' + this.value);
        var thisMarketName = this.value.split("::")[2];

        //loop[ thru each target option checking for the TagName contains parent value
        // NOTE, custom tag MAY have comma separated values

        $(InitialSearchPanelListItems[thisListId]).each(function () {
            // $('#' + thisListId + '> option').each(function () {
            var tagValue = $(this).attr(tagName);
            try {
                if (tagValue == thisMarketName) {
                    newList.push(this);
                }
            }
            catch (e) {
                //cw('error: ' + e.description);
            }
        });
    });

    if (bZeroMatchesShowAllOptions && newList.length == 0) {
        $('#' + thisListId).html(InitialSearchPanelListItems[thisListId]);
    }
    else {
        // set the listbox to the new list of options
        $('#' + thisListId).html(newList);

        // generate a link

        var removeFilterLink = "<a class='clearFilterAnchor' onclick='RemoveSearchPanelExtraDataFilter(this,\"" + thisListId + "\",\"" +
            $('#' + thisListId).parent().children(".search_panel_input_title").html() + "\")'>(Show All)</a>";
        $('#' + thisListId).parent().children(".search_panel_input_title").html(InitialSearchPanelListItems[thisListId + 'TitleHtml'] + "&nbsp;" + removeFilterLink);
        $('#' + thisListId).trigger("chosen:updated");
    }
}

function RemoveSearchPanelExtraDataFilter(hyperlink, thisListId, newMarkup) {
    $('#' + thisListId).html(InitialSearchPanelListItems[thisListId]);
    UpdateSearchPanelListBoxTitle(thisListId, newMarkup);
}
function UpdateSearchPanelListBoxTitle(thisListId, newMarkup) {
    $('#' + thisListId).parent().children(".search_panel_input_title").html(newMarkup);
}