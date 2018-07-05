var countTemplate = '';
var countURL = '';
var countLayerId = '';
var countlayer = '';

function InitCount() {
    //There should be only one service/layer with displayCountTemplate set per active service
    countTemplate = "";
    countLayerId = "";
    countURL = "";
    countlayer = "";

    for (var i = 0; i < lmArcGISConfig.services.service.length; i++)
    {
        if (lmArcGISConfig.services.service[i].id == activeNodeServiceData.ServiceID
            && lmArcGISConfig.services.service[i].displayCountTemplate != "")
            {
                countTemplate = lmArcGISConfig.services.service[i].displayCountTemplate;
                countTemplate = countTemplate.replace('[title]', lmArcGISConfig.services.service[i].title);
                countLayerId = lmArcGISConfig.services.service[i].selection_filter_query_layer_id;
                countURL = lmArcGISConfig.services.service[i].url;
                countlayer = arcGISControlMap.getLayer(lmArcGISConfig.services.service[i].id);
                break;
            }
        else {
            if (lmArcGISConfig.services.service[i].id == activeNodeServiceData.ServiceID
                && lmArcGISConfig.services.service[i].layers != null) {
                for (var j = 0; j < lmArcGISConfig.services.service[i].layers.length; j++) {
                    if (lmArcGISConfig.services.service[i].layers[j].id == activeNodeServiceData.LayerID
                        && lmArcGISConfig.services.service[i].layers[j].displayCountTemplate != "")
                        {
                            countTemplate = lmArcGISConfig.services.service[i].layers[j].displayCountTemplate;
                            countTemplate = countTemplate.replace('[title]', lmArcGISConfig.services.service[i].layers[j].title);
                            countLayerId = lmArcGISConfig.services.service[i].layers[j].id;
                            countURL = lmArcGISConfig.services.service[i].url;
                            countlayer = arcGISControlMap.getLayer(lmArcGISConfig.services.service[i].id);
                            break;
                            break;
                        }
                }
            }
        }
    }

    if (countLayerId == '') countLayerId = '0';
    countURL = countURL + '/' + countLayerId;
}

//Set selected layer count from here
function SetCount() {
    if (countTemplate != "") {

        var where = "";

        $("#divRecordCounter").text("Retrieving count");

        if (countlayer && countlayer.layerDefinitions) { where = countlayer.layerDefinitions[countLayerId]; }
        if (where == "") where = "1 = 1";

        var queryTask = new esri.tasks.QueryTask(countURL); 
        var query = new esri.tasks.Query();
        query.where = where;
        queryTask.executeForCount(query,
            function (count) {
                $("#divRecordCounter").text(countTemplate.replace("[count]", count));
            },
            function (error) {
                //console.log(error);
                $("#divRecordCounter").text("Unable to retrieve count");
            }
        )
    }
    else {
        $("#divRecordCounter").text("");
    }
}