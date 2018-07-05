function MapA11y(map) {
    var self = this;
    var container = $(map.container);
    var active = false;
    var view;
    var searchResults = [];
    var panelWasOpen = false;
    var isClick = true;
    var $description;

    document.addEventListener('keydown', function () {
        isClick = false;
    });
    document.addEventListener('click', function () {
        isClick = true;
    });

    self.onFocus = function (e) {
        if (isClick !== false) return;
        container.addClass('focus');
        $(document).on('keydown', onKeyDown)
            .on('keyup', onKeyUp);
        active = true;

        showResults('');
        createGraphic();
        //map.enableKeyboardNavigation();
    };
    self.onBlur = function (e) {
        if ($(e.relatedTarget).parents('#a11yResults').length) return;
        container.removeClass('focus');
        $(document).off('keydown', onKeyDown)
            .off('keyup', onKeyUp);
        active = false;
        map.graphics.remove(view);
        hideResults();
        //map.disableKeyboardNavigation();
    };
    var keyCodes = [107, 61, 187, 109, 173, 189, 38, 104, 39, 102, 40, 98, 37, 100, 33, 105, 34, 99, 35, 97, 36, 103];

    function onKeyDown(e) {
        map.navigationManager._keyDown.apply(map.navigationManager, arguments);
        if (keyCodes.indexOf(e.keyCode) >= 0) {
            return false;
        }
        return handleNumbers(e);
    }

    function onKeyUp(e) {
        map.navigationManager._keyEnd.apply(map.navigationManager, arguments);
        if (keyCodes.indexOf(e.keyCode) >= 0) {
            return false;
        }
    }
    map.on("extent-change", function (e) {
        if (!active) return;
        createGraphic();
    });

    function handleNumbers(e) {
        if (!active) return;
        if (e.target == map.__container && e.keyCode == 13) {
            $('#a11yResults a').eq(0).focus();
        }
        if (isNaN(e.key)) return;
        var marker = searchResults[+e.key];
        if (!marker) return;
        marker._layer.onClick.call({
            e_graphic: marker
        });
        return false;
    }
    /**
     *  Add a highlight graphic to the map and use it to navigate/query content
     */
    function createGraphic() {
        map.graphics.clear();
        var fillSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol({
                color: new esri.Color([0, 0, 0, 0.8]),
                width: 1
            }),
            new esri.Color([0, 0, 0, 0.2])
        );
        var centerPoint = map.extent.getCenter();
        _mapPageVM.showCoordinates(centerPoint);
        var tolerance = map.getScale() / 60;
        var extent = new esri.geometry.Extent({
            xmin: centerPoint.x - tolerance,
            ymin: centerPoint.y - tolerance,
            xmax: centerPoint.x + tolerance,
            ymax: centerPoint.y + tolerance,
            spatialReference: centerPoint.spatialReference
        });
        var polygon = new esri.geometry.Polygon({
            rings: [
                [
                    [extent.xmin, extent.ymin],
                    [extent.xmax, extent.ymin],
                    [extent.xmax, extent.ymax],
                    [extent.xmin, extent.ymax],
                    [extent.xmin, extent.ymin]
                ]
            ],
            spatialReference: centerPoint.spatialReference
        });
        view = new esri.Graphic(polygon, fillSymbol, {
            extent: esri.geometry.webMercatorToGeographic(extent)
        });
        map.graphics.add(view);
        queryFeatures(view);
    }
    map.__container.setAttribute('tabindex', 0);

    $(map.__container).on('focus', self.onFocus);
    $(map.__container).on('blur', self.onBlur);

    function queryFeatures(graphic) {
        var layers = _mapPageVM.LayerManagerVM.Layers().filter(function (l) {
            return l.isVisible() && l.esriLayers[l.type].graphics.length;
        });
        
        var i = 1;
        var container = $('<div/>');
        var description = '';
        var result = layers.forEach(function (layer) {
            if (i > 9) return;

            var points = layer.esriLayers[layer.type].graphics.filter(function (g) {
                return isInExtent(g);
            });
            if (!points.length) return;

            points.forEach(function (p) {
                if (!p.attributes || !p.attributes.IsClickable) return;
                if (i > 9) return;
                searchResults[i] = p;
                var title = (p.attributes.Title || p.attributes.Type || '');
                description += i + ', ' + title + (p.attributes.Count ? ', ' + p.attributes.Count + ' items' : '') + '. ';
                var link = $('<a href="#" class="pull-left u-margin-Rs" style="max-width: 25%;padding: 0 .5em;border-bottom: 3px solid #ccc;"><h4><span class="badge u-margin-Rxxs">' + (i++) + '</span> ' + title + '</h4>' + layer.getSummary([p]) + '</a>');
                link.on('click', function () {
                    p._layer.onClick.call({
                        e_graphic: p
                    });
                    return false;
                });
                link.on('blur', self.onBlur);
                container.append(link);
            });
        });

        $('#a11yResults').html('').append(container);
        $description.text(description || 'No markers in highlighted area');
        $description.toggleClass('italic', !description);
        $description.toggleClass('sr-only', !!description);
    }

    function showResults(html) {
        panelWasOpen = !_mapPageVM.temporalSlider.closed();
        _mapPageVM.temporalSlider.closed(false);
        var results = $('#a11yResults');
        $('#temporalSlider').hide();
        if (!results.length) {
            results = $('<div id="a11yResults"></div>');
            $description = $('<div aria-atomic="true" aria-live="assertive" role="alert" class="text-center u-padding-Vxl"></div>');
            results.append($description);
            var parent = $('<div/>').append($description).append(results);
            $('.map-panel-bottom.panel-bottom').append(parent);
        }
        if (html !== undefined) {
            results.html(html);
        }
        results.show();
    }

    function hideResults() {
        _mapPageVM.temporalSlider.closed(!panelWasOpen);
        $('#temporalSlider').show();
        $('#a11yResults').hide();
    }

    function isInExtent(graphic, extent) {
        return (extent || view.attributes.extent).intersects(graphic.geometry);
    }
}