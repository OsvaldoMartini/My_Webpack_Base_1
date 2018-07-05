/**
 * Creates a new Marker object using data from server.
 * @param {Object} marker Data from server
 */
function Marker(marker, dontUpdateStyle) {
    var self = this;

    self.Id = marker.Id;
    self.Title = marker.Title;
    self.Colour = marker.Colour;
    if (self.Colour && self.Colour.substr(0, 1) !== '#' && self.Colour.substr(0, 3) !== 'rgb') {
        var colourParts = self.Colour.split(',', 4);
        self.Colour = 'rgb' + (colourParts.length == 4 ? 'a' : '') + '(' + self.Colour + ')';
    }
    self.Count = marker.Count;
    self.Level = marker.Level || EnumLevel.Individual;
    self.TypeId = marker.TypeId;
    self.Description = marker.Description;

    //Whether or not the marker can be clicked. Determines the cursor style and click functionality if applicable.
    self.IsClickable = true;
    if (self.Description) {
        self.Description = self.Description.replace(/\|/g, "<br/>");

        if (self.Description.substr(0, 1) === '{' || self.Description.substr(0, 1) === '[') {
            try {
                self.Description = JSON.parse(self.Description);
            } catch (e) {

            }
        }
    }
    self.EventDate = marker.Date || '';
    self.Label = marker.Label;

    self.Feature = marker.Feature || [];

    self.Geometry = marker.Geometry || [];

    self.Ranges = marker.Ranges || [];

    if (!marker.Longitude && !marker.Latitude && self.Feature.length == 2 && !isNaN(self.Feature[0])) {
        marker.Longitude = self.Feature[0];
        marker.Latitude = self.Feature[1];
    }

    self.Longitude = marker.Longitude;
    self.Latitude = marker.Latitude;
    self.IsPolygon = false;

    self.MarkerImage = marker.MarkerImage || "/Map/Icon/" + self.TypeId;

    self.Link = marker.Link;
    self.Links = marker.Links;

    if (self.Feature.length > 0 && (self.Feature.length != 2 || Array.isArray(self.Feature[0]))) {
        self.IsPolygon = true;
    }

    if (self.Geometry.length > 0 && self.Geometry.find(function (geometry) { return geometry.type == "polygon" })) {
        self.IsPolygon = true;
    }

    self.Thumbnail = marker.Thumbnail;
    self.Images = marker.Images;
    self.Type = marker.Type;
    this._expandType();

    self.ClusterStyle = marker.ClusterStyle || 0;

    self.Point = new Point(marker.Longitude || 0, marker.Latitude || 0);

    self.Markers = marker.Markers || [];
    self.Style = !!dontUpdateStyle ? null : new PlacemarkStyle(self);

    self.Fill = marker.Style || "STYLE_SOLID";
}

/**
 * Expand json formated Type into an object.
 */
Marker.prototype._expandType = function () {
    if (!this.Type) return;
    if (typeof this.Type == "object") return;
    if (this.Type[0].substr(0, 1) != "{") return;

    var types = eval('(' + this.Type + ')');
    var newType = {};
    Object.keys(types).forEach(function (type) {
        var typeStyle = markerStyles[Object.keys(markerStyles).filter(function (name) {
            return markerStyles[name].acronym == type;
        })[0]];
        if (!typeStyle) return;
        newType[typeStyle.name] = new ExpandedType(
            typeStyle.name,
            typeStyle.icon,
            typeStyle.fill,
            types[type],
            typeStyle
        );
    });
    this._type = this.Type;
    this.Type = newType;
};

/**
 * On mouseover of item in list of markercontent highlight the marker that this is about.
 */
Marker.prototype.highlightMarker = function () {
    var self = this;
    if (!self.Longitude && !self.Latitude) return;
    var map = _mapPageVM.map;
    var highlightLayer = map.getLayer("highlightingLayer");
    if (!highlightLayer) {
        highlightLayer = new esri.layers.GraphicsLayer({
            id: "highlightingLayer"
        });
        map.addLayer(highlightLayer);
    }

    highlightLayer.clear();

    //hide the other bubbles a little bit
    _mapPageVM.setLayersOpacity(0.1);

    var placemark = new PointPlacemark(self, highlightLayer);
    placemark.draw(true);
    highlightLayer.show();
};

