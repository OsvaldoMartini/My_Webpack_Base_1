/**
 * Marker Layer
 * @constructor
 * @param {Object} options Layer options for Marker Layer. 
 */
function MarkerLayerVM(options) {
    var self = this;

    //Call the super/base constructor.
    LayerVM.apply(self, arguments);

    self.dataCount = 0;

    self.esriLayers = {};

    //Whether or not a search (q) has been applied to this layer SPECIFICALY. Otherwise it can apply any global searches applied.
    self.hasExplicitSearchQuery = false;

    self.search = new Search({
        serviceUrl: self.options.searchUrl,
        queryString: "categoryName=" + self.options.categoryName
        + '&' + (self.options.queryString || ''),
        updateQueryString: false
    });

    self.facets = new FacetsVM(self.search, {
        categoryUrlKey: self.options.urlKey || undefined,
        enableFacetPanel: self.options.enableFacetPanel === null ? true : self.options.enableFacetPanel
    });

    self.setupLayerSettings();

    self.commandsVM = self._getCommandsVM();

    self.onUpdateFuncitons = [];

    self.search.registerStartCallback(function (sender) {
        if (sender == self.search.updateRequestSender.dontSearch) return;
        self.options.startLoadingCallback(self.id, self.title);
    });

    self.data = null;

    self.search.registerErrorCallback(function () {
        console.log("The layer " + self.title() + " failed to load!");
        self.options.finishedLoadingCallback(self.id);
    });

    self.hiddenLayers = ko.observableArray();

    self.search.registerFinishedCallback(function (result) {
        //if (!self.isVisible()){
        //    self.GetSubLayers();
        //    self.options.finishedLoadingCallback(self.id);
        //     return;
        //}

        if (self.options.static) {
            self.data = result.Data;
        }

        var type = self.type || result.Data.Type;
        self.getLayer(type).clear();
        self.getLayer(type).show();
        self.totalResults(result.MetaData.ResultsTotal);
        self.totalResults.valueHasMutated();
        result.Data && self.addMarkers(result.Data);
        self.options.finishedLoadingCallback(self.id);

        self.onUpdateFuncitons.forEach(function (f) {
            f.apply(self);
        });

        self.GetSubLayers();
        self.onUpdateFuncitons = [];

        result.Data && self.getLegend(result.Data);

        if (self.temporalSlider)
            self.temporalSlider.getData();
    });

    self.hasPopover(self.options.popover && !!self.options.popover.length);

    self.temporalSlider = null;

    //// Setup hidden Layers
    if (options.hiddenLayers !== undefined) {
        options.hiddenLayers.forEach(function (obj) {
            //// Inherit the parent commandsVM and adjust category
            obj.commandsVM = $.extend(true, {}, self.commandsVM);
            obj.commandsVM.options.category = obj.CategoryKey;
            var layerVm = self.layerManagerVm.SetupLayer(obj);
            self.hiddenLayers.push(layerVm);
        });
    };

    self.isMeasuring = false;

    self.map.on('measure-start', function () {
        self.isMeasuring = true;
    });
    self.map.on('measure-end', function () {
        self.isMeasuring = false;
    });

    self.isVisible.subscribe(function (visible) {
        self[visible ? 'addLayer' : 'removeLayer']();
    });

    if (self.isVisible) {
        self.addLayer();
    }

    self.getSubLayers();
}

//Use the parent's prototype as a base.
MarkerLayerVM.prototype = Object.create(LayerVM.prototype);

//But use your own constructor, not your parent's constructor (yet).
MarkerLayerVM.prototype.constructor = MarkerLayerVM;

MarkerLayerVM.prototype.setupLayerSettings = function (forceStopSearch, callback) {
    var self = this;

    callback = callback || function () { };

    self.layerSettings = {};
    (self.options.popover || []).forEach(function (pop) {
        var key = pop.Key;

        self.layerSettings[key] = ko.observable(pop.Value || Object.keys(pop.Values)[0]);

        self.layerSettings[pop.Key].subscribe(function (value) {
            if (pop.PreventSearch) {
                callback();
                return;
            }

            self.search.setQueryValue(key, value);
            if (forceStopSearch) {
                callback();
                return;
            }
            self.search.updateResults();
            callback();
        });
    });
};

/**
 Update function called on map change or filters change.
 * @param {string} updateRequestSender - The type of update such as facetPanel.
 * @param {object} map - esri map.
 * @param {object} geo - geographic extent.
 * @param {object} zoom - The zoom level of the map.
 * @param {object} globalConstraints - All search constraints that will be applied to all layers (according to their individual rules).
 * @returns {void}
 **/
MarkerLayerVM.prototype.update = function (updateRequestSender, map, geo, zoom, globalConstraints, removals) {
    var self = this;
    if (!self.isVisible()) {
        return;
    }

    if (self.options.static && self.data) {
        return self.updateStatic(true);
    }

    console.log('Updating Layer ' + self.options.title);
    self.search.setQueryValue("zoom", zoom);

    if (globalConstraints) {
        for (var constraint in globalConstraints) {
            if (!globalConstraints.hasOwnProperty(constraint)) continue;
            var value = globalConstraints[constraint];
            if (constraint == 'f') {
                value = self.facets.decodeFacets(value);
                self.facets.applyFacetObject(value || {}, true);
                continue;
            }

            if (constraint == 'q' && self.hasExplicitSearchQuery !== false) {
                continue;
            }

            self.search.setQueryValue(constraint, value);
        }
    }

    if (removals) {
        for (constraint in removals) {
            if (!removals.hasOwnProperty(constraint)) continue;
            var value = removals[constraint];
            if (constraint == 'f') {
                value = typeof (value) !== "string" ? value : self.facets.decodeFacets(value);
                Object.keys(value).forEach(function (idx) {
                    var val = value[idx];
                    if (Array.isArray(val)) {
                        val.forEach(function (v) {
                            self.facets.removeFacet(idx, v, null, true);
                        });
                        return;
                    }
                    self.facets.removeFacet(idx, val, null, true);
                });
                continue;
            }
            self.search.removeQueryValue(constraint);
        }
    }

    self.search.setQueryValue("tolerance", self.map.extent.getWidth() / self.map.width);

    self.search.submit();
};

