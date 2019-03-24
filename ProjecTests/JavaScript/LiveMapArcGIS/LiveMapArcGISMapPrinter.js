/*jslint browser: true, devel: true, undef: true, nomen: false, bitwise: true, regexp: true, strict: false, newcap: true, immed: true */
/*global dojo: false, dijit: false, dojox: false, ihs: false, escape: false, console: false, window: false, esri: false, LiveMapDijits: false, QueryToMapParas: false, launcher: false, LiveMapArcGISMapPrinter: false, shareMap: false, deleteMap: false, renameFile: false, getImage: true, deleteMap: false, showOptionsIcon: false, calculateNameColumnLength: false, removeExtension: false, loadMaps: false */

dojo.provide("LiveMapArcGISMapPrinter");
dojo.require("dojo.io.iframe");
dojo.require("dijit.form.Button");
dojo.require("esri.map");

var deferredPrint = null;


dojo.declare("LiveMapArcGISMapPrinter", null, {
    map: null,
    liveMap: null,
    pdfUrl: null,
    // deferredPrint: null,
    nIndex: 0,

    constructor: function (/* liveMap */liveMap, url) {
        this.liveMap = liveMap;
        //this.map = this.liveMap.map;
        this.pdfUrl = url;
    },
 
    _convertUrlToAbsolute: function (url) {
        if (url) {
            if (url.indexOf("http") !== 0) {
                var escapeHTML = function (s) {
                    return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
                };
                var el = document.createElement('div');
                el.innerHTML = '<a href="' + escapeHTML(url) + '">x</a>';
                url = el.childNodes[0].href;
            }
        }
        return url;
    },

    _renderLayer: function (layer, tileUrls, dynamicUrls, features) {
        var extent = this.liveMap.extent;
        var height = this.liveMap.height;
        var width = this.liveMap.width;
        var candidateTileInfo;
        var layerTileUrls;
        var tileXOffset;
        var tileYOffset;
        var delta;
        var tileUrl;
        var i;

        if (layer.visible) {

            if (layer instanceof esri.virtualearth.VETiledLayer ||
            layer instanceof esri.layers.ArcGISTiledMapServiceLayer) {
                //layer.id === 1124715) {
                if (layer._tileIds !== null && layer._tileIds.length > 0) {
                    candidateTileInfo = esri.TileUtils.getCandidateTileInfo(this.liveMap,
                    layer.tileInfo, extent);
                    layerTileUrls = [];
                    tileXOffset = Math.ceil(width / layer.tileInfo.width);
                    tileYOffset = Math.ceil(height / layer.tileInfo.height);
                    // the internal function name prefix change to __ in v1.5
                    delta = this.liveMap._visibleDelta ?
                this.liveMap._visibleDelta : this.liveMap.__visibleDelta;
                    for (i = 0; i < layer._tileIds.length; i++) {
                        tileUrl = layer._tiles[layer._tileIds[i]].src;
                        var col;
                        var row;
                        var tileName = layer._tileIds[i];
                        var nIndex = tileName.lastIndexOf("_");
                        if (nIndex >= 0) {
                            col = tileName.substring(nIndex + 1, tileName.length);
                            tileName = tileName.substring(0, nIndex);
                        }
                        nIndex = tileName.lastIndexOf("_");
                        if (nIndex >= 0) {
                            row = tileName.substring(nIndex + 1, tileName.length);
                            //subTileUrl = subTileUrl.substring(0, nIndex);
                        }

                        /*   var sLen = "?";
                        nIndex = tileUrl.indexOf(sLen);
                        if (nIndex >= 0) {
                        tileUrl = tileUrl.substring(nIndex + sLen.length, tileUrl.length);
                        }*/

                        layerTileUrls.push({
                            "url": tileUrl,
                            "row": row,
                            "col": col
                        });
                    }
                    tileUrls.push({
                        "id": layer.id,
                        "tiles": layerTileUrls,
                        "transparency": layer.opacity,
                        "clipOptions": {
                            "offsetX": candidateTileInfo.tile.offsets.x - delta.x,
                            "offsetY": candidateTileInfo.tile.offsets.y - delta.y,
                            "width": width,
                            "height": height
                        }
                    });
                }
                /*
                } else if (layer instanceof esri.layers.ArcGISTiledMapServiceLayer) {
                candidateTileInfo = esri.TileUtils.getCandidateTileInfo(this.map,
                layer.tileInfo, extent);
                layerTileUrls = [];
                tileXOffset = Math.ceil(width / layer.tileInfo.width);
                tileYOffset = Math.ceil(height / layer.tileInfo.height);
                // the internal function name prefix change to __ in v1.5
                delta = this.map._visibleDelta ? 
                this.map._visibleDelta : this.map.__visibleDelta;
                for ( var x = 0; x <= tileXOffset; x++) {
                for ( var y = 0; y <= tileYOffset; y++) {
                tileUrl = layer.url + "/tile/" + this.map.getLevel() + "/" +
                (candidateTileInfo.tile.coords.row + y) + "/" + 
                (candidateTileInfo.tile.coords.col + x);
                layerTileUrls.push( {
                "url" : this._convertUrlToAbsolute(tileUrl),
                "row" : candidateTileInfo.tile.coords.row + y,
                "col" : candidateTileInfo.tile.coords.col + x
                });
                }
                }
                tileUrls.push( {
                "tiles" : layerTileUrls,
                "transparency" : layer.opacity,
                "clipOptions" : {
                "offsetX" : candidateTileInfo.tile.offsets.x - delta.x,
                "offsetY" : candidateTileInfo.tile.offsets.y - delta.y,
                "width" : width,
                "height" : height
                }
                });
                */
            } else if (layer instanceof esri.layers.ArcGISDynamicMapServiceLayer) {
                var imgUrl = layer._img.src;
                var baseUrl = layer.url;
                //remove proxy from url
                imgUrl = imgUrl.slice(imgUrl.indexOf(baseUrl));

                dynamicUrls.push({
                    "id": layer.id,
                    "url": this._convertUrlToAbsolute(imgUrl),
                    "width": this.liveMap.width,
                    "height": this.liveMap.height,
                    "transparency": layer.opacity,
                    "visibleLayers": $.grep(layer.visibleLayers, function (value) { return value != undefined })
                });
            } else if (layer instanceof esri.layers.GraphicsLayer) {
                var geometries = [];
                var colors = [];

                var graphics = layer.graphics;
                for (i = 0; i < graphics.length; i++) {
                    var geometry = esri.geometry.toScreenGeometry(
          extent, width, height, graphics[i].geometry);
                    if (geometry instanceof esri.geometry.Polygon) {
                        geometries.push({
                            "geometryType": "esriGeometryPolygon",
                            "rings": geometry.rings,
                            "symbol": graphics[i].symbol.toJson()
                        });
                    }
                    else if (geometry instanceof esri.geometry.Point) {
                        geometries.push({
                            "geometryType": "esriGeometryPoint",
                            "x": geometry.x,
                            "y": geometry.y,
                            "symbol": graphics[i].symbol.toJson()
                        });
                    }
                    else if (geometry instanceof esri.geometry.Polyline) {
                        geometries.push({
                            "geometryType": "esriGeometryPolyline",
                            "paths": geometry.paths,
                            "symbol": graphics[i].symbol.toJson()
                        });
                    }
                    else if (geometry instanceof esri.geometry.Extent) {
                        geometries.push({
                            "geometryType": "esriGeometryExtent",
                            "xmax": geometry.xmax,
                            "xmin": geometry.xmin,
                            "ymax": geometry.ymax,
                            "ymin": geometry.ymin,
                            "symbol": graphics[i].symbol.toJson()
                        });
                    }
                    else {
                        console.log("Unknown geometry: ", geometry);
                    }

                    colors.push(graphics[i].symbol.color);
                }

                features.push({
                    "id": layer.id,
                    "geometries": geometries,
                    "colors": colors,
                    "transparency": 0.5,
                    "width": width,
                    "height": height
                });
            }
        }

    },

    layersJson: function () {
        var tileUrls = [];
        var dynamicUrls = [];

        dojo.forEach(this.liveMap.layerIds, dojo.hitch(this, function (layerId) {
            //var mapServiceIds = this.liveMap.getVisibleMapTreeItemMapServiceIds();
            //dojo.forEach(mapServiceIds, dojo.hitch(this, function(layerId) {
            var layer = this.liveMap.getLayer(layerId);
            if (layer.visible === true) {
                //this.liveMap.isMapServiceVisible(layerId) === true) {

                this._renderLayer(layer, tileUrls, dynamicUrls, null);
            }
        }));

        return dojo.toJson({
            "tileLayers": tileUrls,
            "dynamicLayers": dynamicUrls
        });
    },

    featuresJson: function () {
        var features = [];

        dojo.forEach(this.liveMap.graphicsLayerIds, dojo.hitch(this, function (layerId) {
            var layer = this.liveMap.getLayer(layerId);
            this._renderLayer(layer, null, null, features);
        }));

        if (this.liveMap.graphics !== null) {
            this._renderLayer(this.liveMap.graphics, null, null, features);
        }

        return dojo.toJson(features);
    },

    generate: function (reportname, params, format) {

        // cancel the previous request. since we're returning pdf data
        // the request never really completes (or at least dojo is unable
        // to detect completion). if we don't cancel we are only able to
        // generate a report once...
        if (this.deferredPrint) {
            this.deferredPrint.cancel();
        }

        // need to create this temporary form since dojo.io.iframe.send() doesn't
        // honour the POST method without using a form for some reason...
        var form = document.createElement('form');
        dojo.attr(form, 'method', 'post');
        document.body.appendChild(form);
        this.nIndex++;
        dojo.attr(form, 'id', 'mapPDFFrom' + this.nIndex.toString());
        //var lastCount= document.body.all.length - 1;
        document.body.appendChild(form);

        this.deferredPrint = dojo.io.iframe.send({
            url: this.pdfUrl,
            form: form,
            method: "POST",
            content: {
                layers: this.layersJson(),
                features: this.featuresJson(),
                f: format,
                callback: "",
                report: reportname,
                reportParams: params
            },
            error: function (response, ioArgs) {
                //alert('An error has occured!');
            }
        });

        document.body.removeChild(form);
        dojo.destroy(form);

        return this.deferredPrint;
    }

});