Marker.prototype.clearHighlight = function () {
    var self = this;
    if (!self.Longitude && !self.Latitude) return;
    _mapPageVM.map.getLayer("highlightingLayer").hide();

    _mapPageVM.setLayersOpacity(0.9);
};

/**
 * Marker Type expanded Object
 * @param {string} name The name of the marker.
 * @param {string} image The image used as the marker.
 * @param {string} color The color of the marker
 * @param {number=} count The number of items the marker denotes, defaults to 1.
 * @param {object=} style style of the marker object
 */
function ExpandedType(name, image, color, count, style) {
    var self = this;
    self.Count = count || 1;
    self.Colour = color ? (new esri.Color(color)).toCss(true) : '';
    self.Name = name;
    self.Image = image;
    self.Style = style;
}

ExpandedType.prototype.getIcon = function () {
    var self = this;
    if (self.Style) return self.Style.key();
    if (!self.Image) return;
    if (self.Image.indexOf('.') > - 1 || self.Image.indexOf('/') > - 1) {
        return self.Image;
    }

    if (self.Image.indexOf('marker_') == 0) {
        var bound = {
            height: 20,
            width: 20
        };
        var path = '<use xlink:href="#' + self.Image + '" style="fill:' + self.Colour + ';stroke:#fff"/>';
        return '<svg viewBox="0 0 ' + bound.width + ' ' + bound.height + '"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  class="marker-key">' + path + '</svg>';
    }
    debugger;
};

/**
 * Point Placemark.
 * @param {Marker} marker - the marker.
 * @param {esri.Layer} layer - the layer the marker will be added to.
 * @param {object=} data - the data to attach to the placemark
 */
function PointPlacemark(marker, layer, data) {
    var self = this;
    self.marker = marker;
    self.layer = layer;

    self.graphic = null;
    self.graphicLabel = null;
    self.data = data || self.marker;

    self.graphics = [];
}

/**
 * draw a point onto the map layer.
 */
PointPlacemark.prototype.draw = function () {
    var self = this;

    if (self.marker.Ranges && self.marker.Ranges.length) {
        self.drawRanges(self.marker);
    }

    if (self.marker.Geometry && self.marker.Geometry.length) {

        self.drawGeometry(self.marker);
        return;
    }

    self.graphic = new esri.Graphic();
    if (self.marker.Point) {
        self.graphic.setGeometry(self.marker.Point.point());
    }

    if (self.marker.Style.get) {
        self.graphic.setSymbol(self.marker.Style.get());
    }

    if (self.data) {
        self.graphic.setAttributes(self.data);
    }

    if (self.marker.description) {
        var infoTemplate = new esri.InfoTemplate();
        infoTemplate.setTitle(self.marker.Title);
        infoTemplate.setContent((self.marker.description || '').replace(/\|/g, '<br>'));
        self.graphic.setInfoTemplate(infoTemplate);
    }

    self.layer.add(self.graphic);
};

PointPlacemark.prototype.drawGeometry = function (marker) {
    var self = this;

    if (!Array.isArray(marker.Geometry)) {
        return;
    }

    var fixCrossDateline = function (r, i, lines) {
        var v = r.reduce(function (val, p) {
            val.line.push([p[0] > 0 ? p[0] : p[0] + 360, p[1]]);
            if (val.min === undefined) {
                return {
                    min: p[0],
                    max: p[0],
                    line: val.line
                }
            }
            return {
                min: Math.min(val.min, p[0]),
                max: Math.max(val.max, p[0]),
                line: val.line
            }
        }, { line: [] });
        if (v.max > 170 && v.min < -170) {
            return v.line;
        }

        return r;
    };

    marker.Geometry.forEach(function (geom) {
        if (geom.paths) {
            geom.paths = geom.paths
                .map(geography.decodePolygon)
                .map(fixCrossDateline)
        }
        if (geom.rings) {
            geom.rings = geom.rings
                .map(geography.decodePolygon)
                .map(fixCrossDateline)
        }

        var graphic = new esri.Graphic({ geometry: geom });

        if (marker.Style.get) {
            graphic.setSymbol(marker.Style.get(geom.type));
        }

        if (self.data) {
            graphic.setAttributes(self.data);
        }

        if (marker.description) {
            var infoTemplate = new esri.InfoTemplate();
            infoTemplate.setTitle(marker.Title);
            infoTemplate.setContent((marker.description || '').replace(/\|/g, '<br>'));
            graphic.setInfoTemplate(infoTemplate);
        }

        self.graphics.push(graphic);
        self.layer.add(graphic);
    });
};