MarkerLayerVM.prototype.updateStatic = function (dontLoop) {
    var self = this;
    if (!dontLoop && (!self.options.static || !self.data)) {
        self.update();
        return;
    }

    self.getLayer(self.type).clear();

    self.addMarkers(self.data);
    self.getLayer(self.type).show();
}

/**
 * Clear the layer
 * 
 */
MarkerLayerVM.prototype.clear = function (type) {
    var self = this;
    if (type != null) {
        self.getLayer(type).hide();
    } else {
        self.getLayer(self.type).hide();
    }

    self.options.finishedLoadingCallback(self.id);
};

/**
 * Export Data from the layer.
 */
MarkerLayerVM.prototype.exportData = function () {
    this.commandsVM.exportResults(true);
};


LayerVM.prototype.saveSearch = function () {
    this.commandsVM.saveSearch();
};

MarkerLayerVM.prototype.getLayer = function (layerType) {
    var self = this;
    layerType = self.type;
    if (self.esriLayers[layerType]) return self.esriLayers[layerType];
    var layer;
    if (layerType === layerTypeEnum.Heatmap) {
        layer = new esri.layers.FeatureLayer({
            layerDefinition: {
                geometryType: 'esriGeometryPoint',
                fields: [{
                    name: 'Id',
                    type: 'esriFieldTypeString'
                },
                {
                    name: 'Title',
                    type: 'esriFieldTypeString'
                },
                {
                    name: 'Count',
                    type: 'esriFieldTypeInteger'
                }]
            },
            featureSet: null
        }, {
                id: self.id + '_' + layerType,
                opacity: 0.9
            });


        var heatmapRenderer = new esri.renderer.HeatmapRenderer({
            field: "Count",
            blurRadius: self.layerSettings.heatmapBlur ? self.layerSettings.heatmapBlur() : 7,
            maxPixelIntensity: self.layerSettings.heatmapMax ? self.layerSettings.heatmapMax() : 100,
            minPixelIntensity: self.layerSettings.heatmapMin ? self.layerSettings.heatmapMin() : 0,
            colorStops: self.options.colours.map(function (c) {
                return { ratio: c.Stop, color: esri.Color(c.Colour).toString() };
            })
        });

        layer.setRenderer(heatmapRenderer);
        self.getLegend();

        if (self.layerSettings.heatmapMin) {
            self.layerSettings.heatmapMin.subscribe(function (min) {
                heatmapRenderer.minPixelIntensity = min;
                layer.redraw();
                self.getLegend();
            });
        }
        if (self.layerSettings.heatmapMax) {
            self.layerSettings.heatmapMax.subscribe(function (max) {
                heatmapRenderer.maxPixelIntensity = max;
                layer.redraw();
                self.getLegend();
            });
        }
        if (self.layerSettings.heatmapBlur) {
            self.layerSettings.heatmapBlur.subscribe(function (radius) {
                heatmapRenderer.blurRadius = radius;
                layer.redraw();
                self.getLegend();
            });
        }
    }
    else {
        layer = new esri.layers.GraphicsLayer({
            id: self.id + '_' + layerType,
            opacity: 0.9
        });
    }

    // Remove the old layer from layers before adding the same one.
    // So that the new layer will be re-attached to the layers
    // need this step as the layer will not show after the first time
    if (self.map._layers[layer.id]) {
        delete self.map._layers[layer.id];
    }

    var isShapeLayer = [layerTypeEnum.Choropleth, layerTypeEnum.Heatmap].indexOf(layerType) > -1;

    var mouseOver = false;
    layer.on("mouse-over", function (e) {
        if (self.isMeasuring) return;
        self.markerMouseOver(e, true);
        mouseOver = true;
    });

    layer.on("mouse-move", function (e) {
        if (self.isMeasuring) return;
        // if (!mouseOver || !isShapeLayer) return;
        if (mouseOver || isShapeLayer) self.markerMouseOver(e, true);
    });

    layer.on("mouse-out", function () {
        if (self.isMeasuring) return;
        mouseOver = false;
        self.map.setMapCursor("move");
        self.hideTooltip();
    });


    // Fired when a layer marker to clicked
    layer.on("click", function (e) {
        if (self.isMeasuring) return;
        var attributes = self.getActiveTarget(e.target).e_graphic.attributes;
        switch (layerType) {
            case layerTypeEnum.Marker:
            case layerTypeEnum.RangedMarker:
                self.showMarkerInfo(attributes);
                break;
            case layerTypeEnum.Choropleth:
                switch (attributes.Type) {
                    case "Country Risk":
                        window.PostOffice.send("CountryOverview", [attributes.Title, "Risk"]);
                        break;
                }
                break;
        }
    });

    self.esriLayers[layerType] = layer;

    return layer;
}

MarkerLayerVM.prototype.addLayer = function () {
    var self = this;
    var layerType = self.type;
    var layer = self.esriLayers[layerType];
    self.map.addLayer(layer);

    var isShapeLayer = [layerTypeEnum.Choropleth, layerTypeEnum.Heatmap].indexOf(layerType) > -1;

    if (self.options.IsBottomLayer || isShapeLayer) {
        self.map.reorderLayer(layer, 1);
    }
};

MarkerLayerVM.prototype.removeLayer = function () {
    var self = this;
    var layerType = self.type;
    var layer = self.esriLayers[layerType];
    self.map.removeLayer(layer);
}

MarkerLayerVM.prototype.saveStyle = function (style) {
    window.markerStyles[style.Name] = new PlacemarkStyle(style, window.markerStyles[style.Name]);
}

MarkerLayerVM.prototype.addHeatmap = function (data) {
    var self = this;
    var layer = self.getLayer();
    var features = data.Markers.map(function (marker) {
        return new esri.Graphic({
            attributes: {
                Id: marker.Id,
                Title: marker.Title,
                Count: marker.Count
            },
            geometry: {
                x: marker.Longitude,
                y: marker.Latitude
            }
        });
    });
    layer.applyEdits(features);
}
/**
 * Add Markers to the map layer
 */
