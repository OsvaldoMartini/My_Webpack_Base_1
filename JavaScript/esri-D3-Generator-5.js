require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/number",
    "dojo/on",
    "dojo/parser",
    "dojo/ready"
], function (Map, FeatureLayer, array, dom, number, on, parser, ready) {
    parser.parse();

    var map, layer, quantize;

    ready(function () {
        map = new Map("map", {
            basemap: "gray",
            center: [139.742661, 35.371135],
            zoom: 5
        });
        addEarthquakes();
    });

    function addEarthquakes() {
        var earthquakes = new FeatureLayer("https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Earthquakes/Since_1970/MapServer/0", {
            id: "earthquakes",
            styling: false
        });

        // Apply D3's Quantitative Scales
        if (earthquakes.surfaceType === "svg") {
            // construct a linear quantitative scale with a discrete output range
            // A scale's input domain is the range of possible input data values
            quantize = d3.scale.quantize().domain([0, 9]).range(d3.range(5));

            on(earthquakes, "graphic-draw", function (evt) {
                var attrs = evt.graphic.attributes, Magnitude = (attrs && attrs.Magnitude) || undefined, range;
                range = quantize(Magnitude);
                evt.node.setAttribute("data-classification", range);
            });
            createLegend();
        } else {
            alert("Your browser does not support SVG.\nPlease user a modern web browser that supports SVG.");
            dom.byId("legend").innerHTML = "Your browser does not support SVG.";
        }
        map.addLayer(earthquakes);
        return earthquakes;
    }

    function createLegend() {
        var swatchTemplate =
            '<div>' +
            '<svg width="24" height="24" version="1.1" xmlns="https://www.w3.org/2000/svg">' +
            '<path d="M 11 11 L 12 11 L 12 12 L 11 12 Z" data-classification="${classification}" />' +
            '</svg>' +
            '<span>${label}</span>' +
            '</div>';

        var html = "", inverted, data, legend = dom.byId("legend");

        // quantize.range() returns the scale's current output range
        array.forEach(quantize.range(), function (rangeVal) {
            // Returns the extent of values in the input domain [x0, x1] for the corresponding value in the output range y
            inverted = quantize.invertExtent(rangeVal);

            data = {
                label: number.format(inverted[0], { places: 2 }) + " - " + number.format(inverted[1], { places: 2 }),
                classification: rangeVal
            };
            html += esri.substitute(data, swatchTemplate);
        });
        legend.innerHTML = legend.innerHTML + html;
    }
});