PointPlacemark.prototype.drawRanges = function (marker) {
    var self = this;

    var fill = new esri.Color(marker.Colour);
    var outline = new esri.Color(marker.Colour);
    fill.a = 0.2;
    outline.a = 0.5;

    var symbol = new esri.symbol.SimpleFillSymbol(
        esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, outline, 1),
        fill);

    var ranges = marker.Ranges;
    ranges.sort(function (a, b) { return b.Value - a.Value });

    for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];

        var circle = new esri.geometry.Circle(
            marker.Point.point(),
            {
                radius: range.Value,
                geodesic : true
            });

        var km = Math.ceil(range.Value / 1000);
        var miles = Math.ceil(range.Value / 1609.344);

        var graphic = new esri.Graphic(circle, symbol);

        graphic.setAttributes({
            Tooltip: range.Key + " range: " + miles + " miles (" + km + "km)",
            IsClickable: false
        });

        self.graphics.push(graphic);
        self.layer.add(graphic);
    }
}

/**
 * Add a label to the map layer.
 */
PointPlacemark.prototype.label = function () {
    var self = this;

    if (self.marker.Point && !self.marker.Point.x && !self.marker.Point.x) {
        return;
    }

    var label = {
        FontSize: "11px",
        FontSizeSmall: "9px",
        Font: "Arial",
        ColourHex: "#ffffff",
        ColourHexSmall: "#ffffff"
    };

    self.graphicLabel = new esri.Graphic();
    if (self.marker.Point) {
        self.graphicLabel.setGeometry(self.marker.Point.point());
    }

    var fontSize = Math.max(Math.floor(self.marker.Style.size / 3), 12);// self.marker.Style.size <= 25 || self.marker.Level > 0 || self.marker.Count > 1 ? label.FontSizeSmall : label.FontSize;
    var colors = self.marker.Style.labelColors();
    var textSymbol = new esri.symbol.TextSymbol(self.marker.Count)
        .setColor(colors.color)
        .setFont(new esri.symbol.Font(fontSize,
            esri.symbol.Font.STYLE_NORMAL,
            esri.symbol.Font.VARIANT_NORMAL,
            esri.symbol.Font.WEIGHT_BOLD,
            label.Font))
        .setOffset(0, -fontSize / 3)
        .setHaloColor(colors.contrast)
        .setHaloSize(1);

    self.graphicLabel.setSymbol(textSymbol);

    self.layer.add(self.graphicLabel);
};

/**
 * 
 * @param {(number|Array.<number>|Point)} x 
 * @param {number=} y 
 * @param {number=} sref 
 */
function Point(x, y, sref) {
    if (Array.isArray(x)) {
        sref = y;
        y = x[1];
        x = x[0];
    }
    if (!y && x.x) {
        y = x.y;
        x = x.x;
        sref = x.sref;
    }

    this.x = this.longitude = x;
    this.y = this.latitude = y;
    this.sref = sref || 4326;
    this._point = null;
    this.point = function () {
        return this._point && this._point.x == this.x && this._point.y == this.y ?
            this._point :
            this._point = new esri.geometry.Point(
                this.x,
                this.y,
                new esri.SpatialReference({
                    wkid: this.sref
                }));
    }
}

