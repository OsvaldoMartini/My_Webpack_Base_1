var map;
require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/InfoTemplate",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/renderers/UniqueValueRenderer",
  "esri/Color",
  "dojo/domReady!"
], function(
  Map,
  FeatureLayer,
  InfoTemplate,
  SimpleLineSymbol,
  SimpleFillSymbol,
  UniqueValueRenderer,
  Color
) {
  map = new Map("map", {
    basemap: "streets",
    center: [-95.625, 39.243],
    zoom: 4,
    slider: false
  });
  map.on("load", addFeatureLayer);

  function addFeatureLayer() {
    var defaultSymbol = new SimpleFillSymbol().setStyle(
      SimpleFillSymbol.STYLE_NULL
    );
    defaultSymbol.outline.setStyle(SimpleLineSymbol.STYLE_NULL);

    //create renderer
    var renderer = new UniqueValueRenderer(defaultSymbol, "SUB_REGION");

    //add symbol for each possible value
    renderer.addValue(
      "Pacific",
      new SimpleFillSymbol().setColor(new Color([255, 0, 0, 0.5]))
    );
    renderer.addValue(
      "Mtn",
      new SimpleFillSymbol().setColor(new Color([0, 255, 0, 0.5]))
    );
    renderer.addValue(
      "N Eng",
      new SimpleFillSymbol().setColor(new Color([0, 0, 255, 0.5]))
    );
    renderer.addValue(
      "S Atl",
      new SimpleFillSymbol().setColor(new Color([255, 0, 255, 0.5]))
    );
    renderer.addValue(
      "Mid Atl",
      new SimpleFillSymbol().setColor(new Color([255, 255, 255, 0.75]))
    );
    renderer.addValue(
      "E N Cen",
      new SimpleFillSymbol().setColor(new Color([0, 255, 255, 0.5]))
    );
    renderer.addValue(
      "W N Cen",
      new SimpleFillSymbol().setColor(new Color([255, 255, 0, 0.5]))
    );
    renderer.addValue(
      "E S Cen",
      new SimpleFillSymbol().setColor(new Color([127, 127, 127, 0.5]))
    );
    renderer.addValue(
      "W S Cen",
      new SimpleFillSymbol().setColor(new Color([0, 0, 0, 0.5]))
    );

    var featureLayer = new FeatureLayer(
      "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer/1",
      {
        infoTemplate: new InfoTemplate(" ", "${SUB_REGION}"),
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["SUB_REGION"]
      }
    );

    featureLayer.setRenderer(renderer);
    map.addLayer(featureLayer);
  }
});