MarkerLayerVM.prototype.addMarkers = function (data) {
    var self = this;

    (data.Styles || []).forEach(function (style) {
        self.saveStyle(style);
    });

    var mapExtent = esri.geometry.webMercatorToGeographic(self.map.extent);

    if (self.type == layerTypeEnum.Heatmap) {
        return self.addHeatmap(data);
    }

    /**
     * Checks that a marker is within the visible extent.
     * @param {Marker} marker the marker to check.
     * @param {Extent} extent the map extent.
     * @returns {boolean} true if the marker is within the extent, otherwise false.
     */
    var isInView = function (marker, extent) {
        if (marker.IsPolygon) return true;
        if (marker.Latitude > extent.ymax || marker.Latitude < extent.ymin) return false;
        if (self.map._clip) return true;
        if (marker.Longitude > extent.xmax || marker.Longitude < extent.xmin) {
            if (extent.xmax > extent.xmin) {
                return false;
            }
            if (marker.Longitude < 180 && marker.Longitude > extent.xmin ||
                marker.Longitude > -180 && marker.Longitude < extent.xmax) {
                return true
            }
            return false;
        }
        return true;
    }

    var excludedFacets = self.facets.getFacetValues(self.subLayerKey() + "!!").map(function (f) { return decodeURIComponent(f.replace(/\+/g, ' ')); });
    var isFilteredIn = function (marker) {
        return excludedFacets.reduce(function (result, facet) {
            return result && (typeof (marker.Type) === "string" ? marker.Type.indexOf(facet) !== 0 : !marker.Type[facet]);
        }, true);
    }

    var minMaxCount = { min: -1, max: -1 };
    var resolution = self.map.extent.getWidth() / self.map.width;
    var clusterSetDistance = data.Cluster ? 0.001 / self.map.getZoom() : 0.000000001;
    var clusters = data.Markers.reduce(function (clusters, point) {
        var marker = new Marker(point, true);
        markerStyles[marker.Type] = markerStyles[marker.Type] || new PlacemarkStyle(marker);
        minMaxCount.min = minMaxCount.min < 0 ? marker.Count : Math.min(minMaxCount.min, marker.Count);
        minMaxCount.max = minMaxCount.max < 0 ? marker.Count : Math.max(minMaxCount.max, marker.Count);

        if (!marker.Longitude && !marker.Latitude && marker.Geometry.length == 1 && marker.Geometry[0].type == "point") {
            marker.Longitude = marker.Geometry[0].x;
            marker.Latitude = marker.Geometry[0].y;
        }

        if (!isInView(marker, mapExtent) || !isFilteredIn(marker)) {
            return clusters;
        }

        for (var i = 0, j = marker.IsPolygon ? 0 : clusters.length; i < j; i++) {
            var cluster = clusters[i];
            if (cluster.IsPolygon) continue;
            if (!self.RollClusterTest(marker, cluster, resolution, clusterSetDistance))
                continue;

            cluster.Markers.push(marker);

            cluster.Count += marker.Count || 1;
            var count = cluster.Markers.length;
            cluster.Longitude = (marker.Longitude + (cluster.Longitude * count)) / (count + 1);
            cluster.Latitude = (marker.Latitude + (cluster.Latitude * count)) / (count + 1);
            cluster.Point = new Point(cluster.Longitude, cluster.Latitude);

            self.makeClusterType(marker, cluster.Type);

            if (cluster.Id !== marker.Id) cluster.Id = cluster.Id + "," + marker.Id;
            cluster.Level = marker.Level || EnumLevel.Stacked;

            // If the title of the cluster is different to the marker, then use the types of the markers.
            if (cluster.Title !== marker.Title) {
                cluster.Title = Object.keys(cluster.Type)
                    .reduce(function (types, t) {
                        t = t.indexOf('__') > -1 ? t.substring(t.lastIndexOf('__') + 2) : t;
                        if (types.indexOf(t) < 0)
                            types.push(t);
                        return types;
                    },
                    [])
                    .join(", ");
            }

            minMaxCount.min = minMaxCount.min < 0 ? cluster.Count : Math.min(minMaxCount.min, cluster.Count);
            minMaxCount.max = minMaxCount.max < 0 ? cluster.Count : Math.max(minMaxCount.max, cluster.Count);
            return clusters;
        }

        marker.Markers.push(new Marker(point, true));
        marker.ClusterStyle = data.ClusterStyle;
        marker.Type = self.makeClusterType(marker);
        clusters.push(marker);
        return clusters;
    }, []);

    /** update the cluster type so we can change the image if all the points are the same type **/

    self.dataCount = 0;
    clusters.forEach(function (cluster) {
        if (typeof (cluster.Type) === "object" && Object.keys(cluster.Type).length == 1) {
            var typename = Object.keys(cluster.Type)[0];
            cluster.MarkerImage = cluster.Markers[0].MarkerImage || cluster.Type[typename].Image;
            cluster.Colour = cluster.Markers[0].Colour || cluster.Type[typename].Colour;
            cluster.Type = typename;
        }

        if (cluster.Count > 1 || cluster.IsPolygon) {
            cluster.Style = new PlacemarkStyle(cluster);
        } else {
            cluster.Style = //(typeof (cluster.Type) === "string" ? window.markerStyles[cluster.Type] : null) ||
                new PlacemarkStyle(cluster);
        }

        markerStyles[cluster.Type] = cluster.Style;

        var placemark = new PointPlacemark(cluster, self.getLayer(data.Type));
        placemark.draw(true);

        if (cluster.Count > 1
            && cluster.Type != "heatmap")/// JW: TODO: I'm not sure about this
        {
            placemark.label(cluster.Label)
        }
        self.dataCount += cluster.Count;
    })
};

/**
 * Make ExpandedType object from the point data.
 * @param {Marker} point to extract type info from.
 * @param {object=} type object to add expandedType item to.
 * @returns {object} containing the ExpandedType item.
 */
