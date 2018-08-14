function MapDrawing(map, layers) {
    var self = this;
    var indexer = 'geoarea';
    var drawTool;
    var editTool;
    var drawingLayer;
    var isMeasuring = false;
    var isEditting = false;

    map.on('measure-start', function () {
        isMeasuring = true;
    });
    map.on('measure-end', function () {
        isMeasuring = false;
    });

    function createToolbar(){
        drawingLayer = new esri.layers.GraphicsLayer({id: 'drawing'});
        map.addLayer(drawingLayer,1);
        drawingLayer.show();
        //drawingLayer = map.graphics;
        MapMenu(map, drawingLayer);
        drawTool = new esri.toolbars.Draw(map);
        drawTool.on("draw-end", addToMap);

        map.cs = _checkCS(map.spatialReference);
        var _onMouseMoveHandler = drawTool._onMouseMoveHandler;
        drawTool._onMouseMoveHandler = function(c){
            onMouseMoveHandler(c);
            //_onMouseMoveHandler.apply(drawTool, arguments);
        };

        var _onClickHandler = drawTool._onClickHandler;
        drawTool._onClickHandler = function(c){
            if(!onClickHandler(c)){
                _onClickHandler.apply(drawTool, arguments);
            }
        };
        var _onDblClickHandler = drawTool._onDblClickHandler;
        drawTool._onDblClickHandler = function(c){
            if(!onDblClickHandler(c)){
                _onDblClickHandler.apply(drawTool,arguments);
            }
        };

        var existingAreas = getInitialAreas();

        getExistingAreas(existingAreas);
        makeAreaEditable();
    }

    function _checkCS(map) {
        if (map.wkid)
            return 3857 === map.wkid || 102100 === map.wkid || 102113 === map.wkid ? "Web Mercator" : esri.WKIDUnitConversion[map.wkid] != null ? "PCS" : "GCS";
        if (map.wkt)
            return -1 !== map.wkt.indexOf("WGS_1984_Web_Mercator") ? "Web Mercator" : 0 === map.wkt.indexOf("PROJCS") ? "PCS" : "GCS"
    }
    var onDblClickHandler = function(c){
        var draw = esri.toolbars.Draw;
        if(drawTool._geometryType !== draw.POLYGON){
            return false;
        }

        var points = drawTool._points;
        var spatialReference = map.spatialReference;

        var last = points[points.length - 1];
        var penult = points[points.length - 2];
        points = last && penult && last.x === penult.x && last.y === penult.y ? points.slice(0, points.length - 1) :  points.slice(0, points.length);

        if (!drawTool._graphic || points.length < 2){
            return false;
        }

        var poly = new esri.geometry.Polygon(spatialReference);
        var newPoints = [].concat(points, [points[0].offset(0, 0)]);
        if(esri.geometry.Polygon.prototype.isClockwise(newPoints) || drawTool.respectDrawingVertexOrder){
            newPoints.reverse();
        }

        poly.addRing(newPoints);

        dojo.disconnect(drawTool._onMouseMoveHandler_connect);
        drawTool._clear();
        drawTool._setTooltipMessage(0);
        drawTool._drawEnd(densifyGeometry(poly));
        return true;
    };
    var onMouseMoveHandler = function(c) {
        var a;
        if(map.snappingManager){
            a = map.snappingManager._snappingPoint;
        }

        var b = drawTool._points[drawTool._points.length - 1];
        c = a || c.mapPoint;
        a = drawTool._tGraphic;
        var d = a.geometry;//new geometry /polyline here
        var oldLine = d.removePath(0);
        switch (drawTool._geometryType) {
            case esri.toolbars.Draw.POLYLINE:
            case esri.toolbars.Draw.POLYGON:
            d.addPath([b.offset(0, 0), c.offset(0, 0)]);
            a.setGeometry(densifyGeometry(d));
            break;
        }
    };

    var onClickHandler = function(c) {
        c = c.mapPoint;
        switch (drawTool._geometryType){
        case esri.toolbars.Draw.POLYGON:
            if(drawTool._points.length === 0) return false;
            drawTool._points.push(c.offset(0, 0));
            drawTool._graphic.geometry._insertPoints([c.offset(0, 0)], 0);
            drawTool._graphic.setGeometry(densifyGeometry(drawTool._graphic.geometry)).setSymbol(drawTool.fillSymbol);
            var a = drawTool._tGraphic;
            var b = a.geometry;
            b.setPoint(0, 0, c.offset(0, 0)),
            b.setPoint(0, 1, c.offset(0, 0)),
            a.setGeometry(b);
            return true;
        }
        return false;
    };

    function addToMap(event){
        cancelTool();
        var symbol = new  esri.symbol.SimpleFillSymbol();
        var graphic = new esri.Graphic(event.geometry, symbol);
        var shape = geography.encodePolygon(graphic);
        graphic.setAttributes({shape: new CustomArea(null, null,shape)});

        drawingLayer.add(graphic);
        saveArea(graphic);
    }

    function makeAreaEditable(){
        map.on('edit', function(graphic){
            editArea(graphic);
        });
        map.on('deleteDrawing', function(graphic){
            deleteDrawing(graphic);
        });
        map.on('hideDrawing', HideDrawing);
        drawingLayer.on('click', function(e){editArea(e.graphic);});
    }

    function HideDrawing(graphic){
        var reShowBtn = $('#showDrawing');
        reShowBtn.show();
        reShowBtn.on('click', ShowDrawing.bind(this, graphic));
        if(isEditting){
            editTool.deactivate();
            alert.alert('close');
        }
        graphic.hide();
    }
    function ShowDrawing(graphic){
        $('#showDrawing').hide();
        graphic.show();
    }
    function editArea(graphic) {
        if (isEditting === graphic) { return; }
        if (isEditting) {
            stopEditing('cancel');
        }
        if (isMeasuring){ return; }
        if (isDrawing()) { return; }
        editTool = new esri.toolbars.Edit(map);
        editTool.on("deactivate", function(evt) {
            isEditting = false;
        });
        editTool.on("activate", function(e) {
            isEditting = graphic;
        });
        var area = graphic;
        editTool.activate(
            esri.toolbars.Edit.EDIT_VERTICES |
            esri.toolbars.Edit.MOVE |
            esri.toolbars.Edit.SCALE |
            esri.toolbars.Edit.ROTATE, area);

        showMapInfo(function(body){
            body.html('');
            var btn = $("<button class='btn btn-primary'>Apply changes to search area</button>");
            btn.click(stopEditing);
            body.append(btn);

            body.append("<br><br>");

            var btn2 = $("<button class='btn btn-default'>Remove search area</button>");
            btn2.click(stopEditing.bind(self,'delete'));
            body.append(btn2);

            var btnCancel = $("<button class='btn btn-default'>Cancel</button>");
            btnCancel.click(stopEditing.bind(self,'cancel'));
            body.append(btnCancel);
        }).on('closed.bs.alert', function () {
            if(isEditting){
                stopEditing('cancel');
            }
        });

        setupKeyCommands();
        //getExistingAreas();
    }
    self.editArea = function(){
        editArea(areaToBeSaved);
        closePopup();
    }

    function stopEditing(action){
        var state = editTool.getCurrentState();
        editTool.deactivate();
        alert.alert('close');
        if (action === 'delete'){
            deleteDrawing(state.graphic);
        } else if (action === 'cancel'){
            state.graphic.setGeometry(new esri.geometry.Polygon(state.graphic.attributes.shape.getPolygons()));
        } else {//if(state.isModified){
            updateArea(state.graphic);
        }

        $(document).off('keydown.mapDrawing');
    }

    function deleteDrawing(graphic){
        if(isEditting){
            editTool.deactivate();
            alert.alert('close');
        }
        clearSearchArea(graphic);
    }

    function activateTool(shape) {
        drawTool.activate(esri.toolbars.Draw[shape]);
        map.hideZoomSlider();
        layerPacify(true);

        //getExistingAreas();
        setupKeyCommands();
    }

    self.activateTool = activateTool;
    self.newArea = '';

    function getGraphics (){
        return drawingLayer.graphics.filter(function(g){return g.visible;}).map(function(g){
            return esri.geometry.webMercatorToGeographic(g.geometry);
        });
    }

    function setupKeyCommands(){
        $(document).on('keydown.mapDrawing', function(e){
            if(isDrawing()) {
                return; //Currently drawing, esri handles clearing
            }
            switch(e.keyCode){
                case 27: // Escape
                    if(isEditting){
                        stopEditing('cancel');
                    }else{
                        cancelTool();// Stop drawing.
                    }
                    break;
                case 13: //Enter
                    if(isEditting){
                        stopEditing();
                    }
                    break;
                case 46://Delete
                case 8:// backspace
                    if(isEditting){
                        stopEditing('delete');
                    }
                    break;

            }
        });
    }

    function cancelTool(){
        drawTool.deactivate();
        map.showZoomSlider();
        layerPacify(false);
        $(document).off('keydown.mapDrawing');
    }
    var alert;
    function layerPacify(disable){
        var layerCount = eachMapLayer(function(layer){
            layer[disable?'suspend':'resume']();
        });
        if(layerCount){
            if(disable){
                showMapInfo("All layers have been hidden to make selecting an area easier.");
            }else if (alert){
                alert.alert('close');
            }
        }
        drawingLayer.show();
    }
    function showMapInfo(){
        alert = ShowInfo.apply(window, arguments);
        alert.offset({
            top: $(map.container).offset().top + 20
        });
        return alert;
    }
    function eachMapLayer(action){
        var count = 0;
        layers()
        .filter(function(layer){
            return layer.isVisible();
        }).forEach(function(layer){
            Object.keys(layer.esriLayers).forEach(function(key){
                count++;
                action(layer.esriLayers[key]);
            });
        });

        return count;
    }

    function isDrawing(){
        return drawTool && !!drawTool._points.length;
    }
    self.isDrawing = isDrawing;

    function saveArea (graphic){
        areaToBeSaved = graphic;
        var newArea = geography.encodePolygon(graphic);
        newArea = JSON.stringify(newArea);
        showCustomPopup({
            title: 'New search area',
            body: "<div class='text-center'>"+
                "<p><button class='btn btn-primary' data-bind='click:search.bind($data, "+newArea+")'>Search within this area</button></p>"+
                "<p><button class='btn btn-link' data-bind='click:editArea.bind($data)'>Edit this area</button></p>"+
                "<p><form class='form-inline' data-bind='submit:saveNew.bind($data, "+newArea+")'><label for='new-area-name'>Save this area</label>"+
                    "<div class='input-group'><input class='form-control' id='new-area-name' required>"+
                    "<span class='input-group-btn'><button type='submit' class='btn btn-default'>Save Area</button></span></div></form></p>"+
            "</div>",
            modalOptions: {
                backdrop: false
            },
            size: 'sm',
            viewModel: self,
        });
    }
    var areaToBeSaved;
    function updateArea(graphic){
        areaToBeSaved = graphic;
        var oldArea = graphic.attributes.shape.areas[0];
        var updatedArea = geography.encodePolygon(graphic);
        updatedArea = JSON.stringify(updatedArea);
        oldArea = JSON.stringify(oldArea);

        showCustomPopup({
            title: 'Update search area',
            body: "<div class='text-center'>"+
            
            "<p><button class='btn btn-primary' data-bind='click:search.bind($data,  "+updatedArea+", "+oldArea+")'>Search within this area</button></p>"+
            "<p><button class='btn btn-link' data-bind='click:editArea.bind($data)'>Edit this area</button></p>"+
            (!graphic.attributes.shape.id ? '':
                "<p><form class='form-inline' data-bind='submit:saveChanges.bind($data, "+updatedArea+", "+oldArea+", "+graphic.attributes.shape.id+")'>" +
                    "<button type='submit' class='btn btn-default'>Save Change to "+JSON.stringify(graphic.attributes.shape.name)+"</button></span></div></form></p>") +
            "<p><form class='form-inline' data-bind='submit:saveNew.bind($data, "+updatedArea+")'><label for='new-area-name'>Save this area</label>"+
            "<div class='input-group'><input class='form-control' id='new-area-name' required>"+
            "<span class='input-group-btn'><button type='submit' class='btn btn-default'>Save as new</button></span></div></form></p>"+
            "</div>",
            modalOptions: {
                backdrop: false
            },
            size: 'sm',
            viewModel: self,
            closeCallback: function () { },
        });
    }


    function getExistingAreas(areasToJoin) {
        self.isLoadingAreas(true);
        $.ajax('/MapArea/Get').done(function(result){
            self.existingAreas.removeAll();
            result.forEach(function(area){
                self.existingAreas.push(new CustomArea(area.Id,area.Name, area.Feature));
            });
            areasToJoin = areasToJoin || self.viewingArea();
            if(areasToJoin && !Array.isArray(areasToJoin)){
                areasToJoin = [areasToJoin];
            }
            if(areasToJoin && areasToJoin.length){
                areasToJoin.forEach(mergeShapes);
                var firstArea = areasToJoin[0];
                if(Array.isArray(firstArea)){
                    firstArea = firstArea[0];
                }
                if (firstArea.id) {
                    self.viewingArea(firstArea);
                }
                else if(firstArea.attributes && firstArea.attributes.shape.id){
                    self.viewingArea(firstArea.attributes.shape);
                }
            }
            if (self.viewingArea() && self.existingAreas().find(function(area){return area.id === self.viewingArea().id})){
                return;
            }
            self.viewingArea(self.existingAreas()[0]);
        })
        .always(function(){
            self.isLoadingAreas(false);
        });
    }




    function getDefinedAreas() {
        self.isLoadingAreas(true);
        if (self.definedAreas().length) return;
        $.get2('/MapArea/GetPredefined').done(function(result){
            result.forEach(function (area) {
                //console.log('area : '+ area.Id + '-' + area.Name });
                self.definedAreas.push(new CustomArea(area.Id, area.Name, area.Feature, true));
            });
        }).always(function() {
            self.isLoadingAreas(false);
        });
    }

    function mergeShapes(graphic) {
        if (!graphic) return;
        if (Array.isArray(graphic)){
            graphic.forEach(mergeShapes);
            return;
        }
        var data = graphic.attributes ?  graphic.attributes.shape : graphic ;
        if(data.id || !data.areas.length) return;
        self.existingAreas().forEach(function(existingArea){
            if (!existingArea.areasEqual(data)) return;
            data = existingArea;
        });
    }
    function getInitialAreas(){
        var facets = _mapPageVM.facetsVM.getFacetValues(indexer);
        if (!facets || !facets.length){
            return null;
        }

        var areas = facets.join('||').split(/,/g).map(function(area){
            return new CustomArea(null, null, area);
        });
        return areas.map(drawArea.bind(self, map));
    }

    function drawArea(theMap, customArea){
        if(!customArea && theMap.getPolygons){
            customArea = theMap;
            theMap = map;
        }
        var layer = theMap === map
                ? drawingLayer
                : theMap.graphics;
        var shapes = customArea.getPolygons();
        var symbol = new  esri.symbol.SimpleFillSymbol();
        var extent = null;
        var graphics = shapes.map(function(shape){
            var graphic = new esri.Graphic(new esri.geometry.Polygon(shape), symbol, {shape:customArea});
            layer.add(graphic);
            return graphic;
        });
        return graphics;
    }

    function clearSearchArea(graphic){
        var shape = graphic.attributes.shape;
        drawingLayer.remove(graphic);
        self.search(null,shape);
    }
// Needd to update grpahic which areas are being search on edit
    var demoMap;
    function demoMapArea(area){
        var container = document.getElementById('AreaMap');
        if(!container)return;
        var draw = function(){
            demoMap.graphics.clear();
            drawArea(demoMap, area);
            demoMap.setExtent(esri.graphicsExtent(demoMap.graphics.graphics), true);
        };
        if(!demoMap || !container.childElementCount){
            new esri.Map('AreaMap',{
                minZoom: 1, // needs to be higher than expected so the layermanager can nudge it
                maxZoom: 20,
                resizeDelay: 400,
                sliderPosition: "top-right",
                wrapAround180: true,
                basemap: 'streets',
                slider:false,
                logo:false
            }).on('load', function(e){
                demoMap = e.map;
                draw();
            })
            return;
        }
        draw();
    }

    self.setViewingArea = function(area) {
        if (area.areas && area.areas.length > 0) {
            self.viewingArea(area);
        } else {
            self.isLoadingAreas(true);
            $.get2('/MapArea/GetCountryFeatures', {name : area.name}).done(function (result) {
                self.isLoadingAreas(false);
                area.setAreas(result.Feature);
                self.viewingArea(area);
            });
        }
    }

    self.drawAndSearchArea = function(){
        var area = self.viewingArea();
        drawArea(area);
        self.search(area);
    };
    self.drawAndSearchAreaKey = function(target, e){
        if(e.keyCode !== 13){
            return true;
        }
        if(target !== self.viewingArea()){
            return true;
        }
        self.drawAndSearchArea();
    };
    self.isLoadingAreas = ko.observable(false);
    self.existingAreas = ko.observableArray([]);
    self.definedAreas = ko.observableArray([]);
    self.definedAreaSearch = ko.observable();
    self.viewingArea = ko.observable();

    self.definedAreaFiltered = ko.computed(function(){
        var query = self.definedAreaSearch();
        if(!query) return self.definedAreas();
        query = query.toLowerCase();
        return self.definedAreas().filter(function(area){
            return area.name.toLowerCase().indexOf(query) >= 0;
        });
    });
    self.saveNew = function(area, form){
        var name = form[0].value;
        if (!name){
            form[0].error
        }
        $.post('/MapArea/save', {
            name: name,
            areas: area
        }).done(function(d) {
            areaToBeSaved.attributes.shape.name = name;
            areaToBeSaved.attributes.shape.id = d;
            closePopup();
        }).fail(function(d){
            showInfo('A problem occured when saving the area.');
        });
    };

    self.saveChanges = function(area, originalArea, currentArea, form){
        var areaToUpdate = self.existingAreas().filter(function(a){ return a.id === currentArea || a.id === currentArea.id; })[0];
        if(!areaToUpdate) return;// throw or save as new
        if(originalArea){
            areaToUpdate.areas =  areaToUpdate.areas.map(function(a){
                return a === originalArea? area: a;
            });
        }else{
            areaToUpdate.areas.push(area);
        }

        $.post('/MapArea/Update', {
            name:form[0].value || areaToUpdate.name,
            areaId: areaToUpdate.id,
            areas: areaToUpdate.areasValue()
        }).always(function(){
            closePopup();
        });
    }

    self.deleteSavedArea = function(area) {
        if(area.constructor !== CustomArea){
            area = self.viewingArea();
        }
        $.post('/MapArea/Delete', {
            areaId: area.id
        }).done(function(){
            var i = self.existingAreas().indexOf(area);
            if (i < 0) return;
            self.existingAreas.splice(i,1);
            if (!self.existingAreas().length) return;
            if (i >= self.existingAreas().length){
                i = self.existingAreas().length - 1;
            }

            self.viewingArea(self.existingAreas()[i]);
        });
    };

    self.search = function(area, areaToRemove){
        if (area.areasValue() === areaToRemove){ areaToRemove = null; }
        var areaRemoved = areaToRemove;
        if (areaToRemove && areaToRemove.areas) {
            areaRemoved = areaToRemove.areas[0];
        }
        var constraintsToRemove=null;
        if (areaRemoved && typeof areaRemoved === "string") {
            _mapPageVM.facetsVM.removeFacet(indexer, areaRemoved, undefined, true);
            constraintsToRemove = {f:{}};
            constraintsToRemove.f[indexer] = areaRemoved;
        }

        var areaName = area.name;
        area = drawingLayer.graphics
            .filter(function(g){return g.visible;})
            .map(geography.encodePolygon)
            .filter(function(g){return g != areaToRemove}).join(',');
        if(area){
            _mapPageVM.facetsVM.applyFacet(indexer, areaName, true, undefined, true);
        }else{
            _mapPageVM.facetsVM.getFacetValues(indexer).forEach(function(val){
                _mapPageVM.facetsVM.removeFacetQuery(indexer, val);
            });
        }

        _mapPageVM.search.updateHash();
        _mapPageVM.updateLayers(null, constraintsToRemove);

        closePopup();
    };
  
    self.selectCustomArea = function () {
        showCustomPopup({
            title: 'Custom Search Areas',
            body: "<div class='grid'>" +
            "<div class='grid-1-3' style='overflow-y: auto;max-height: 440px;'>" +
                "<ul class='nav nav-tabs nav-stacked' data-bind='foreach: existingAreas, visible:existingAreas().length'>"+
                    "<li data-bind='css:{\"active\":$parent.viewingArea() && $parent.viewingArea().id===$data.id}'>"+
                         "<a href='' data-bind='click: $parent.setViewingArea.bind($parent, $data),event:{keydown:$parent.setViewingArea.bind($parent, $data)}'>" +
                            "<span data-bind='text: name;' class='inline-block width-80'></span>" +
                            "<i class='icon-right-open pull-right'></i>" +
                        "</a>"+
                    "</li>"+
                "</ul>"+
                "</div><div class='grid-2-3 tab-content'>" +
                    "<div class='u-margin-Bxxs' id='AreaMap' style='width: 400px;height: 400px;'></div>" +
                    "<div data-bind='hidden:isLoadingAreas'>" +
                        "<button class='btn btn-primary' data-bind='click: drawAndSearchArea.bind($data,viewingArea)'>Search in this area</button> " +
                        "<button class='btn btn-default' data-bind='click: deleteSavedArea, visible: viewingArea() && viewingArea().canDelete'>Delete saved area</button>" +
                    "</div>" +
                "</div>" +
            "</div>" +
            "<div class='loading text dimmer' data-bind='visible:isLoadingAreas'></div>",
            modalOptions: {
                backdrop: false
            },
            viewModel: self,
            closeCallback: function() {
                if(demoMap) demoMap.destroy();
            },
            openCallback: function () {
                getExistingAreas();
            }
        });
    };

    self.selectArea = function () {
        showCustomPopup({
            title: 'Country Search Areas',
            body: "<div class='grid'>"+
            "<div class='grid-1-3' style='overflow-y: auto;max-height: 440px;'>"+
                '<div data-bind="if:definedAreas().length">' +
                '<div class="form-group has-feedback">' +
                ' <label class="control-label" for="inputSearchAreas">Search Predefined Areas</label>' +
                ' <input type="text" class="form-control" id="inputSearchAreas" data-bind="value:definedAreaSearch,valueUpdate:\'input\'">' +
                ' <span class="icon-search form-control-feedback" aria-hidden="true"></span>' +
                "</div>" +
                "<ul class='nav nav-tabs nav-stacked' data-bind='foreach: definedAreaFiltered, visible:definedAreaFiltered().length'>"+
                    "<li data-bind='css:{\"active\":$parent.viewingArea() && $parent.viewingArea().id===$data.id}'>"+
                         "<a href='' data-bind='click: $parent.setViewingArea.bind($parent, $data),event:{keydown:$parent.setViewingArea.bind($parent, $data)}'>" +
                            "<span data-bind='text: name;' class='inline-block width-80'></span>" +
                            "<i class='icon-right-open pull-right' ></i>" +
                        "</a>"+
                    "</li>"+
                "</ul>"+
                '<div data-bind="visible:!definedAreaFiltered().length">No areas found</div>' +
                "</div>" +
                "</div><div class='grid-2-3 tab-content'>"+
                    "<div class='u-margin-Bxxs' id='AreaMap' style='width: 400px;height: 400px;'></div>" +
                    "<div data-bind='hidden:isLoadingAreas'>" +
                        "<button class='btn btn-primary' data-bind='click: drawAndSearchArea.bind($data,viewingArea)'>Search in this area</button> "+
                        "<button class='btn btn-default' data-bind='click: deleteSavedArea, visible: viewingArea() && viewingArea().canDelete'>Delete saved area</button>"+
                    "</div>" +
                "</div>"+
            "</div>",//+
            //"<div class='loading text dimmer' data-bind='visible:isLoadingAreas'></div>",
            modalOptions: {
                backdrop: false
            },
            viewModel: self,
            closeCallback: function() {
                if (demoMap) demoMap.destroy();
            },
            openCallback: function () {
                getDefinedAreas();
            }
        });
    };

    self.viewingArea.subscribe(function(area){
        demoMapArea(area);
    });

    function densifyGeometry(geometry) {
        var projection = map.cs;
        var esriGeometry = esri.geometry;
        var segmentLength = esriGeometry.getSpheroidInfo(geometry.spatialReference).radius * 0.07848050723825097; //densificationRatio;
        var newGeometry;
        if(projection === "Web Mercator"){
            geometry = esriGeometry.webMercatorToGeographic(geometry);
            newGeometry = esriGeometry.geodesicDensify(geometry, segmentLength);
            newGeometry = esriGeometry.geographicToWebMercator(newGeometry);
        } else if (projection === "PCS") {
            newGeometry = geometry;
        } else {
            newGeometry = esriGeometry.geodesicDensify(geometry, segmentLength);
        }

        return newGeometry
    }

    if (map.loaded) {
        createToolbar();
    } else {
        map.on("load", createToolbar);
    }
}

