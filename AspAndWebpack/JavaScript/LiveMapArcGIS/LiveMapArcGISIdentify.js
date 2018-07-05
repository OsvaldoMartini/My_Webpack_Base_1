var identifyEvent, identifyIsOn, identifyTask, identifyParams, identifyHandler, canIdentify;
var visibleIdentifyResult = 0;
var totalIdentifyResult = 0;
var identifyTable = null;


// Toggle identify function
function ToggleIdentify(serviceData) {
    if (activeNodeServiceData) {
        if (!identifyIsOn) {
            initIdentify(activeNodeServiceData);
            identifyHandler = dojo.connect(arcGISControlMap, "onClick", identify);
            arcGISControlMap.setMapCursor('crosshair');
            $("#identify").addClass('pressedButton');
        }
        else {
            dojo.disconnect(identifyHandler);
            arcGISControlMap.setMapCursor('default');
            $("#identify").removeClass('pressedButton');
        }
        identifyIsOn = !identifyIsOn;
    }
    else {
        alert('There is no active layer!');
    }
}


//Initi identify upon service/layer activation
function initIdentify(serviceData) {
    var serviceConfig = GetServiceConfig(serviceData.ServiceID);
    canIdentify = serviceConfig.can_identify;

    if (canIdentify) {
        identifyTask = new esri.tasks.IdentifyTask(serviceConfig.url);
        identifyParams = new esri.tasks.IdentifyParameters();
        identifyParams.tolerance = 3;
        identifyParams.layerDefinitions = arcGISControlMap.getLayer(serviceData.ServiceID).layerDefinitions;
        identifyParams.returnGeometry = true;

        if (serviceData.LayerID != null) {
            identifyParams.layerIds = GetLinkedLayerIds(serviceData.ServiceID, serviceData.LayerID);
        }

        //arcGISControlMap.infoWindow.setTitle("Identify Results");
    }
}

function identify(evt) {
    if (canIdentify) {
        identifyParams.geometry = evt.mapPoint;
        identifyParams.mapExtent = arcGISControlMap.extent;
        identifyParams.width = arcGISControlMap.width;
        identifyParams.height = arcGISControlMap.height;
        identifyEvent = evt;
        setLoading(true);
        var w = 350;
        var h = 225;
        if (arcGISControlMap.width / 2 < w) {
            w = arcGISControlMap.width / 2;
        }
        if (arcGISControlMap.height / 2 < h) {
            h = (arcGISControlMap.height / 2) - 44;
        }

        arcGISControlMap.infoWindow.resize(w, h);
        identifyTask.execute(identifyParams, identifyCallback, identifyErrback);
    }
    else {
        alert('Identify is not setup for this service.');
    }
}

function ToggleIdentifyResult(alreadyDisabled, increment) {
    if (!alreadyDisabled) {
        visibleIdentifyResult = visibleIdentifyResult + increment;
        $(".identifyResult").hide();
        $("#identifyResult" + (visibleIdentifyResult)).show();

        if (visibleIdentifyResult == 0) {
            $('#previousIdentifyResult').addClass('disabled');
        }
        else {
            $('#previousIdentifyResult').removeClass('disabled');
        }

        if (visibleIdentifyResult == (totalIdentifyResult - 1)) {
            $('#nextIdentifyResult').addClass('disabled');
        }
        else {
            $('#nextIdentifyResult').removeClass('disabled');
        }

        $("#currentIdentifyRecord").html(visibleIdentifyResult + 1);
    }
}

