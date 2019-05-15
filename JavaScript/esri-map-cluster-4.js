self.map = null;

require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/renderers/smartMapping",
  "esri/renderers/UniqueValueRenderer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "esri/dijit/Legend",
  "esri/dijit/PopupTemplate",
  "esri/symbols/PictureMarkerSymbol",
  "dojo/dom-style",
  "dojox/widget/ColorPicker",
  "dojo/domReady!"
], function(
  Map,
  FeatureLayer,
  smartMapping,
  UniqueValueRenderer,
  SimpleRenderer,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  Color,
  Legend,
  PopupTemplate,
  PictureMarkerSymbol,
  domStyle,
  ColorPicker
) {
  // The expressionInfos reference Arcade expressions and
  // assign each of them a title and name. The name is used
  // to reference it in the PopupTemplate and the title is
  // used to describe the value in the popup and legend.

  var arcadeExpressionInfos = [
    {
      name: "arcade-time-reported",
      title: "Time of incident report",
      expression: document.getElementById("arcade-time-reported").text
    },
    {
      name: "arcade-days-overdue",
      title:
        "Number of days incident resolution was overdue at time of closure",
      expression: document.getElementById("arcade-days-overdue").text
    },
    {
      name: "arcade-overdue-text",
      title: "to display in popup",
      expression: document.getElementById("arcade-overdue-text").text
    },
    {
      name: "arcade-age-days",
      title: "Age of incident in days at time of closure",
      expression: document.getElementById("arcade-age-days").text
    }
  ];

  function getArcadeExpressionByName(name) {
    // find() isn't supported in IE
    return arcadeExpressionInfos.filter(function(info) {
      return info.name === name;
    })[0];
  }

  // Create FeatureLayer instance with popupTemplate
  // Note the Arcade expression placeholders used in the text and fieldInfos
  // e.g. {expression/predominance-arcade}
  // Expression names are defined in the expressionInfos property

  var serviceUrl =
    "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/311_Service_Requests_from_2015_50k/FeatureServer/0";
  var layer = new FeatureLayer(serviceUrl, {
    outFields: ["Created_Date", "Due_Date", "Closed_Date", "Complaint_Type"],
    infoTemplate: new PopupTemplate({
      title: "{Complaint_Type}",
      description: [
        "<b>Time of day:</b> {expression/arcade-time-reported}<br>",
        "<b>Days it took to close incident:</b> {expression/arcade-age-days}<br>",
        "{expression/arcade-overdue-text}<br>"
      ].join(""),
      fieldInfos: [
        {
          fieldName: "expression/arcade-age-days",
          format: {
            digitSeparator: true,
            places: 0
          }
        }
      ],
      expressionInfos: arcadeExpressionInfos
    }),
    // enable clustering for the layer
    featureReduction: {
      type: "cluster"
    }
  });

  self.map = new Map("viewDiv", {
    basemap: "gray",
    center: [-73.90245, 40.68563],
    zoom: 12
  });

  self.map.addLayer(layer);

  var iconPath1 =
    "M.87 15.83c-.2 0-.36-.08-.5-.2-.12-.14-.2-.3-.2-.5V.87c0-.38.32-.7.7-.7h14.26c.4 0 .7.32.7.7v14.26c0 .4-.32.7-.7.7H.87z";
  var iconPath2 =
    "M9.1 5.74l1.75-1.52.27.03 2.3-1.67-1.64 2.34.04.3-1.56 1.73V12l-1.07.45L7.47 9.7l-1.6 1.1.4 2.32-.33.3-1.4-1.92-1.98-1.45.33-.3 2.42.48.97-1.67-2.53-1.92.26-.9H9.1";
  var initColor = "#0066b3";

  function createSymbolMarkers(iconPath1, iconPath2, color) {
    var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
    markerSymbol.setPath(iconPath1);
    markerSymbol.setPath(iconPath2);
    markerSymbol.setColor(new dojo.Color(color));
    markerSymbol.setOutline(null);
    return markerSymbol;
  }

  var colorPicker = new ColorPicker({}, "picker1");
  colorPicker.setColor(initColor);
  domStyle.set(colorPicker, "left", "500px");
  colorPicker.on("change", function() {
    var colorCode = this.hexCode.value;
    self.map.graphics.graphics.forEach(function(graphic) {
      graphic.setSymbol(createSymbolMarkers(iconPath1, iconPath2, colorCode));
    });
  });

  // Creates a SimpleMarkerSymbol based on an input color
  function createSymbol(color) {
    var outline = new SimpleLineSymbol()
      .setColor(new Color([128, 128, 128, 0.5]))
      .setWidth(0.5);

    return (
      new SimpleMarkerSymbol()
        .setPath(iconPath2)
        //("M//.87 15.83c-.2 0-.36-.08-.5-.2-.12-.14-.2-.3-.2-.5V.87c0-.38.32-.7.7-.7h14.26c.4 0 .7.32.7.7v14.26c0 .4-.32.7-.7.7H.87z")
        .setSize(6)
        .setColor(new Color(color))
        .setOutline(outline)
    );
  }

  var pictureMarkerSymbolBaseAir = new PictureMarkerSymbol({
    url: "/Assets/Images/Map/Markers/" + "BaseAir" + ".svg", //"http://localhost:57677/Map/icon/" + entity.Type,
    contentType: "image/svg+xml"
  });

  var pictureMarkerSymbolBaseLand = new PictureMarkerSymbol({
    url: "/Assets/Images/Map/Markers/" + "BaseLand" + ".svg", //"http://localhost:57677/Map/icon/" + entity.Type,
    contentType: "image/svg+xml"
  });

  // Configure three renderers for exploring the data

  var timeReportedRenderer = new UniqueValueRenderer({
    valueExpression: getArcadeExpressionByName("arcade-time-reported")
      .expression,
    valueExpressionTitle: getArcadeExpressionByName("arcade-time-reported")
      .title,
    defaultSymbol: createSymbol("lightgray"),
    defaultLabel: "None",
    uniqueValueInfos: [
      {
        value: "Morning",
        symbol: createSymbol("#A7C636"),
        label: "Morning (6 am - 11 am)"
      },
      {
        value: "Midday",
        symbol: createSymbol("#FC921F"),
        label: "Midday (11 am - 1 pm)"
      },
      {
        value: "Afternoon",
        symbol: createSymbolMarkers(iconPath1, iconPath2, initColor), //createSymbol("#003300"),
        label: "Afternoon (1 pm - 5 pm)"
      },
      {
        value: "Evening",
        symbol: createSymbol("#149ECE"),
        label: "Evening (5 pm - 10 pm)"
      },
      {
        value: "Night",
        symbol: createSymbol("#9E559C"),
        label: "Night (10 pm - 6 am)"
      }
    ]
  });

  var ageRenderer = new SimpleRenderer({
    symbol: createSymbol("gray"),
    visualVariables: [
      {
        type: "colorInfo",
        valueExpression: getArcadeExpressionByName("arcade-age-days")
          .expression,
        valueExpressionTitle: getArcadeExpressionByName("arcade-age-days")
          .title,
        stops: [
          { value: 0, color: [255, 252, 212], label: "< 0" },
          { value: 15, color: [177, 205, 194], label: null },
          { value: 30, color: [98, 158, 176], label: "30" },
          { value: 45, color: [56, 98, 122], label: null },
          { value: 60, color: [13, 38, 68], label: "> 60" }
        ]
      }
    ]
  });

  var overdueRenderer = new SimpleRenderer({
    symbol: createSymbol("gray"),
    visualVariables: [
      {
        type: "colorInfo",
        valueExpression: getArcadeExpressionByName("arcade-days-overdue")
          .expression,
        valueExpressionTitle: getArcadeExpressionByName("arcade-days-overdue")
          .title,
        stops: [
          { value: -5, color: [5, 113, 176], label: "< -5 days (early)" },
          { value: -2.5, color: [146, 197, 222], label: null },
          { value: 0, color: [247, 247, 247], label: "0 (on time)" },
          { value: 2.5, color: [244, 165, 130], label: null },
          { value: 5, color: [202, 0, 32], label: "> 5 days (overdue)" }
        ]
      }
    ]
  });

  var rendererInfos = {
    "arcade-time-reported": timeReportedRenderer,
    "arcade-age-days": ageRenderer,
    "arcade-days-overdue": overdueRenderer
  };

  self.map.on("load", function(evt) {
    var legend = new Legend(
      {
        map: self.map,
        layerInfos: [
          {
            layer: layer,
            title: "311 calls (2015)"
          }
        ]
      },
      "legendDiv"
    );
    legend.startup();

    var rendererSelect = document.getElementById("renderer-select");
    layer.setRenderer(rendererInfos[rendererSelect.value]);

    rendererSelect.addEventListener("click", function(event) {
      console.log("rendererSelect", newValue);
      var newValue = event.target.value;
      var newRenderer = rendererInfos[newValue];
      layer.setRenderer(newRenderer);
      layer.redraw();
      legend.refresh();
    });

    var complaintSelect = document.getElementById("complaint-type-select");
    complaintSelect.addEventListener("change", function(event) {
      var newValue = event.target.value;
      var defExp = newValue ? "Complaint_Type = '" + newValue + "'" : null;
      console.log("layer.setDefinitionExpression:", defExp);

      layer.setDefinitionExpression(defExp);
      self.map.infoWindow.hide();
    });

    var clusteringCheckbox = document.getElementById("use-clustering");
    // toggles clustering on and off in sync with the checkbox
    clusteringCheckbox.addEventListener("click", function(event) {
      var checked = event.target.checked;
      toggleFeatureReduction(checked);
    });

    createComplaintTypeRenderer();
  });

  // Sets feature reduction on the layer if not previously done so.
  // If indicated, then feature reduction is disabled. The initial
  // feature reduction settings are enabled if indicated.
  function toggleFeatureReduction(yes) {
    if (yes) {
      if (!layer.getFeatureReduction()) {
        layer.setFeatureReduction({
          type: "cluster"
        });
      } else {
        layer.enableFeatureReduction();
      }
    } else {
      layer.disableFeatureReduction();
    }
  }

  function createComplaintTypeRenderer() {
    return smartMapping
      .createTypeRenderer({
        basemap: "gray",
        layer: layer,
        field: "Complaint_Type"
      })
      .then(function(response) {
        var renderer = response.renderer;
        console.log("renderer", renderer);
        rendererInfos["complaint-type"] = renderer;
        var complaintSelect = document.getElementById("renderer-select");
        var option = document.createElement("option");
        option.text = "Complaint Type";
        option.value = "complaint-type";
        complaintSelect.add(option);

        console.log("renderer.values", renderer.values);
        addOptionsToSelect("complaint-type-select", renderer.values);
      });
  }

  function addOptionsToSelect(id, values) {
    var select = document.getElementById(id);
    var option = document.createElement("option");
    option.text = "Show all";
    option.value = "";
    option.selectedIndex = "3";
    select.add(option);
    values.forEach(function(value) {
      var option = document.createElement("option");
      option.value = value;
      option.text = value;
      select.add(option);
    });
  }
});
