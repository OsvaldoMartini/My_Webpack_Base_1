dojo.require("esri.map");
dojo.require("esri.layers.agsdynamic");
dojo.require("esri.virtualearth.VETiledLayer");
dojo.require("esri.dijit.Scalebar");

$(function () {
    printMap.init();
});

var printMap =
{
    mapControl: null,

    init: function () {        

        if (window.opener && window.opener.GetPrintData) {

            var mapData = window.opener.GetPrintData();
            $('#printTitle').text(mapData.title);

            if (mapData.tree != '') $('#printLegendDiv').append(mapData.tree.html());
            else $('#printLegendDiv').hide();

            $('#printMapDiv').css('height', mapData.height);
            $('#printMapDiv').css('width', mapData.width);

            esri.config.defaults.io.proxyUrl = mapData.proxyUrl;
            esri.config.defaults.io.alwaysUseProxy = true;

            var initialExtent = new esri.geometry.Extent({ "xmin": mapData.extent.xmin,
                "ymin": mapData.extent.ymin,
                "xmax": mapData.extent.xmax,
                "ymax": mapData.extent.ymax,
                "spatialReference": { "wkid": mapData.extent.spatialReference.wkid }
            });

            printMap.mapControl = new esri.Map("printMapDiv", { extent: initialExtent, slider: false });
            printMap.mapControl.setExtent(initialExtent, true);

            dojo.connect(printMap.mapControl, 'onLoad', function (theMap) {
                printMap.mapControl.disableMapNavigation();

                var scalebar = new esri.dijit.Scalebar({
                    map: printMap.mapControl,
                    scalebarUnit: 'english',
                    attachTo: 'bottom-right'
                });

                //printMap.mapControl.setExtent(initialExtent, true);
                //resize the map when the browser resizes

            });

            //dojo.connect(window, 'resize', printMap.resizeMap);

            var services = [];
            for (var i = 0; i < mapData.layers.length; i++) {
                var layer = mapData.layers[i];
                var service;
                switch (mapData.layers[i].declaredClass) {
                    case 'esri.layers.ArcGISDynamicMapServiceLayer':
                        service = new esri.layers.ArcGISDynamicMapServiceLayer(layer.url, { id: layer.id });
                        if (layer.visibleLayers) {
                            service.setVisibleLayers(layer.visibleLayers);
                        }
                        if (layer.layerDefinitions) {
                            service.setLayerDefinitions(layer.layerDefinitions);
                        }
                        break;
                    case 'esri.layers.ArcGISTiledMapServiceLayer':
                        service = new esri.layers.ArcGISTiledMapServiceLayer(layer.url, { id: layer.id });
                        break;
                    case 'esri.virtualearth.VETiledLayer':
                        service = new esri.virtualearth.VETiledLayer({
                            id: layer.id,
                            bingMapsKey: layer.bingMapsKey,
                            mapStyle: layer.mapStyle
                        });
                        break;
                    default:
                }
                services.push(service);
            }

            printMap.mapControl.addLayers(services);

            //printMap.resizeMap();

        }

    },
     
    resizeMap: function () {
        var w = $(window);
        $('#printMapDiv').css('height', w.height() - $('#printTitle').height());
        $('#printMapDiv').css('width', w.width() - $('#printLegendDiv').width() - 5);
        $('#printLegendDiv').css('height', w.height() - $('#printTitle').height());
        printMap.mapControl.resize();
        printMap.mapControl.reposition();
    }

};