MarkerLayerVM.prototype.makeClusterType = function (point, type) {
    type = type || {};
    if (typeof (point.Type) == "object") {
        return Object.keys(point.Type)
            .reduce(function (typeObj, type) {
                var tempType = point.Type[type];
                var typeStyle = markerStyles[Object.keys(markerStyles).filter(function (name) {
                    return markerStyles[name].name == tempType.Name;
                })[0]];
                typeObj[tempType.Name] = new ExpandedType(
                    tempType.Name,
                    tempType.Image,
                    tempType.Colour,
                    tempType.Count || 1,
                    typeStyle
                );
                return typeObj;
            }, type || {});
    }
    var info = type[point.Type];
    if (!info) {
        var typeStyle = markerStyles[Object.keys(markerStyles).filter(function (name) {
            return markerStyles[name].name == point.Type;
        })[0]];

        info = type[point.Type] = new ExpandedType(
            point.Type,
            point.MarkerImage,
            point.Colour,
            point.Count || 1,
            typeStyle
        );
    }
    else
        info.Count += (point.Count || 1);
    return type;
};

MarkerLayerVM.prototype.RollClusterTest = function (p, cluster, resolution, clusterSetDistance) {
    if (!p.Longitude && !p.Latitude) return false;
    var distance = (Math.sqrt(Math.pow((cluster.Longitude - p.Longitude), 2) + Math.pow((cluster.Latitude - p.Latitude), 2)) / resolution);
    return (distance <= clusterSetDistance);
};

/**
 * Gets the active marker target. 
 * If the target is the text label previous image or path is returned.
 * @param {SVGElement|HTMLElement} target the target to check.
 * @returns {SVGElement|HTMLElement} the active target element
 */
MarkerLayerVM.prototype.getActiveTarget = function (target, depth) {
    if (target.e_graphic && target.e_graphic.attributes) return target;
    if (!target.previousElementSibling) return target;
    if (depth > 3) return target;

    return this.getActiveTarget(target.previousElementSibling, (depth || 0) + 1);
};

MarkerLayerVM.prototype.markerMouseOver = function (evt, followMouse) {
    var self = this;

    var target = self.getActiveTarget(evt.target);
    if (!target.e_graphic) return;
    var marker = target.e_graphic.attributes;

    if (marker) {

        if (marker.IsClickable) {
            self.map.setMapCursor("pointer");
        } else {
            self.map.setMapCursor("default");
        }

        // If the marker has a pre-defined tooltip, use it. Otherwise generate it from the marker properties.
        if (marker.Tooltip) {
            self.showTooltip({
                content: marker.Tooltip,
                target: target,
                event: evt,
                offset: { X: 5, Y: 5 },
                track: !!followMouse
            });
        } else {
            var content = self.getSummary([target.e_graphic]);

            var showTooltip = function () {
                var title = marker.Title || marker.Type;
                if (typeof title != "string") title = '';
                self.showTooltip({
                    heading: title,
                    content: content,
                    target: target,
                    event: evt,
                    offset: { X: 5, Y: 5 },
                    track: !!followMouse
                });
            };

            showTooltip();
            if (followMouse || !self.layerManagerVm.Layers) return;
            var additional = false
            self.layerManagerVm.Layers()
                .filter(function (l) {
                    return l.isVisible()
                })
                .forEach(function (l) {
                    l.findMarkerAt(target.e_graphic._extent,
                        function (m) {
                            var extra = l.getSummary.call(l, m);
                            if (!additional && extra) {
                                content = '';
                                additional = true;
                            }
                            content += extra;
                            if (!content) return;
                            showTooltip();
                        });
                });
        }
    }
};

/**
 * Creates a summary table of the markers' content
 * @param {Marker|Array.<Marker>} markers - the markers to get the summary of.
 * @returns {string} HTML of a summary table.
 */
MarkerLayerVM.prototype.getSummary = function (markers) {
    var self = this;
    if (!Array.isArray(markers)) markers = [markers];
    var i = 0;
    var results = [];

    var action = function (type, count, marker, icon) {
        if (results.indexOf(type) > -1) return '';
        var markerContent = self.getSummaryItem(markers, marker, type, count, icon);
        if (!markerContent) return '';
        results.push(type);
        return markerContent;
    };

    var content = markers.reduce(function (html, marker) {
        if (!marker.attributes) return html;

        if (Array.isArray(marker.attributes.Description)) {

            html += (marker.attributes.Type ? "<tr><th colspan='2'>" + marker.attributes.Type + "</td></tr>" : '');
            return marker.attributes.Description.reduce(function (html, desc) {
                return html + action(desc.Name, desc.Count, marker, { fill: esri.Color(desc.Colour) });
            }, html);
        }
        var type = marker.attributes.Type;

        if (type === undefined) return html;

        if (typeof type == "string") {
            return html + action(type, marker.attributes.Count, marker);
        }
        return Object.keys(type)
            .map(function (m) {
                return type[m];
            })
            .sort(function (a, b) {
                return b.Count - a.Count;
            })
            .reduce(function (html, type) {
                return html + action(type.Name, type.Count, marker);
            },
            html);
    }, '');

    if (!content) return '';
    return "<table class='map-tooltip'>" + content + "</table>";
};

/**
 * Get summary html of marker in cluster or stack.
 * @param {Array.<Marker>} markers The markesr in the stack.
 * @param {}
 */
MarkerLayerVM.prototype.getSummaryItem = function (markers, graphicData, type, count, icon) {
    var self = this;

    type = type || graphicData.Type;

    //var marker = markers.find(function (m) {
    //    return m.attributes.Type === type && m.attributes !== graphicData;
    //})

    var markerImage = self.getMarkerImage(graphicData, type, icon);

    if (!markerImage) return '';

    if (markerImage.indexOf('<') < 0) {
        markerImage = "<img src='" + markerImage + "' alt=''/>";
    }

    count = count || markers.filter(function (m) {
        return m.attributes.Type === type && m.attributes !== graphicData;
    })
        .reduce(function (count, marker) {
            return count + marker.attributes.Count;
        }, graphicData.Count || 0);

    if (type && type.indexOf('__') >= 0) {
        type = type.substring(type.lastIndexOf('__') + 2);
    }

    var markerContent = "<tr><th>{{IMAGE}}<span>&nbsp;</span></th><td>{{TYPE}} {{COUNT}}</td></tr>";
    markerContent = markerContent
        .replace("{{IMAGE}}", markerImage)
        .replace("{{TYPE}}", type || '')
        .replace("{{COUNT}}", count ? "(" + count + ")" : '');

    return markerContent;
};