function CustomArea(id, name, areas, systemShape){
    var self = this;
    self.id = id;
    self.name = name;
    self.areas = [];

    self.setAreas = function (areas) {
        if (Array.isArray(areas)) {
            self.areas = areas;
        } else if (areas) {
            self.areas = areas.split(/,/g);
        } else {
            self.areas = [];
        }
    }

    self.canDelete = !systemShape;

    self.areasEqual = function(other){
        if(!other.areas || other.areas.length !== self.areas.length) return false;
        return self.areas.filter(function(a){
            return other.areas.filter(function(b){
                return b === a;
            }).length === 1;
        }).length === self.areas.length;
    }
    self.getPolygons = function(){
        var polygons = self.areas.map(function(area){
            return geography.decodePolygon(area);
        });
        if(polygons.length > 1){
            var newPolygons = [];
            var outside = true;
            var currentPoly;
            for (var i = 0;i<polygons.length;i++) {
                var poly = polygons[i];
                var enclosed = getDirection(poly);
                if(enclosed || outside){
                    currentPoly = [poly];
                    newPolygons.push(currentPoly);
                    outside = false;
                }else{
                    currentPoly.push(poly)
                }
            }
            return newPolygons;
        }
        return polygons;
    };

    function getDirection(ring){
        var len = ring.length;
        var sum = 0;
        for (var i = 0; i < len - 1; i++) {
            var currentPoint = ring[i];
            var nextPoint = ring[i+1];

            sum += (nextPoint[0] - currentPoint[0]) * (nextPoint[1] + currentPoint[1]);
        }

        return sum < 0;
    }
    self.areasValue = function(){
        return self.areas.join(',');
    }

    self.setAreas(areas);
}