function identifyCallback(identifyResults) {
    visibleIdentifyResult = 0;
    identifyTable = null;

    if (identifyResults && (identifyResults.length > 0 && !(totalIdentifyResult == 1 && identifyResults[0].value == "NoData"))) {
        totalIdentifyResult = identifyResults.length;
        var content = '';

        if (totalIdentifyResult > 0) {
            $("#additionalIdentifyDetails").remove();

            if (totalIdentifyResult > 1) {
                $("#arcGISControlMap_infowindow .title[dojoAttachPoint='_title']").append('<span id=\"additionalIdentifyDetails\">' + totalIdentifyResult + ' results found. #<span id=\"currentIdentifyRecord\"></span>&nbsp;<img id=\"previousIdentifyResult\" class=\"disabled\" src=\"/App_Themes/Default/Images/clear.gif\" onclick=\"ToggleIdentifyResult($(this).hasClass(\'disabled\'), -1)\" />&nbsp;<img id=\"nextIdentifyResult\" src=\"/App_Themes/Default/Images/clear.gif\" onclick=\"ToggleIdentifyResult($(this).hasClass(\'disabled\'), 1)\" /></span>');
            }
            else {
                $("#arcGISControlMap_infowindow .title[dojoAttachPoint='_title']").append('<span id=\"additionalIdentifyDetails\">' + totalIdentifyResult + ' results found. #<span id=\"currentIdentifyRecord\"></span>&nbsp;<img id=\"previousIdentifyResult\" class=\"disabled\" src=\"/App_Themes/Default/Images/clear.gif\" onclick=\"ToggleIdentifyResult($(this).hasClass(\'disabled\'), -1)\" />&nbsp;<img id=\"nextIdentifyResult\" class=\"disabled\" src=\"/App_Themes/Default/Images/clear.gif\" onclick=\"ToggleIdentifyResult($(this).hasClass(\'disabled\'), 1)\" /></span>');
            }

            $("#currentIdentifyRecord").html(1);
        }

        var show = 'block';
        identifyTable = GetLayerOrServiceConfiguration(activeNodeServiceData, 'identify_table');

        if (identifyTable.sort_column_name) {
            identifyResults.sort(SortIdentifyResults);
            if (identifyTable.sort_column_direction && identifyTable.sort_column_direction == "descending") identifyResults.reverse();
        }


        for (var i = 0; i < identifyResults.length; i++) {
            if (i > 0) {
                show = 'none';
            }
            content += '<div id=\"identifyResult' + i + '\" class=\"identifyResult\" style=\"display:' + show + '\"><table>'

            if (identifyTable) {

                //Make sure we have ditinct rows over configured layer columns
                //Find and replace all values in all temnplates
                for (var itRowIndex = 0 ; itRowIndex < identifyTable.identify_row.length; itRowIndex++) {
                    var rowTitle = identifyTable.identify_row[itRowIndex].title;
                    var rowValue = identifyTable.identify_row[itRowIndex].value_template;

                    for (var resultColumnName in identifyResults[i].feature.attributes) {
                        //var stringToReplace = RegExp.escape("[" + resultColumnName + "]");
                        //var regExExp = new RegExp(stringToReplace, "g");
                        //rowValue = rowValue.replace(regExExp, identifyResults[i].feature.attributes[resultColumnName]);

                        var stringToReplace = "[" + resultColumnName + "]";

                        while (rowValue.indexOf(stringToReplace) > -1)
                        {
                            rowValue = rowValue.replace(stringToReplace, identifyResults[i].feature.attributes[resultColumnName]);
                        }
                    }
                    content += '<tr><td>' + rowTitle + '</td><td>: ' + rowValue + '</td></tr>';
                }
            }
            else {
                content += '<tr><td>No identify column(s) specified </td><td></td></tr>';
            }
            content += '</table></div>';
        }
        arcGISControlMap.infoWindow.setContent(content);
        arcGISControlMap.infoWindow.show(identifyEvent.screenPoint, arcGISControlMap.getInfoWindowAnchor(identifyEvent.screenPoint));
    }
    else {
        alert("No results found.");
    }
    setLoading(false);
}

function SortIdentifyResults(a, b) {
    var a1 = a.feature.attributes[identifyTable.sort_column_name];
    var b1 = b.feature.attributes[identifyTable.sort_column_name];
    var retVal = 0;

    if (a1 < b1) retVal = -1
    else if (a1 > b1) retVal = 1

    return retVal
}

function identifyErrback(error) {
    alert("Identify Error: " + error.message);
    setLoading(false);
}