MarkerLayerVM.prototype.getMarkerImage = function (marker, type, icon) {
    if (typeof marker.attributes.Type == "string")
        return marker.attributes.Style.key(icon)

    if (marker.attributes.Type[type] && marker.attributes.Type[type].Style)
        return marker.attributes.Type[type].Style.key();

    var shape = marker.getShape();

    switch (shape.shape.type) {
        case "image":
            if (typeof marker.attributes.Type == "string")
                return shape.shape.src;

            if (marker.attributes.Type[type])
                return marker.attributes.Type[type].getIcon();

            return shape.shape.src;
        case "path":
        case "circle":
        case "star":
            var color = function (col) {
                return "rgb(" + col.r + ", " + col.g + ", " + col.b + ")";
            };
            var fill = "fill:" + color(shape.fillStyle) + ";";
            var stroke = shape.strokeStyle;
            var line = "stroke:" + color(stroke.color) + ";stroke-width:" + stroke.width + "px;";
            var path = '';
            var bound = {
                height: 10,
                width: 10
            };
            switch (marker.geometry.type) {
                case "point":
                    switch (shape.shape.type) {
                        case "circle":
                            path = '<circle cx="5" cy="5" r="' + ((10 - stroke.width) / 2) + '" style="' + fill + line + '"/>';
                            break;
                        case "star":
                            path = '<polygon points="10,1 4,19.8 19,7.8 1,7.8 16,19.8" style="' + fill + line + '"></polygon>';
                            bound = {
                                height: 20,
                                width: 20
                            };
                            break;
                        default:
                            var bbox = shape.bbox;
                            var d = shape.shape.path;
                            var transform = ((bbox.t - bbox.b) < 20 && (bbox.r - bbox.l) < 20) ? "" : " transform='translate(-" + bbox.l + "," + bbox.t + "')";

                            path = "<path d='" + d + "' style='" + fill + line + "'" + transform + "/>";
                            bound = {
                                height: bbox.t - bbox.b,
                                width: bbox.r - bbox.l
                            };
                            break;
                    }
                    break;
                case "polygon":
                    path = '<circle cx="5" cy="5" r="' + ((10 - stroke.width) / 2) + '" style="' + fill + line + '"/>';

                    bound = {
                        height: 10,
                        width: 10
                    };
                    break;
            }

            return "data:image/svg+xml;base64," + window.btoa('<svg viewBox="0 0 ' + bound.width + ' ' + bound.height + '"  xmlns="http://www.w3.org/2000/svg" class="marker-key">' + path + '</svg>');
        default:
            break;
    }
};


/**
 * Find markers in this layer at a given extent and return the data via the callback.
 * @param {esri.Extent} extent - the extent to search within.
 * @param {function} callback - the callback function to return the markers to.
 */
MarkerLayerVM.prototype.findMarkerAt = function (extent, callback) {
    if (extent.type == "point") {
        extent = {
            xmin: extent.x,
            xmax: extent.x,
            ymin: extent.y,
            ymax: extent.y,
        };
    }
    if (self.type !== layerTypeEnum.Marker) return [];

    var markers = self.getLayer(layerTypeEnum.Marker).graphics.filter(function (graphic) {
        var x = graphic.geometry.x,
            y = graphic.geometry.y;
        return x >= extent.xmin &&
            x <= extent.xmax &&
            y >= extent.ymin &&
            y <= extent.ymax;
    });
    if (callback && typeof callback == "function") callback(markers);
    return markers;
};

/**
 * Show Marker information.
 * @param {Marker} marker
 */
MarkerLayerVM.prototype.showMarkerInfo = function (marker) {
    var self = this;

    self.breadcrumbs = [];
    var mapExtent = esri.geometry.webMercatorToGeographic(self.map.extent);

    if (marker && marker.IsClickable) {
        var breadcrumb = new MapBreadcrumb(
            marker.Id,
            marker.Title,
            marker.Type,
            marker.Level,
            {
                minX: mapExtent.xmin,
                minY: mapExtent.ymin,
                maxX: mapExtent.xmax,
                maxY: mapExtent.ymax,
            }
        );

        self.breadcrumbs.push(breadcrumb);
        self.displayMarkerInfo(breadcrumb);
    }
};


MarkerLayerVM.prototype.displayMarkerInfo = function (breadcrumb) {
    var self = this;

    var options = {
        heading: breadcrumb.title,
        data: breadcrumb.data
    };

    if (breadcrumb.content) {
        options.content = breadcrumb.content;
    } else {
        options.url = self.options.contentUrl + "?" +
            self.search.calculateQueryString({
                id: breadcrumb.id,
                aggregation: breadcrumb.Level,
                type: typeof breadcrumb.type == "object" ? Object.keys(breadcrumb.type) : breadcrumb.type,
                categoryName: self.options.categoryName,
                zoom: self.adjustZoom(breadcrumb)
            });
    }

    self.showPopup(options);
};

MarkerLayerVM.prototype.adjustZoom = function (breadcrumb) {
    var zoom = this.map.getZoom() + 2;
    if (zoom < 4) zoom = 4;
    else if (zoom < 8) zoom = 9;

    if (breadcrumb.Level == EnumLevel.Region) zoom = 4;
    if (breadcrumb.Level == EnumLevel.Country) zoom = 6;
    if (breadcrumb.Level == EnumLevel.Province) zoom = 11;

    return zoom;
};


