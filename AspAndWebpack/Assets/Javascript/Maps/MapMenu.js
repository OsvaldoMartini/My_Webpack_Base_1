function MapMenu(map, graphicsLayer, menuItems){
    var  Menu, MenuItem, MenuSeparator;
    var editToolbar,
        ctxMenuForGraphics,
        ctxMenuForMap,
        selected,
        currentLocation;

    if (!menuItems && Array.isArray(graphicsLayer)){
        menuItems = graphicsLayer;
        graphicsLayer = null;
    }
    if (map.loaded) {
        setupMenu();
    } else {
        map.on("load", setupMenu);
    }

    function setupMenu() {
        require([
            "dijit/Menu", "dijit/MenuItem", "dijit/MenuSeparator"
        ], function (
            _Menu, _MenuItem, _MenuSeparator
        ) {
            Menu = _Menu;
            MenuItem = _MenuItem;
            MenuSeparator = _MenuSeparator;
            createContextMenu(menuItems);
        });
    }

    function createContextMenu(menu) {
        graphicsLayer = graphicsLayer || map.graphics;
        menu = menu || [
            {label: 'Edit', onClick: function () { map.emit('edit', selected);}},
            {label: 'Remove', onClick: function () { map.emit('deleteDrawing', selected);}},
            {label: '_'},
            {label: 'Hide', onClick: function () { map.emit('hideDrawing', selected);}}
        ];

        ctxMenuForGraphics = new Menu({});
        menu.forEach(function (item) {
            if (item.label === '_') {
                ctxMenuForGraphics.addChild(new MenuSeparator());
                return;
            }
            ctxMenuForGraphics.addChild(new MenuItem(item));
        });
        ctxMenuForGraphics.startup();

        graphicsLayer.on("mouse-over", function(evt) {
            // We'll use this "selected" graphic to enable editing tools
            // on this graphic when the user click on one of the tools
            // listed in the menu.
            selected = evt.graphic;

            // Let's bind to the graphic underneath the mouse cursor  
            ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
        });

        graphicsLayer.on("mouse-out", function(evt) {
            ctxMenuForGraphics.unBindDomNode(evt.graphic.getDojoShape().getNode());
        });

        window.ctx = ctxMenuForGraphics;
    }

    // Helper Methods
    function getMapPointFromMenuPosition(box) {
        var x = box.x, y = box.y;
        switch (box.corner) {
        case "TR":
            x += box.w;
            break;
        case "BL":
            y += box.h;
            break;
        case "BR":
            x += box.w;
            y += box.h;
            break;
        }

        var screenPoint = new Point(x - map.position.x, y - map.position.y);
        return map.toMap(screenPoint);
    }
}