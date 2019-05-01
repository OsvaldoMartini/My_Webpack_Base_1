require([
    "esri/views/MapView",
    "esri/Map",
    "esri/layers/FeatureLayer",
    "esri/layers/support/Field",
    "esri/geometry/Point",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/dom",
    "dojo/on",
    "dojo/domReady!"
  ], function(MapView, Map, FeatureLayer, Field, Point,
    SimpleRenderer, SimpleMarkerSymbol,
    dom, on
  ) {

    var lyr, legend;
    var data; var graphics;

    /**************************************************
     * Define the specification for each field to create
     * in the layer
     **************************************************/

    var fields = [
    {
      name: "ObjectID",
      alias: "ObjectID",
      type: "oid"
    }, {
      name: "name",
      alias: "name",
      type: "string"
    },
    {
      name: "lat",
      alias: "lat",
      type: "number"
    },
    {
      name: "lng",
      alias: "lng",
      type: "number"
    }];


    /**************************************************
     * Create the map and view
     **************************************************/

    var map = new Map({
      basemap: "streets",
      ground: "world-elevation"
    });

    // Create MapView
    var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-73.994909, 40.739041],
      zoom: 14
    });


    var pointsRenderer = new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        style: "circle",
        size: 20,
        color: [211, 255, 0, 0],
        outline: {
          width: 1,
          color: "#FF0055",
          style: "solid"
        }
      })
    });

    view.then(function() {
      // Request the earthquake data from USGS when the view resolves
      data = getData();
      graphics = createGraphics(data); // then send it to the createGraphics() method
      lyr = createLayer(graphics); // when graphics are created, create the layer
      lyr.source.add({
          geometry: new Point({
            x: -73.983013,
            y: 40.741236
          }),
          // select only the attributes you care about
          attributes: {
            ObjectID: 4,
            name: "Unit-4",
            lat: 40.741236,
            lng: -73.983013
          }
      });
    });

    // Request the earthquake data
    function getData() {
      return [{
        ObjectID: 1,
        name: "Unit-1",
        lat: 40.739041,
        lng: -73.994909
      },
      {
        ObjectID: 2,
        name: "Unit-2",
        lat: 40.742102,
        lng: -73.985043
      },
      {
        ObjectID: 3,
        name: "Unit-3",
        lat: 40.742856,
        lng: -73.984965
      }];
    }

    /**************************************************
     * Create graphics with returned geojson data
     **************************************************/
    function createGraphics(response) {
      // raw GeoJSON data
      var geoJson = response;

      // Create an array of Graphics from each GeoJSON feature
      return geoJson.map(function(m, i) {
        return {
          geometry: new Point({
            x: m.lng,
            y: m.lat
          }),
          // select only the attributes you care about
          attributes: {
            ObjectID: i,
            name: m.name,
            lat: m.lat,
            lng: m.lng
          }
        };
      });
    }

    /**************************************************
     * Create a FeatureLayer with the array of graphics
     **************************************************/
    function createLayer(graphics) {
      var layer = new FeatureLayer({
        supportsEditing: true,
        supportsAdd: true,
        source: graphics, // autocast as an array of esri/Graphic
        // create an instance of esri/layers/support/Field for each field object
        fields: fields, // This is required when creating a layer from Graphics
        objectIdField: "ObjectID", // This must be defined when creating a layer from Graphics
        renderer: pointsRenderer, // set the visualization on the layer
        spatialReference: {
          wkid: 4326
        },
        geometryType: "point" // Must be set when creating a layer from Graphics
      });

      map.add(layer);
      return layer;
    }
  });