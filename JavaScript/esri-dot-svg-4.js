
var numPoints = 20;

var mypath = document.getElementById("myCoracao");
var pathLength = mypath.getTotalLength();
var polygonPoints = [];
            
              
for (var i = 0; i <= numPoints; i++) {
    var p = mypath.getPointAtLength(i * pathLength / numPoints);
    polygonPoints.push(p.x);
    polygonPoints.push(p.y);
}

var mypolygon = document.getElementById("polygCoracao");
mypolygon.setAttribute("points", polygonPoints.join(","));

choferes = [
    {
        nombre: "chofer con depo 1",
        email: "dcdc@wjwj",
        telefono: "dcdc",
        direccion: "Depos n&ordm; 1",
        x: -34.569560161999625,
        y: -58.45888624899965,
        color: "Blue"
    }, {
        nombre: "chofer con depo 2",
        email: "dcdc2@wjwj",
        telefono: "dcdc2",
        direccion: "Depos n&ordm; 2",
        x: -34.569560161999725,
        y: -58.45888624899965,
        color: "Red"
    }, {
        nombre: "chofer con depo 3",
        email: "dcdc3@wjwj",
        telefono: "dcdc3",
        direccion: "Depos n&ordm; 3",
        x: -34.569560161999825,
        y: -58.45888624899965,
        color: "Green"
    }, {
        nombre: "chofer con depo 4",
        email: "dcdc4@wjwj",
        telefono: "dcdc4",
        direccion: "Depos n&ordm; 4",
        x: -34.569560161999925,
        y: -58.45888624199965,
        color: "Yellow"
    }, {
        nombre: "chofer con depo 5",
        email: "dcdc5@wjwj",
        telefono: "dcdc5",
        direccion: "Depos n&ordm; 5",
        x: -34.569560161999625,
        y: -58.45888624399865,
        color: "Red"
    }, {
        nombre: "chofer con depo 6",
        email: "dcdc6@wjwj",
        telefono: "dcdc6",
        direccion: "Depos n&ordm; 6",
        x: -34.569560161999625,
        y: -58.45888624399765,
        color: "Purple"
    }, {
        nombre: "chofer con depo 7",
        email: "dcdc7@wjwj",
        telefono: "dcdc7",
        direccion: "Depos n&ordm; 7",
        x: -34.569560161999625,
        y: -58.45888624499665,
        color: "Orange"
    }, {
        nombre: "chofer con depo 8",
        email: "dcdc8@wjwj",
        telefono: "dcdc8",
        direccion: "Depos n&ordm; 8",
        x: -34.569560161999625,
        y: -58.45888624599565,
        color: "Red"
    }, {
        nombre: "chofer con depo 9",
        email: "dcdc9@wjwj",
        telefono: "dcdc9",
        direccion: "Depos n&ordm; 9",
        x: -34.569560161999625,
        y: -58.45888624699465,
        color: "Black"
    }, {
        nombre: "chofer con depo 10",
        email: "dcdc10@wjwj",
        telefono: "dcdc10",
        direccion: "Depos n&ordm; 10",
        x: -34.569560161999625,
        y: -58.45888624799365,
        color: "Blue"
    }
];

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    //*** ADD ***//
    "esri/geometry/Polyline",
    "esri/symbols/SimpleLineSymbol"
], function (Map, MapView,
    Graphic, Point, SimpleMarkerSymbol,
    //*** ADD ***//
    Polyline, SimpleLineSymbol
) {

        var map = new Map({
            basemap: "topo-vector"
        });

        var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [-118.80543, 34.02700],
            zoom: 10
        });

          var pathsPoly = [
            [  // first path
             [-97.06138,32.837,5],
             [-97.06133,32.836,6],
             [-97.06124,32.834,7]
            ], [  // second path
             [-97.06326,32.759],
             [-97.06298,32.755]
            ]
           ];

           var polyImg = [];
           polyImg.push([-118.29026, 34.1816]);
           polyImg.push(["M14.5,29 23.5,0 14.5,9 5.5,0z"],["M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"]);
           polyImg.push([-118.26451, 34.09664]);


           const symbol = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            path: "M14.5,29 23.5,0 14.5,9 5.5,0z",
            path: "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z",
            color: "#ffff00",
            outline: {
              color: [0, 0, 0, 0.7],
              width: 0.5
            },
            angle: 180,
            size: 15
          };

        choferes.map(function(chofer){
            console.log(chofer);
            //*** ADD ***//
            // Create a line geometry

            var polyline = new Polyline({
                 hasZ: false,
                 hasM: true,
        //     paths: paths,
                spatialReference: { wkid: 4326 },
                paths: polyImg
                // [
                //   [-118.29026, 34.1816],
                //   [-118.26451, 34.09664],
                //  [chofer.x, chofer.y]
                // ]
            });

            // Create a symbol for drawing the line
            var lineSymbol = new SimpleLineSymbol({
                color: [226, 119, 40],
                width: 4
            });

            // Create a line graphic
            var polylineGraphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol
            })


   
                 // Add the graphic to the view
            view.graphics.add(polylineGraphic);




        });
       
    });