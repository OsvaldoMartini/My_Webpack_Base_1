var map;
var baseCircle;
require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/tasks/query",
  "esri/geometry/Circle",
  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/renderers/SimpleRenderer",
  "esri/config",
  "esri/Color",
  "dojo/dom",
  "dojo/domReady!"
], function(
  Map,
  FeatureLayer,
  GraphicsLayer,
  Query,
  Circle,
  SpatialReference,
  Point,
  Graphic,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol,
  SimpleRenderer,
  esriConfig,
  Color,
  dom
) {
  esriConfig.defaults.io.proxyUrl = "/proxy/";

  map = new Map("mapDiv", {
    basemap: "streets",
    center: [-88.158805, 41.786075],
    zoom: 14,
    slider: false
  });

  var pointGLayer = new GraphicsLayer();
  //pointGLayer.setRenderer(pointRenderer);
  map.addLayer(pointGLayer);

  var data = [
    [-88.13198711899997, 41.79304797900005],
    [-88.13559945399999, 41.79100138000007],
    [-88.13565587999994, 41.79234125500005],
    [-88.13645828899996, 41.79017487800007],
    [-88.13801440299994, 41.790968630000066],
    [-88.13797007499994, 41.791996288000064],
    [-88.13798992699998, 41.79258648200005],
    [-88.12837351899998, 41.79370832500007]
  ];
  var symbol = new SimpleMarkerSymbol(
    SimpleMarkerSymbol.STYLE_CIRCLE,
    12,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_NULL,
      new Color([247, 34, 101, 0.9]),
      1
    ),
    new Color([207, 34, 171, 0.5])
  );

  for (i = 0; i < data.length; i++) {
    var pt = new Point(
      data[i][0],
      data[i][1],
      new SpatialReference({
        wkid: 4326
      })
    );
    var graphic = new Graphic(pt, symbol);
    pointGLayer.add(graphic);
  }
  var symbol = new SimpleMarkerSymbol(
    SimpleMarkerSymbol.STYLE_CIRCLE,
    12,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_NULL,
      new Color([247, 34, 101, 0.9]),
      1
    ),
    new Color([207, 34, 171, 0.5])
  );

  var circleSymb = new SimpleFillSymbol(
    SimpleFillSymbol.STYLE_NULL,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
      new Color([105, 105, 105]),
      2
    ),
    new Color([255, 255, 0, 0.25])
  );
  var circle;

  map.on("click", function(evt) {
    baseCircle = evt.mapPoint;
    console.log(baseCircle);
    circle = new Circle({
      center: evt.mapPoint,
      geodesic: true,
      radius: 1000,
      radiusUnit: "esriMeters"
    });
    map.graphics.clear();
    var graphic = new Graphic(circle, circleSymb);
    map.graphics.add(graphic);

    var query = new Query();
    query.geometry = circle.getExtent();

    var gras = pointGLayer.graphics;
    gras.map(function(gra) {
      if (circle.contains(gra.geometry)) {
        console.info("graphic is inside circle");
      } else {
        console.info("graphic not inside circle");
      }
    });
  });
});