MarkerLayerVM.prototype.applyBreadcrumb = function (key) {
    var self = this;

    var breadcrumb;

    while (breadcrumb = self.breadcrumbs.pop()) {
        if (breadcrumb.id === key) break;

        Object.keys(breadcrumb.facets).forEach(function (f) {
            self.facets.removeFacet(f, breadcrumb.facets[f], undefined, true);
        });
    }

    self.navigateBreadcrumb(breadcrumb);

    self.search.updateResults();
};

MarkerLayerVM.prototype.navigateBreadcrumb = function (breadcrumb) {
    var self = this;

    self.savePopupToBreadcrumb();

    self.breadcrumbs.push(breadcrumb);

    self.onUpdateFuncitons.push(function () {
        self.displayMarkerInfo(breadcrumb);
    });

    if (breadcrumb.extent.minX && breadcrumb.extent.minY) {
        self.options.applyMapExtent(breadcrumb.extent);
    }
};

MarkerLayerVM.prototype.drilldown = function (data) {
    console.log(data, this);
    var self = this;

    var breadcrumb = new MapBreadcrumb(
        data.Id,
        data.Title,
        data.Type,
        data.Level, {
            minX: data.SW_Longitude,
            minY: data.SW_Latitude,
            maxX: data.NE_Longitude,
            maxY: data.NE_Latitude
        },
        data.Facets
    );

    if (data.Facets) {
        Object.keys(data.Facets).forEach(function (facet) {
            self.facets.applyFacet(facet, data.Facets[facet], true, undefined, true);
        });
    }

    self.navigateBreadcrumb(breadcrumb);
    self.search.updateResults();
};

MarkerLayerVM.prototype.showDocument = function (title, url) {
    var self = this;

    //On a new breadcrumb being added, save the current popup content
    self.savePopupToBreadcrumb();

    self.breadcrumbs.push(new MapBreadcrumb(title, title));

    self.showPopup({
        heading: title,
        url: url
    });
};

/**
 * Will save the contents of the current popup to the active breadcrumb. So that it can be navigated to quicker in the future rather than re-requesting the URL.
 */
MarkerLayerVM.prototype.savePopupToBreadcrumb = function () {
    var self = this;
    if (self.breadcrumbs.length > 0) {
        var crumb = self.breadcrumbs[self.breadcrumbs.length - 1];
        crumb.content = self.getPopupContent();
        crumb.data = self.popupData();
    }
};

MarkerLayerVM.prototype.getMarker = function (name) {
    name = name.replace(/\+/g, ' ').replace(/%26/g, '&');
    var style = window.markerStyles[name] || window.markerStyles[name.replace(/(?:.+?__)*(.+)/g, '$1')];
    if (!style) return null;
    return style.key();
};

/**
 * Gets and sets up the CommandsVM is it exists.
 */
MarkerLayerVM.prototype._getCommandsVM = function () {
    var self = this;
    if (!window.CommandsVM) return null;

    return new CommandsVM(self.search, {
        category: self.options.urlKey || self.options.categoryName || 'map',
        commandsType: 'map',
        urlPrefix: self.options.urlKey && "/" + self.options.urlKey + "/",
        selectedRecordsFn: function () {
            var selectedEventsNumber = 0;

            var graphicsLayer = self.getLayer(self.type);

            if (!graphicsLayer || !graphicsLayer.visible) return selectedEventsNumber;

            selectedEventsNumber = graphicsLayer.graphics.length;
            // text symbols contain number of JTIC events so add them up to get a total.
            // Additionally, some do not have text symbols (single hits), so add number of symbols
            //and remove two for each text node (1 for the pic and one for the text)
            for (var gr = 0; gr < graphicsLayer.graphics.length; gr++) {
                var graphics = graphicsLayer.graphics[gr];
                if (!graphics.symbol || graphics.symbol.type != "textsymbol") continue;

                var eventNumber = parseInt(graphics.symbol.text, 10);
                if (eventNumber == NaN) continue;

                selectedEventsNumber = selectedEventsNumber + eventNumber - 2;
            }

            return selectedEventsNumber;
        },
        getVisibleMarkers: function () {
            var graphicsLayer = self.getLayer(self.type);
            var markerIds = [];

            for (var idx = 0; idx < graphicsLayer.graphics.length; idx++) {
                var markers = graphicsLayer.graphics[idx];
                if (!markers.symbol || markers.symbol.type === "textsymbol") continue;
                var ids = markers.attributes.Id.split(",") || [];
                markerIds = markerIds.concat(ids);
            }
            return markerIds;
        }
    });
};

MarkerLayerVM.prototype.getLegend = function (data) {
    var self = this;
    var html = '';
    if (self.options.colours && self.options.colours.length) {
        if (self.options.colours[0].Stop !== undefined) {
            var id = 'linerGrad_' + self.id;
            html += '<div class="relative"><svg xmlns="http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" width="20" height="100" class="u-margin-Rs">' +
                '<defs><linearGradient id="' + id + '"' +
                'x1 = "0%" y1= "100%" ' +
                'x2 = "0%" y2= "0%" ' +
                'spreadMethod = "pad" >';
            html += self.options.colours.reduce(function (h, col) {
                return h + '<stop offset="' + (col.Stop * 100) + '%" stop-color="' + esri.Color(col.Colour) + '" stop-opacity="1" />';
            }, '');
            html += '</linearGradient ></defs>' +
                '<rect width="20" height="100"  style="fill:url(#' + id + ')" /></svg>';
            var min, max, type = '';
            if (self.type == layerTypeEnum.Heatmap) {
                max = self.layerSettings.heatmapMax();
                min = self.layerSettings.heatmapMin();
                type = '(' + self.options.choropleth[self.layerSettings.choropleth()] + ')';
            } else {
                max = data.Markers.reduce(function (max, marker) {
                    return Math.max(max, marker.Count);
                }, 0);
                min = data.Markers.reduce(function (min, marker) {
                    return marker.Count ? Math.min(min, marker.Count) : min;
                }, max);
                if (data.Markers.length) type = '(' + data.Markers[0].Type + ')';
            }
            html +=
                '<span class="absolute" style="top:0">' + max + ' ' + type + '</span>' +
                '<span class="absolute" style="bottom:0">' + min + ' ' + type + '</span>' +
                '</div>';
        }
        if (self.options.colours[0].Max !== undefined) {
            html += '<ul class="list-unstyled">';
            var colours = self.options.colours.sort(function (a, b) { return a.Max - b.Max; });
            html += colours.reduce(function (html, colour) {
                return html +
                    '<li class="u-margin-Bxxs"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align: bottom;" class="u-margin-Rs"><rect width="20" height="20" fill="' + esri.Color(colour.Colour) + '" /></svg>' +
                    '<span>' + colour.Min + ' - ' + colour.Max + '</span></li>';
            }, '');
            html += '</ul>';
        }
    }

    self.legend(html);
    return html;
};


