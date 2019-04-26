require([
    "esri/config",
    "dojo/dom",
    "dojo/on",
    "dojo/dom-class",
    "esri/request",
    "dojo/domReady!"
  ], function (esriConfig, dom, on, domClass, esriRequest) {
    esriConfig.defaults.io.corsEnabledServers.push('https://djanes.ihs.com/') ;
    on(dom.byId("rdoJson"), "change", change);
    on(dom.byId("rdoImage"), "change", change);

    on(dom.byId("submitRequest"), "click", getContent);

    function getContent() {

      var url = dom.byId("url").value;
      var contentDiv = dom.byId("content");
      contentDiv.value = "";
      domClass.remove(contentDiv, "failure");
      dom.byId("status").innerHTML = "Downloading...";

      var params = {
        url: url,
        handleAs: "blob"
      };

      if (dom.byId("rdoJson").checked) {
        params.content = {
          f: "json"
        };
      }
      var requestHandle = esriRequest(
        params);
      requestHandle.then(requestSucceeded, requestFailed);
    }

    function requestSucceeded(response, io) {

      dom.byId("status").innerHTML = "";
      var reader = new FileReader();

      reader.addEventListener("loadend", function () {
        if (response.type == "image/png") {
          dom.byId("content").innerHTML = "<img src=' " + reader.result + " '/>";
        } else {
          dom.byId("content").innerHTML = "<div>" + reader.result + "</div>";
        }
      });

      if (response.type == "image/png") {
        //if working with image data
        reader.readAsDataURL(response);
      } else {
        reader.readAsText(response);
      }
    }

    function requestFailed(error, io) {
      domClass.add(dom.byId("content"), "failure");
      dom.byId("status").innerHTML = "";
      dom.byId("content").innerHTML = error;
    }

    function change(evt) {
      var url;
      if (evt.target.id === "rdoJson") {
        url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/";
      } else { // blob from image
        url = "/Map/icon/2";
        //url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/WorldTimeZones/MapServer/tile/1/0/0";
      }
      dom.byId("url").value = url;
    }
  });