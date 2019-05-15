require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/dijit/PopupTemplate",
    "esri/dijit/Legend",
    "dojo/domReady!"
  ], function(Map, FeatureLayer, PopupTemplate, Legend
  ) {

    var map = new Map("viewDiv", {
      basemap: "dark-gray-vector",
      center: [ -73.92872, 40.71321 ],
      zoom: 11
    });

    // Enable clustering in the layer's constructor
    // and add the layer to the map

    var serviceUrl = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/nyc_parks_gardens_hist_sites/FeatureServer/0";
    var layer = new FeatureLayer(serviceUrl, {
      outFields: [ "facname", "proptype", "factype", "address" ],
      featureReduction: {
        type: "cluster"
      },
      infoTemplate: new PopupTemplate({
        title: "{facname}",
        description: "{proptype} {factype} on {address}."
      })
    });
    map.addLayer(layer);

    map.on("load", function(evt){
      var legend = new Legend({
        map: map,
        layerInfos: [{
          layer: layer,
          title: "Parks and historic sites"
        }]
      }, "legendDiv");
      legend.startup();
    });

  });