(function () {
    var markers = {
    };

    /**
     * Placemark Style
     * @param {string|Marker} icon - name of the icon marker type.
     */
    function PlacemarkStyle(icon, existing) {
        var self = this;
        self.color = null;
        self.size = 20;
        self.lineWidth = 3;
        self.fill = [255, 255, 255, 0.25];
        self.path = null;
        self.type = 'SimpleMarkerSymbol';
        self.icon = icon || '';
        self.offset = {
            X: 0,
            Y: 0
        };
        self.acronym = null;
        self.name = null;
        self.fillStyle = 'STYLE_SOLID';

        self.iconType = icon.TypeId;

        if (icon && icon.constructor === Marker) {
            self.icon = icon.MarkerImage;
            self.color = icon.Colour;
            //if(icon.Count>1)debugger;
            self.size = icon.Count ? Math.pow(Math.log(icon.Count), 2) + self.size : 0;
            self.offset = icon.Offset || self.offset;
            if (typeof icon.Type == "string") self.name = icon.Type;
            else if (Object.keys(icon.Type).length > 1) {
                // need to roll Icon
                self.icon = ClusterSymbol(icon.Type, ["none", "tree", "pie"][icon.ClusterStyle], self.size);
            }

            if (icon.IsPolygon) {
                self.icon = "polygon";
            }

            self.fillStyle = icon.Fill || self.fillStyle;

            if (self.iconType == 24 && !icon.MarkerImage) {
                self.icon = "polygon";
                self.marker = "STYLE_CIRCLE";
                self.size = 2;
            }
        }
        else if (icon && icon.Acro) {
            self.icon = icon.Image;
            self.color = icon.Color;
            self.fill = icon.Fill;
            self.acronym = icon.Acro;
            self.name = icon.Name;
        }

        if (existing) {
            for (var key in existing) {
                if (existing.hasOwnProperty(key))
                    self[key] = self[key] || existing[key];
            }
        }

        self.color = self.color ? new esri.Color(self.color) : null;
        self.fill = self.fill ? new esri.Color(self.fill) : null;

        switch (self.icon) {
            case '':
                break;
            case "polygon":
                self.type = "SimpleFillSymbol";
                self.fill = self.color;
                self.color = self.color ? esri.Color.blendColors(self.color, new esri.Color([0, 0, 0]), 0.4) : new esri.Color([0, 0, 0, 0]);
                break;
            case "circle":
                self.marker = "STYLE_CIRCLE";
                self.color = self.color;
                break;
            case "star":
                self.marker = "STYLE_PATH";
                self.path = "m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z";
                break;
            default:
                if (self.icon && self.icon.indexOf('marker_') == 0) {
                    self.marker = "STYLE_PATH";
                    self.path = document.getElementById(self.icon).firstElementChild.getAttribute('d');
                    self.color = [self.fill, self.fill = self.color][0];
                    self.color = getContrastingColour(self.fill).contrast;
                    if (self.fill.a === undefined || self.fill.a === 1) {
                        self.lineWidth = 1;
                    }


                    break;
                }
                self.type = "PictureMarkerSymbol";
                break;
        }

        self.hash = self.type + ",m:" + self.icon + ",c:" + self.color + self.fill + ",s:" + self.size + ",f:" + self.fillStyle;

        self.labelColors = function () {
            return getContrastingColour(self.fill);
        }

        /**
         * Get Map marker symbol.
         */
        self.get = function (type) {
            var hash = self.hash + type;
            var symbol = markers[hash];
            if (symbol) return symbol;

            switch (type) {
                case "points":
                case "point":
                    if (self.iconType == 24) {
                        //self.type = "SimpleMarkerSymbol";
                    } else {
                        self.type = "PictureMarkerSymbol";
                    }
                    break;
                case "line":
                case "lines":
                    self.type = "SimpleLineSymbol";
                    break;
                case "polygon":
                    if (self.fillStyle == "STYLE_SOLID") {
                        self.type = "SimpleFillSymbol";
                        break;
                    }

                    self.type = "PictureFillSymbol";
                    break;
            }

            switch (self.type) {
                case "SimpleMarkerSymbol":
                    symbol = new esri.symbol.SimpleMarkerSymbol();
                    symbol.setSize(self.size);
                    if (self.marker) symbol.setStyle(self.marker);
                    if (self.fill) symbol.setColor(new esri.Color(self.fill));
                    if (self.color) symbol.setOutline(
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                            new esri.Color(self.color),
                            self.lineWidth));
                    symbol.setOffset(self.offset.X, self.offset.Y);

                    if (self.path) symbol.setPath(self.path);

                    break;
                case "PictureMarkerSymbol":
                    if (!self.size) {
                        return null;
                    }
                    symbol = new esri.symbol.PictureMarkerSymbol(self.icon, self.size, self.size);
                    symbol.setOffset(self.offset.X, self.offset.Y);
                    break;
                case "SimpleLineSymbol":
                    symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, self.color, 2);
                    break;

                case "PictureFillSymbol":
                    symbol = new esri.symbol.PictureFillSymbol();
                    symbol.setHeight(20);
                    symbol.setWidth(20);
                    var fill = '<rect width%3D"4" height%3D"4" fill%3D"' + self.fill + '"/>';
                    switch (self.fillStyle) {
                        case "STYLE_FORWARD_DIAGONAL":
                            symbol.setUrl('data:image/svg+xml;charset=US-ASCII,<svg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" height%3D"20" width%3D"20" viewBox%3D"0 0 4 4">' + fill + '<path d%3D"M-1,1 l2,-2M0,4 l4,-4M3,5 l2,-2" stroke="' + self.color + '" stroke-width%3D".5"/><%2Fsvg>');
                            break;
                    }
                    symbol.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, self.color, 2));
                    break;
                case "SimpleFillSymbol":
                    symbol = new esri.symbol.SimpleFillSymbol(
                        esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, self.color, 2),
                        self.fill);
                    break;
            }

            markers[hash] = symbol;
            return symbol;

        };

        /**
         * Get image for displaying symbol in an html label.
         */
        self.key = function (icon) {
            switch (self.type) {
                case "SimpleMarkerSymbol":
                    var bound = {
                        width: 20,
                        height: 20
                    };
                    var path = '';
                    switch (self.icon) {
                        case "circle":
                        case "polygon":
                            path = '<circle cx="10" cy="10" r="10"';
                            break;
                        case "star":
                            path = '<path d="' + self.path + '"';
                            break;
                        default:
                            if (self.icon.indexOf('marker_') != 0) {
                                return null;
                            }

                            bound = {
                                height: 20,
                                width: 20
                            };
                            path = '<use xlink:href="#' + self.icon + '"';

                            break;
                    }
                    path += ' style="fill:' + self.fill.toCss(true) + ';stroke:' + self.color.toCss(true) + '"/>';
                    return '<svg viewBox="0 0 ' + bound.width + ' ' + bound.height + '"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="marker-key">' + path + '</svg>';

                case "PictureMarkerSymbol":
                    return self.icon && '<img src="' + self.icon + '" alt="' + JSON.stringify(self.name).slice(1, -1) + '" class="marker-key" />';
                case "SimpleFillSymbol":
                case "PictureFillSymbol":
                    icon = icon || {};
                    var path = '<circle cx="10" cy="10" r="9" style="fill:' + (icon.fill || self.fill) + ';stroke:' + (icon.color || self.color) + '"/>';
                    return '<svg viewBox="0 0 20 20"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="marker-key">' + path + '</svg>';
            }
        };
    }

    /**
     * Get the contrasting black or which colour for the given colour.
     * @param {Array.<number>=|Color} colour as an array or rgba
     * @returns {Object} Colour information.
     * @returns {Array.<number>} Object.color - The main black or white colour;
     * @returns {Array.<number>} Object.contrast - The contrasting black or white colour;
     */
    function getContrastingColour(colour) {
        colour = new esri.Color(colour);
        var o = !colour ? 126 : Math.round(((colour.r * 299) +
            (colour.g * 587) +
            (colour.b * 114)) / 1000);
        var white = new esri.Color([255, 255, 255, 1]),
            black = new esri.Color([0, 0, 0, 1]);

        return {
            color: o > 125 ? white : black,
            contrast: o > 125 ? black : white
        };
    }

    window.PlacemarkStyle = PlacemarkStyle;
})();
