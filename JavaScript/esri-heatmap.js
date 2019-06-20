require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/core/watchUtils"
], function(WebMap, MapView, Legend, Expand, watchUtils) {
  const map = new WebMap({
    portalItem: {
      id: "559f46c1162d4a09901438d92148e53a"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    constraints: {
      minScale: 1155582
    }
  });

  view.ui.add(
    new Legend({
      view: view
    }),
    "bottom-left"
  );

  view.when().then(function() {
    // When the view is ready, clone the heatmap renderer
    // from the only layer in the web map

    const layer = view.map.layers.getItemAt(0);
    const heatmapRenderer = layer.renderer.clone();

    // The following simple renderer will render all points as simple
    // markers at certain scales

    const simpleRenderer = {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "#c80000",
        size: 5
      }
    };

    // When the scale is larger than 1:72,224 (zoomed in passed that scale),
    // then switch from a heatmap renderer to a simple renderer. When zoomed
    // out beyond that scale, switch back to the heatmap renderer

    view.watch("scale", function(newValue) {
      layer.renderer = newValue <= 72224 ? simpleRenderer : heatmapRenderer;
    });
  });

  //   // Displays instructions to the user for understanding the sample
  //   // And places them in an Expand widget instance

  //   const sampleInstructions = document.createElement("div");
  //   sampleInstructions.style.padding = "10px";
  //   sampleInstructions.style.backgroundColor = "white";
  //   sampleInstructions.style.width = "300px";
  //   sampleInstructions.innerText = [
  //     "As you zoom in, the style will switch from a",
  //     "heatmap to individual points."
  //   ].join(" ");

  //   const instructionsExpand = new Expand({
  //     expandIconClass: "esri-icon-question",
  //     expandTooltip: "How to use this sample",
  //     expanded: true,
  //     view: view,
  //     content: sampleInstructions
  //   });
  //   view.ui.add(instructionsExpand, "top-left");

  //   // Hide the instructions when the user starts interacting with the sample

  //   watchUtils.whenTrueOnce(view, "interacting", function() {
  //     instructionsExpand.expanded = false;
  //   });
});