MarkerLayerVM.prototype.GetSubLayers = function () {
    var self = this;
    if (!self.hasFacets) return;

    var facetPanel;
    self.facets.facetPanels().forEach(function (group) {
        group.facets().forEach(function (panel) {
            if (panel.facetKey && self.subLayerKey() && panel.facetKey.toUpperCase() === self.subLayerKey().toUpperCase()) {
                facetPanel = panel;
                return false;
            }
        });

        if (facetPanel) return false;
    });

    if (!facetPanel) return;


    function convertLayer(layer, i, sublayers) {
        var newLayer = new FacetMapLayerVM(layer, self);
        sublayers.splice(i, 1, newLayer);
        newLayer.icon(self.getMarker(newLayer.value));
        return newLayer;
    }
    function getLayers(parent, sublayers, f) {
        var children = f.children();
        children.forEach(function (c, i) {
            var layer = sublayers().filter(function (l) {
                return l.value === c.value;
            });
            if (!layer.length) {
                layer = [convertLayer(c, i, sublayers)];
            }

            layer = layer[0];
            if (layer.constructor !== FacetMapLayerVM) {
                layer = convertLayer(layer, i, sublayers);
            }

            layer.count(c.count());
            layer.icon(self.getMarker(layer.value));
            parent.children.splice(i, 1, layer);
            layer.parentLayer = parent;
            if (c.constructor == FacetTreeVM) {
                layer.icon('');
                layer.templateName('template-facet-layer-tree');
                layer.isLoading(true);
                if (!c.children().length) {
                    c.facetLoadedCallbacks.push(getLayers.bind(self, layer, layer.children));
                } else {
                    getLayers(c, layer.children, layer);
                    layer.isLoading(false);
                }
                c.expand();
            }

            layer.updateSelectedFromSearch();
            parent.isLoading(false);
        });
        sublayers().forEach(function (sl, i) {
            if (children.filter(function (c) { return c.value == sl.value }).length == 0) {
                sublayers.splice(i, 1);
            }
        });
    }

    facetPanel.panelLoadedCallbacks.push(getLayers.bind(self, facetPanel, self.subLayers));

    if (facetPanel.isLoading()) {
        return;
    }

    facetPanel.facetsVM.markAsOpened(facetPanel.facetKey, '');

    if (!facetPanel.children().length) {
        facetPanel.discoverChildren();
        return;
    }
    getLayers(facetPanel, self.subLayers, facetPanel);
};

MarkerLayerVM.prototype.popover = function (popover) {
    var self = this,
        html = '';

    if (self.options.popover && Object.keys(self.options.popover).length) {
        html = ko.renderTemplate('template-layer-value-over', self, {}, popover.$target.find('.webui-popover-content')[0]);
    }

    return html;
};

MarkerLayerVM.prototype.popoverOnShow = function ($popup) {
    $popup.find(".close").focus();
};

MarkerLayerVM.prototype.popoverOnHide = function ($popup) {
    var elem = $popup.data('trigger-element');
    elem.focus();
};

MarkerLayerVM.prototype.getSubLayers = function () {
    var self = this;
    self.search.submit(self.search.updateRequestSender.dontSearch);
};
/**
 * 
 * @param {Object} cluster Data about the clustered points.
 * @param {string} style
 * @param {number=} size = 100
 */
function ClusterSymbol(cluster, style, size) {
    size = size || 100;
    var border = 3;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" ';
    var shape = null;
    var clusterArr = Object.keys(cluster)
        .map(function (type) {
            shape = shape || (/^marker_/.test(cluster[type].Image) ? cluster[type].Image : null);
            return {
                name: type,
                Count: cluster[type].Count,
                Colour: cluster[type].Colour
            };
        })
        .sort(function (a, b) {
            return b.Count - a.Count;
        });

    if (shape) svg += 'xmlns:xlink="http://www.w3.org/1999/xlink" ';
    svg += 'viewBox="0 0 ' + (size + border) + ' ' + (size + border) + '">';
    var action = style == "pie" ? ClusterPie :
        style == "tree" ? ClusterTree :
            function () { };
    if (shape) svg += ClusterShape(action, shape, clusterArr, size, border);
    else svg += action(clusterArr, size, border);

    svg += "</svg>";

    return "data:image/svg+xml;base64," + window.btoa(svg);
}

/**
 * Create a symbol that constrains the pie or tree within a maker shape.
 * @param {requestCallback} internalShape function to created the multi colours within the shape.
 * @param {string} symbol The name of the shape.
 * @param {Array.<Marker>} cluster The Points to be clustered
 * @param {number=} size The size of the marker
 * @param {number=} border The size of the border
 */
function ClusterShape(internalShape, symbol, cluster, size, border) {
    var symbolPath = document.getElementById(symbol);
    if (!symbolPath) return internalShape(cluster, size, border);
    var symbolD = symbolPath.firstElementChild.getAttribute('d');
    var scale = (size + border) / symbolPath.viewBox.baseVal.width;
    return ['<defs><path id="p" d="' + symbolD + '" style="transform:scale(' + scale + ')"/><clipPath id="a"><use xlink:href="#p"/></clipPath></defs>',
    '<g clip-path="url(#a)"><g transform="matrix(2 0 0 2 -' + ((size + border) / 2) + ' -' + ((size + border) / 2) + ')">',
    internalShape(cluster, size, border),
        '</g></g><use xlink:href="#p" fill="none" stroke="white" stroke-width="0.5"/>'].join('');

}

