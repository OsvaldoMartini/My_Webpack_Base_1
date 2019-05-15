var map;

require([
  "esri/map",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/graphic",
  "dojo/_base/array",
  "dojo/dom-style",
  "dojox/widget/ColorPicker",
  "dojo/domReady!"
], function(
  Map,
  Point,
  SimpleMarkerSymbol,
  Graphic,
  arrayUtils,
  domStyle,
  ColorPicker
) {
  map = new Map("map", {
    basemap: "oceans",
    center: [20, 44],
    zoom: 6,
    minZoom: 2
  });

  map.on("load", mapLoaded);

  function mapLoaded() {
    var points = [
      [19.82, 41.33],
      [16.37, 48.21],
      [18.38, 43.85],
      [23.32, 42.7],
      [16, 45.8],
      [19.08, 47.5],
      [12.48, 41.9],
      [21.17, 42.67],
      [21.43, 42],
      [19.26, 42.44],
      [26.1, 44.43],
      [12.45, 43.93],
      [20.47, 44.82],
      [17.12, 48.15],
      [14.51, 46.06],
      [12.45, 41.9]
    ];
    var iconPath1 =
      "M.87 15.83c-.2 0-.36-.08-.5-.2-.12-.14-.2-.3-.2-.5V.87c0-.38.32-.7.7-.7h14.26c.4 0 .7.32.7.7v14.26c0 .4-.32.7-.7.7H.87z";
    var iconPath2 =
      "M9.1 5.74l1.75-1.52.27.03 2.3-1.67-1.64 2.34.04.3-1.56 1.73V12l-1.07.45L7.47 9.7l-1.6 1.1.4 2.32-.33.3-1.4-1.92-1.98-1.45.33-.3 2.42.48.97-1.67-2.53-1.92.26-.9H9.1";
    // "<path fill='#0066b3' stroke='#fff' stroke-width='.33' d='M.87 15.83c-.2 0-.36-.08-.5-.2-.12-.14-.2-.3-.2-.5V.87c0-.38.32-.7.7-.7h14.26c.4 0 .7.32.7.7v14.26c0 .4-.32.7-.7.7H.87z'/>";
    //"M24.0,2.199C11.9595,2.199,2.199,11.9595,2.199,24.0c0.0,12.0405,9.7605,21.801,21.801,21.801c12.0405,0.0,21.801-9.7605,21.801-21.801C45.801,11.9595,36.0405,2.199,24.0,2.199zM31.0935,11.0625c1.401,0.0,2.532,2.2245,2.532,4.968S32.4915,21.0,31.0935,21.0c-1.398,0.0-2.532-2.2245-2.532-4.968S29.697,11.0625,31.0935,11.0625zM16.656,11.0625c1.398,0.0,2.532,2.2245,2.532,4.968S18.0555,21.0,16.656,21.0s-2.532-2.2245-2.532-4.968S15.258,11.0625,16.656,11.0625zM24.0315,39.0c-4.3095,0.0-8.3445-2.6355-11.8185-7.2165c3.5955,2.346,7.5315,3.654,11.661,3.654c4.3845,0.0,8.5515-1.47,12.3225-4.101C32.649,36.198,28.485,39.0,24.0315,39.0z";
    var initColor = "#0066b3";
    arrayUtils.forEach(points, function(point) {
      var graphic = new Graphic(
        new Point(point),
        createSymbol(iconPath1, iconPath2, initColor)
      );
      map.graphics.add(graphic);
    });

    var colorPicker = new ColorPicker({}, "picker1");
    colorPicker.setColor(initColor);
    domStyle.set(colorPicker, "left", "500px");
    colorPicker.on("change", function() {
      var colorCode = this.hexCode.value;
      map.graphics.graphics.forEach(function(graphic) {
        graphic.setSymbol(createSymbol(iconPath1, iconPath2, colorCode));
      });
    });
  }

  function createSymbol(iconPath1, iconPath2, color) {
    var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
    markerSymbol.setPath(iconPath1);
    markerSymbol.setPath(iconPath2);
    markerSymbol.setColor(new dojo.Color(color));
    markerSymbol.setOutline(null);
    return markerSymbol;
  }
});