var geography = (function(){
    function toAlpha(a){
        var b = [];
        a <<= 1;
        0 > a && (a = ~a);
        do {
            var c = a & 31;
            a >>= 5;
            0 < a && (c |= 32);
            b.push(String.fromCharCode(c + 63))
        } while (0 !== a);
        return b.join("")
    }
    function encodePolygon(graphic){
        var geometry = graphic.geometry;
        if(geometry.spatialReference.wkid === 102100){
            geometry = esri.geometry.webMercatorToGeographic(graphic.geometry);
        }
        var encodedPoly = [];
        var lastP = {
            lat:0,
            lon:0
        };
        geometry.rings[0].forEach(function(point){
            var p = {
                lat: (100000 * point[1]).toFixed(0),
                lon: (100000 * point[0]).toFixed(0)
            };
            encodedPoly.push(toAlpha(p.lat - lastP.lat));
            encodedPoly.push(toAlpha(p.lon - lastP.lon));
            lastP = p;
        });

        return encodedPoly.join('');
    }

    function decodePolygon(str){
        var len = str.length;
        var polygon = Array(Math.floor(str.length / 2));
        var counter = 0;
        var lat = 0;
        var lon = 0;
        for(var i = 0; counter < len; ++i){
            var h = 1,
                l = 0;
            do {
                var char = str.charCodeAt(counter++) - 63 - 1;
                h += char << l;
                l += 5;
            } while (31 <= char);
            lat += h & 1  ? ~(h >> 1) : h >> 1;

            h = 1;
            l = 0;
            do {
                char = str.charCodeAt(counter++) - 63 - 1;
                h += char << l;
                l += 5;
            } while (31 <= char);
            lon += h & 1 ? ~(h >> 1) : h >> 1;

            polygon[i] = [
                lon * 1E-5,
                lat * 1E-5
            ];
        }
        polygon.length = i;
        return polygon;
    }
    return {
        decodePolygon: decodePolygon,
        encodePolygon: encodePolygon
    };
})();