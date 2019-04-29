require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Expand",
    "esri/request",
    "esri/layers/FeatureLayer",
    "esri/PopupTemplate",
    "esri/Graphic"
  ], function(
    esriConfig,
    Map,
    MapView,
    Expand,
    request,
    FeatureLayer,
    PopupTemplate,
    Graphic
  ) {
    var portalUrl = "https://www.arcgis.com";

    document
      .getElementById("uploadForm")
      .addEventListener("change", function(event) {
        var fileName = event.target.value.toLowerCase();

        if (fileName.indexOf(".zip") !== -1) {
          //is file a zip - if not notify user
          generateFeatureCollection(fileName);
        } else {
          document.getElementById("upload-status").innerHTML =
            '<p style="color:red">Add shapefile as .zip file</p>';
        }
      });

    var map = new Map({
      basemap: "dark-gray"
    });

    var view = new MapView({
      center: [-41.647, 36.41],
      zoom: 3,
      map: map,
      container: "viewDiv"
    });

    var fileForm = document.getElementById("mainWindow");

    var expand = new Expand({
      expandIconClass: "esri-icon-upload",
      view: view,
      content: fileForm
    });

    view.ui.add(expand, "top-right");

    function generateFeatureCollection(fileName) {
      var name = fileName.split(".");
      // Chrome and IE add c:\fakepath to the value - we need to remove it
      // see this link for more info: http://davidwalsh.name/fakepath
      name = name[0].replace("c:\\fakepath\\", "");

      document.getElementById("upload-status").innerHTML =
        "<b>Loading </b>" + name;

      // define the input params for generate see the rest doc for details
      // http://www.arcgis.com/apidocs/rest/index.html?generate.html
      var params = {
        name: name,
        targetSR: view.spatialReference,
        maxRecordCount: 1000,
        enforceInputFileSizeLimit: true,
        enforceOutputJsonSizeLimit: true
      };

      // generalize features to 10 meters for better performance
      params.generalize = true;
      params.maxAllowableOffset = 10;
      params.reducePrecision = true;
      params.numberOfDigitsAfterDecimal = 0;

      var myContent = {
        filetype: "shapefile",
        publishParameters: JSON.stringify(params),
        f: "json"
      };

      // use the REST generate operation to generate a feature collection from the zipped shapefile
      request(portalUrl + "/sharing/rest/content/features/generate", {
        query: myContent,
        body: document.getElementById("uploadForm"),
        responseType: "json"
      })
        .then(function(response) {
          var layerName =
            response.data.featureCollection.layers[0].layerDefinition.name;
          document.getElementById("upload-status").innerHTML =
            "<b>Loaded: </b>" + layerName;
          addShapefileToMap(response.data.featureCollection);
        })
        .catch(errorHandler);
    }

    function errorHandler(error) {
      document.getElementById("upload-status").innerHTML =
        "<p style='color:red;max-width: 500px;'>" + error.message + "</p>";
    }

    function addShapefileToMap(featureCollection) {
      // add the shapefile to the map and zoom to the feature collection extent
      // if you want to persist the feature collection when you reload browser, you could store the
      // collection in local storage by serializing the layer using featureLayer.toJson()
      // see the 'Feature Collection in Local Storage' sample for an example of how to work with local storage
      var sourceGraphics = [];

      var layers = featureCollection.layers.map(function(layer) {
        var popupTemplate = new PopupTemplate({
          title: "Uploaded Shapefile",
          content: "{*}"
        });
        var graphics = layer.featureSet.features.map(function(feature) {
          return Graphic.fromJSON(feature);
        });
        sourceGraphics = sourceGraphics.concat(graphics);
        var featureLayer = new FeatureLayer({
          popupTemplate: popupTemplate,
          objectIdField: "FID",
          source: graphics
        });
        return featureLayer;
        // associate the feature with the popup on click to enable highlight and zoom to
      });
      map.addMany(layers);
      view.goTo(sourceGraphics);

      document.getElementById("upload-status").innerHTML = "";
    }
  });