/**
 * Creates a Pie marker
 * @param {Array.<Marker>} cluster The Points to be clustered
 * @param {number=} size The size of the marker
 * @param {number=} border The size of the border
 */
function ClusterPie(cluster, size, border) {

    var svg,
        borderWidth = border !== undefined ? border : 2,
        size = size !== undefined ? size : 100,
        total = cluster.reduce(function (tot, marker) {
            return tot + marker.Count;
        }, 0),
        offset = 0;

    function createArc(percentage, offset) {
        var START = Math.PI * 0.5;
        var TAU = Math.PI * 2;
        var shift = borderWidth / 2;
        var center = size / 2 + shift;
        var radius = size / 2;
        var start = offset || 0;

        var offsetX = radius - Math.cos(START + start * TAU) * radius + shift;
        var offsetY = radius - Math.sin(START - start * TAU) * radius + shift;

        var targetX = radius - Math.cos(START + (percentage + start) * TAU) * radius + shift;
        var targetY = radius - Math.sin(START - (percentage + start) * TAU) * radius + shift;
        var largeArcFlag = percentage > 0.5 ? 1 : 0;
        var points = [
            'M ' + offsetX + ' ' + offsetY,
            'A ' + radius + ' ' + radius + ' 0 ' + largeArcFlag + ' 1 ' + targetX + ' ' + targetY,
            'L ' + center + ' ' + center, 'Z'
        ];
        return points.join(' ');
    }

    svg = cluster.reduce(function (svg, marker) {
        var percentage = marker.Count / total;
        svg += '<path d="' + createArc(percentage, offset) + '" style="fill:' + marker.Colour + ';stroke:none;"/>';
        offset += percentage;
        return svg;
    }, '');

    if (borderWidth) svg += '<circle cx="' + (size / 2 + borderWidth / 2) + '" cy="' + (size / 2 + borderWidth / 2) + '" r="' + (size / 2) + '" style="fill:none;stroke-width:' + borderWidth + ';stroke:white;" />'

    return svg;
}

/**
 * Creates a Tree marker
 * @param {Array.<Marker>} cluster The Points to be clustered
 * @param {number=} size The size of the marker
 * @param {number=} border The size of the border
 */
function ClusterTree(cluster, size, border) {
    var svg,
        borderWidth = border !== undefined ? border : 6,
        x = border / 2,
        y = border / 2,
        width = size !== undefined ? size : 100,
        height = size !== undefined ? size : 100,
        r = 5,
        remaining = {
            Width: width,
            Height: height,
            Top: 0,
            Left: 0
        },
        runningTotal = cluster.reduce(function (count, marker) {
            return count + marker.Count;
        }, 0),
        align = 0;

    /**
     * Draw svg Rounded rectangle
     * @param {number} x  - x-coordinate
     * @param {number} y  - y-coordinate
     * @param {number} w  - width
     * @param {number} h  - height
     * @param {number} r  - corner radius
     * @param {bool} tl - top_left rounded?
     * @param {bool} tr - top_right rounded?
     * @param {bool} bl - bottom_left rounded?
     * @param {bool} br - bottom_right rounded?
     */
    function rounded_rect(x, y, w, h, r, tl, tr, bl, br) {
        var retval;
        retval = "M" + (x + r) + "," + y;
        retval += "h" + (w - 2 * r);
        if (tr) {
            retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r;
        } else {
            retval += "h" + r;
            retval += "v" + r;
        }
        retval += "v" + (h - 2 * r);
        if (br) {
            retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r;
        } else {
            retval += "v" + r;
            retval += "h" + -r;
        }
        retval += "h" + (2 * r - w);
        if (bl) {
            retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r;
        } else {
            retval += "h" + -r;
            retval += "v" + -r;
        }
        retval += "v" + (2 * r - h);
        if (tl) {
            retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r;
        } else {
            retval += "v" + -r;
            retval += "h" + r;
        }
        retval += "z";
        return retval;
    }

    svg = cluster.reduce(function (svg, marker) {
        var size = {
            width: (align % 2 ? marker.Count / runningTotal : 1) * remaining.Width,
            height: (align % 2 ? 1 : marker.Count / runningTotal) * remaining.Height
        },
            offset = {
                top: remaining.Top + (align == 0 ? remaining.Height - size.height : 0),
                left: remaining.Left + (align == 3 ? remaining.Width - size.width : 0)
            },
            tl = offset.top == 0 && offset.left == 0,
            tr = offset.top == 0 && offset.left + size.width == width,
            bl = offset.top + size.height == height && offset.left == 0,
            br = offset.top + size.height == height && offset.left + size.width == width;

        if (align % 2) {
            remaining.Width = remaining.Width - size.width;
            remaining.Height = remaining.Height;
            remaining.Top = remaining.Top;
            remaining.Left = align == 3 ? remaining.Left : remaining.Left + size.width;
        } else {
            remaining.Width = remaining.Width;
            remaining.Height = remaining.Height - size.height;
            remaining.Top = align == 0 ? remaining.Top : remaining.Top + size.height;
            remaining.Left = remaining.Left;
        }

        svg += '<path d="' + rounded_rect(offset.left + x, offset.top + y, size.width, size.height, r, tl, tr, bl, br) + '" fill="' + marker.Colour + '"  stroke="#fff" stroke-width="' + border / 2 + '"/>';

        runningTotal -= marker.Count;
        if (++align == 4) align = 0;

        return svg;
    }, '');

    return svg +
        "<rect x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' rx='" + r + "' ry='" + r + "' stroke='#fff' stroke-width='" + border + "' fill='none'/> ";
}

window.markerStyles = [];

window.EnumLevel = {
    Individual: 0,
    Stacked: 1,
    Province: 2,
    Country: 3,
    Region: 4
};

function MapBreadcrumb(id, title, type, Level, extent, facets) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.Level = Level;
    this.extent = extent;
    this.facets = facets || [];
}
