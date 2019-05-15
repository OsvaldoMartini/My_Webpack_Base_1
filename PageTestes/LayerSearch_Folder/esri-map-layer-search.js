var map, layersearch;

require([
  "esri/map",
  "application/LayerSearch",
  "dojo/on",
  "esri/symbols/SimpleMarkerSymbol",
  "dojo/_base/Color",
  "esri/InfoTemplate",
  "esri/graphic",
  "esri/geometry/Extent",
  "esri/geometry/Multipoint",
  "esri/geometry/Polygon",
  "esri/geometry/Polyline",
  "esri/geometry/ScreenPoint",
  "esri/layers/FeatureLayer",
  "esri/layers/ArcGISDynamicMapServiceLayer",

  "dojo/domReady!"
], function(
  Map,
  LayerSearch,
  on,
  SimpleMarkerSymbol,
  Color,
  InfoTemplate,
  Graphic,
  Extent,
  Multipoint,
  Polygon,
  Polyline,
  ScreenPoint,
  FeatureLayer,
  AGSDMSLayer
) {
  map = new Map("map", {
    basemap: "gray",
    center: [-120.435, 46.159], // lon, lat
    zoom: 7
  });

  map.addLayer(
    new AGSDMSLayer(
      "http://tmservices1.esri.com/arcgis/rest/services/LiveFeeds/Wildfire_Activity/MapServer/",
      {
        id: "fireLayer"
      }
    )
  );
  var windLayer = map.addLayer(
    new FeatureLayer(
      "http://tmservices1.esri.com/arcgis/rest/services/LiveFeeds/NOAA_METAR_current_wind_speed_direction/MapServer/0/",
      {
        outFields: ["WIND_DIRECT"],
        id: "windLayer"
      }
    )
  );
  windLayer.on("load", function(response) {
    response.layer.renderer.setRotationInfo({
      field: "WIND_DIRECT",
      type: "geographic"
    });
  });

  var layerSearchers = setupLayerSearchers();

  var lsOptions = setupLSOptions(layerSearchers);

  layersearch = new LayerSearch(lsOptions, "search");
  layersearch.startup();

  // on search results
  on(layersearch, "find-results", function(results) {
    console.log("search", results);
  });

  // on search results
  on(layersearch, "featuresearch-select", function(results) {
    console.log("onselect", results);
  });

  // on search results
  on(layersearch, "auto-complete", function(results) {
    console.log("autocomplete", results);
  });

  // on params
  on(layersearch, "select", function(results) {
    console.log("params", results);
  });

  layersearch.on("load", function() {});

  function setupLayerSearchers() {
    return [
      {
        name: "Search fire names in wildfire activity", // name for dropdown menu
        placeholder: "Find fires",
        qLayerId: "fireLayer",
        //qFields: ['FIRE_NAME', 'Fire name'], // field(s) to search on. if blank on a dynamic map service, it searches all fields. if blank on a feature layer, it doesn't search.
        qLayerLayers: [0, 1, 3], // sublayer(s) to search on for dynamic map service. do not include this param for a feature layer
        qOIDField: ["OBJECTID", "OBJECTID", "OBJECTID"], // need objectId field for each of the layers.
        //qOutfields: ['STATE'], // any fields needed below besides qFields and qOIDField. only necessary for featureLayer. ignored for dynamicMapService.
        qLabelFunction: function(feat, lyrNum) {
          // returns string for autocomplete dropdown. in a featureLayer, all fields used below must be in the qFields, qOIDField, and qOutfields options above -- otherwise those attributes won't be returned with the feature query.
          switch (lyrNum) {
            case 0:
            case 1:
              return (
                (feat.FIRE_NAME || feat["Fire name"]) +
                " fire in " +
                (feat.STATE || feat.State)
              );
            case 3:
              return feat.FIRE_NAME + " fire perimeter, " + feat.UNIT_ID;
            default:
              return "Unknown fire name";
          }
        }
      },
      {
        name: "Search station names in windspeed reports",
        placeholder: "Find stations",
        qLayerId: "windLayer",
        qFields: ["STATION_NAME"],
        qOIDField: "OBJECTID",
        qOutfields: ["COUNTRY"],
        qLabelFunction: function(feat) {
          return feat.STATION_NAME + " station in " + feat.COUNTRY;
        }
      }
    ];
  }

  function setupLSOptions(lsArr) {
    return {
      map: map,
      minCharacters: 3,
      autoNavigate: true,
      autoComplete: true,
      theme: "invertedLayerSearcher",
      layerSearchers: lsArr
    };
  }
});
