window.Explorer = window.Explorer || {};

Explorer.TreeVM = function (options) {
    var self = this;

    self.options = $.extend({
        containerId: undefined,
        category : "",

        //Graphic Options
        transitionTime: 750,
        childNodeRadius: 10,
        parentNodeRadius: 20,
        branchDepth: 200,

        colours: {
            default: "#0097D1",
            highlight: "#F7941D",
            inactive: "#A1ABB2"
        },

        margin: {
            left: 100,
            top: 100
        },
        orientation: 'vertical',

        // Data Options
        rootId: undefined,
        childId: undefined,
        data: [],

        properties: {
            id: "ID",
            name: "Name",
            children: "Children",
            recordId: "ID",
            colour: "ColourHex",
            isHighlighted: "IsSelected",
            isMatch: "IsMatch",
            isFamily: "IsFamily"
        },

        //Google Analytics Options
        analytics: {
            category: "Explorer",
            nodeSelected: "Node Selected"
        }
    }, options);

    self.d3Tree = null;
    self.svg = null;
    self.diagonal = null;
    self.zoomer = null;
    self.data = null;
    self.height = null;
    self.width = null;
    self.hasSetup = false;
    self.selectedItem = ko.observable(new Explorer.ExplorerItemVM());
    self.isLoading = ko.observable(false);
    self.highlightedNode = undefined;

    self.setup();

    self.data = [];

    if (self.options.data !== undefined && self.options.data.length > 0) {
        self.onDataReady(data);
    } else if (self.options.rootId) {
        self.isLoading(true);
        self.loadData(self.options.rootId, self.options.childId, self.onDataReady.bind(self));
    }
};

Explorer.TreeVM.prototype.onDataReady = function (data) {
    var self = this;
    self.data = data;
    self.prepareData(self.data);
    self.data.children.forEach(self.collapse.bind(self));
    self.highlightedNode = self.findSelectedNode(self.data);
    self.isLoading(false);
    if (self.highlightedNode) {
        self.centreNode(self.highlightedNode);
    } else {
        self.centreTree();
    }

    self.render(self.data);

};

Explorer.TreeVM.prototype.loadData = function (rootId, childId, callback) {
    var self = this;
    $.get("/" + self.options.category + "/Tree", { rootId: rootId, childId: childId }, callback);
};

Explorer.TreeVM.prototype.clear = function () {
    var self = this;
    self.data = {};
    self.highlightedNode = undefined;
    if (self.hasSetup) {
        window.d3.select("#" + self.options.containerId).selectAll("div.svg-container").remove();
        self.hasSetup = false;
    }
};

Explorer.TreeVM.prototype.getCoordiantes = function (x, y, obj) {
    var self = this;
    if (self.options.orientation === "horizontal") {
        return { x: obj[x], y: obj[y] };
    } else {
        return { x: obj[y], y: obj[x] };
    }
};

/**
 * Zoom to a particular node within the tree.
 * @param {object} node - The node to be centred.
 */
Explorer.TreeVM.prototype.centreNode = function (node) {
    var self = this;
    if (node) {

        var x;
        var y;

        if (self.options.orientation === "horizontal") {
            x = self.width / 2 - node.y;
            y = self.height / 2 - node.x;
        } else {
            x = self.width / 2 - node.x;
            y = self.height / 2 - node.y;
        }

        if (isNaN(x) || isNaN(y)) {
            self.centreTree();
        } else {
            self.panArea(x, y, 1, true);
        }
    }
};

/**
 * Centre the tree (at the root).
 */
Explorer.TreeVM.prototype.centreTree = function () {
    var self = this;
    var position = self.options.orientation === "horizontal"
        ? { x: self.options.margin.left, y: self.height / 2 }
        : { x: self.width / 2, y: self.options.margin.top };

    self.panArea(position.x, position.y, 1, true);
};

/**
 * Move the view around to a specific coordinate and scale.
 * @param {integer} toX - The X coordinate.
 * @param {integer} toY - The Y coordinate.
 * @param {double} toScale - How much to zoom in or out. Will default to '1' if undefined.
 * @param {boolean} animate - Whether or not to animate/transition the movement.
 */
Explorer.TreeVM.prototype.panArea = function (toX, toY, toScale, animate) {

    var self = this;
    toScale = toScale || 1;
    var duration = animate ? self.options.transitionTime : 0;

    self.svg.transition().duration(duration).attr("transform", "translate(" + toX + "," + toY + ") scale(" + toScale + ")");
    self.zoomer.translate([toX, toY]);
    self.zoomer.scale(toScale);
};

Explorer.TreeVM.prototype.prepareData = function (data) {
    var self = this;

    data.x0 = self.width / 2;
    data.y0 = self.height / 2;

    if (!data.hasOwnProperty("id")) {
        data.id = data[self.options.properties.id];
    }

    if (!data.hasOwnProperty("name")) {
        data.name = data[self.options.properties.name];
    }

    if (!data.hasOwnProperty("children")) {
        data.children = data[self.options.properties.children];
    }

    if (!data.hasOwnProperty("recordId")) {
        data.recordId = data[self.options.properties.recordId];
    }

    if (!data.hasOwnProperty("colour")) {
        data.colour = data[self.options.properties.colour] || self.options.colours.default;
    }

    if (!data.hasOwnProperty("isHighlighted")) {
        data.isHighlighted = data[self.options.properties.isHighlighted] || false;
    }

    if (!data.hasOwnProperty("isMatch")) {
        data.isMatch = data[self.options.properties.isMatch] || false;

    }

    if (!data.hasOwnProperty("isFamily")) {
        data.isFamily = data[self.options.properties.isFamily] || false;
    }

    data.children.forEach(self.prepareData.bind(self));
};

Explorer.TreeVM.prototype.setup = function () {
    var self = this;

    self.d3Tree = window.d3.layout.tree().nodeSize([70, 40]);
    self.diagonal = window.d3.svg.diagonal()
        .projection(function (d) {
            var c = self.getCoordiantes("y", "x", d);
            return [c.x, c.y];
        });

    var domContainer = document.getElementById(self.options.containerId);
    self.width = domContainer.offsetWidth;
    self.height = domContainer.offsetHeight;

    var position = self.options.orientation === "horizontal" ? { x: self.options.margin.left, y: self.height / 2 } : { x: self.width / 2, y: self.options.margin.top };

    self.svg = window.d3.select("#" + self.options.containerId)
        .insert("div", ":first-child")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        .attr("viewBox", "0 0 " + self.width + " " + self.height)
        .classed("svg-content-responsive", true)
        .call(self.zoomer = window.d3.behavior.zoom()
            .on("zoom", self.rescale.bind(self))
            .center([self.width / 2, self.height / 2]))
        .append("g")
        .attr("transform", "translate(" + position.x + "," + position.y + ")");

    //necessary so that zoom knows where to zoom and unzoom from
    self.zoomer.translate([position.x, position.y]);
    self.hasSetup = true;
};

Explorer.TreeVM.prototype.expand = function (d) {
    var self = this;
    if (d._children) {
        d.children = d._children;
        d.children.forEach(self.expand.bind(self));
        d._children = null;
    } else {
        if (d.children && d.children.length > 0) {
            d.children.forEach(self.expand.bind(self));
        }
    }
};

Explorer.TreeVM.prototype.collapse = function (d) {
    var self = this;
    if (d.children) {
        d._children = d.children;
        d._children.forEach(self.collapse.bind(self));
        d.children = null;
    }
};

Explorer.TreeVM.prototype.render = function (source) {
    var self = this;

    // Compute the new tree layout.
    var nodes = self.d3Tree.nodes(self.data).reverse();
    var links = self.d3Tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * self.options.branchDepth;
    });

    try {
        self.renderNodes(self.svg, nodes, source);
        self.renderLinks(self.svg, links, source);
    } catch (e) {
        console.log(e);
    }

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
};

Explorer.TreeVM.prototype.click = function (item) {
    var self = this;

    if (item.children) {
        item._children = item.children;
        item.children = null;
    } else {
        item.children = item._children;
        item._children = null;
    }

    self.render(item);
};

Explorer.TreeVM.prototype.hasChildren = function (d) {
    var self = this;
    return (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
};

Explorer.TreeVM.prototype.isExpanded = function (d) {
    var self = this;
    return (d.children && d.children.length > 0);
};

Explorer.TreeVM.prototype.nodeRadius = function (d) {
    var self = this;
    var nodeType = self.hasChildren(d) ? self.options.parentNodeRadius : self.options.childNodeRadius;
    return nodeType;
}

Explorer.TreeVM.prototype.expandAll = function () {
    var self = this;
    self.expand(self.data);
    self.render(self.data);
};

Explorer.TreeVM.prototype.collapseAll = function () {
    var self = this;
    self.data.children.forEach(self.collapse.bind(self));
    self.render(self.data);
};

Explorer.TreeVM.prototype.switchTreeOrientation = function () {
    var self = this;
    if (self.options.orientation === "horizontal") {
        self.options.orientation = "vertical";
        self.panArea(self.width / 2, self.options.margin.top, 1, true);
    } else {
        self.options.orientation = "horizontal";
        self.panArea(self.options.margin.left, self.height / 2, 1, true);
    }

    self.render(self.data);
};

Explorer.TreeVM.prototype.renderNodes = function (svg, nodes, source) {
    var self = this;
    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes,
        function (d) {
            return d[self.options.properties.id];
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter()
        .append("g")
        .attr("class", function (d) {
            var isHighlighted = d.IsMatch ? " highlighted" : "";
            var ishighlightedVariant = (self.highlightedNode === d) ? " selectedVariant " : "";
            return "node" + isHighlighted + ishighlightedVariant;
        })
        .attr("transform",
        function (d) {
            var c = self.getCoordiantes("y0", "x0", source);
            return "translate(" + c.x + "," + c.y + ")";
        })
        .style("opacity", 0)
        .on("click", self.click.bind(self))
        .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
            self.showItemDetails(d);
        })
        .on("mouseover",
        function (d) {
            window.d3.select(this)
                .select("image.node-information")
                .transition()
                .style("opacity", 1)
                .style("pointer-events", "auto");
        })
        .on("mouseout",
        function (d) {
            window.d3.select(this)
                .select("image.node-information")
                .transition()
                .delay(200)
                .style("opacity", 0)
                .style("pointer-events", "none");
        });

    nodeEnter.append("circle")
        .attr("r", self.nodeRadius.bind(self))
        .attr("class", "node-circle")
        .attr("stroke-width", 1)
        .style("fill", function (d) {
            return self.determineColour(d);
        });

    var nodesWithChildren = nodeEnter.filter(function (d) {
        return self.hasChildren(d);
    })
        .append("g")
        .attr("transform",
        function () {
            return "translate(" + 7 + "," + 7 + ")";
        });;

    nodesWithChildren.append("circle")
        .attr("r", 8)
        .attr("class", "node-circle-expander")
        .attr("fill", "#FFF")
        .attr("stroke-width", 1);

    nodesWithChildren.append("svg:image")
        .attr("class", "node-expander-icon")
        .attr("xlink:href",
        function (d) {
            var colour = self.determineColour(d, true);
            var blueToCollapse =
                "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%22200%22%20width%3D%22200%22%20viewBox%3D%220%200%201000%201000%22%3E%3Cpath%20fill%3D%22%23" + colour + "%22%20d%3D%22M893.15%20411v107q0%2022-16%2038t-38%2015h-678q-23%200-38-15t-16-38V411q0-23%2016-38t38-16h678q22%200%2038%2016t16%2038z%22%2F%3E%3C%2Fsvg%3E";
            var blueToExpand =
                "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%22200%22%20width%3D%22200%22%20viewBox%3D%220%200%201000%201000%22%3E%3Cpath%20fill%3D%22%23" + colour + "%22%20d%3D%22M893.15%20411v107q0%2022-16%2038t-38%2015h-232v233q0%2022-16%2037t-38%2016h-107q-22%200-38-16t-15-37V571h-232q-23%200-38-15t-16-38V411q0-23%2016-38t38-16h232V125q0-22%2015-38t38-16h107q23%200%2038%2016t16%2038v232h232q22%200%2038%2016t16%2038z%22%2F%3E%3C%2Fsvg%3E";
            return self.isExpanded(d) ? blueToCollapse : blueToExpand;
        })
        .attr("width", 15)
        .attr("height", 15)
        .attr("y", -7)
        .attr("x", -7.5);

    nodeEnter.append("text")
        .attr("class", "node-title")
        .attr("x",
        function (d) {
            return self.hasChildren(d) ? -25 : -15;
        })
        .attr("y",
        function (d) {
            return self.options.orientation === "horizontal" ? (self.hasChildren(d) ? -25 : -15) : 0;
        })
        .attr("transform", function (d) {
            return "rotate(30)";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function (d) {
            var name = self.decodeValue(d.name);
            return name;
        });

    nodeEnter.append("svg:image")
        .attr("class", "node-information")
        .attr("x",
        function (d) {
            return self.hasChildren(d) ? 10 : 6;
        })
        .attr("y",
        function (d) {
            return self.hasChildren(d) ? -40 : -30;
        })
        .attr("width", 20)
        .attr("height", 20)
        .attr("xlink:href", function (d) {
            var colour = self.determineColour(d, true);
            return "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%22200%22%20width%3D%22200%22%20viewBox%3D%220%200%201000%201000%22%3E%3Cpath%20fill%3D%22%23" + colour + "%22%20d%3D%22M642.45%20768v-89q0-8-5-13t-12-5h-54V375q0-8-5-13t-13-5h-178q-8%200-13%205t-5%2013v89q0%208%205%2013t13%205h53v179h-53q-8%200-13%205t-5%2013v89q0%208%205%2013t13%205h250q7%200%2012-5t5-13zm-71-500v-89q0-8-5-13t-13-5h-107q-8%200-13%205t-5%2013v89q0%208%205%2013t13%205h107q8%200%2013-5t5-13zm357%20232q0%20117-57%20215t-156%20156-215%2058-216-58-155-156-58-215%2058-215%20155-156%20216-58%20215%2058%20156%20156%2057%20215z%22%2F%3E%3C%2Fsvg%3E";
        })
        .style("opacity", 0)
        .style("pointer-events", "none")
        .on("click",
        function (d) {
            self.showItemDetails(d, window.d3.event.pageX, window.d3.event.pageY);
            window.d3.event.stopPropagation();
        })
        .append("title")
        .text(function (d) {
            return "Click to view more information about the " + self.decodeValue(d.name);
        });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(self.options.transitionTime)
        .attr("class", function (d) {
            var isHighlighted = d.IsMatch ? " highlighted" : "";
            var isHighlightedVariant = (self.highlightedNode === d) ? " selectedVariant " : "";
            return "node" + isHighlighted + isHighlightedVariant;
        })
        .attr("transform", function (d) {
            var c = self.getCoordiantes("y", "x", d);
            return "translate(" + c.x + "," + c.y + ")";
        })
        .style("opacity", 1);

    nodeUpdate.select("text.node-title")
        .attr("x", function (d) {
            return self.options.orientation === "horizontal" ? (self.hasChildren(d) ? -25 : -15) : 0;
        }).attr("y", function (d) {
            return self.options.orientation === "horizontal" ? 0 : -30;
        });

    nodeUpdate.select("image.node-information")
        .attr("xlink:href",
        function (d) {
            var colour = self.determineColour(d, true);
            return "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%22200%22%20width%3D%22200%22%20viewBox%3D%220%200%201000%201000%22%3E%3Cpath%20fill%3D%22%23" + colour + "%22%20d%3D%22M642.45%20768v-89q0-8-5-13t-12-5h-54V375q0-8-5-13t-13-5h-178q-8%200-13%205t-5%2013v89q0%208%205%2013t13%205h53v179h-53q-8%200-13%205t-5%2013v89q0%208%205%2013t13%205h250q7%200%2012-5t5-13zm-71-500v-89q0-8-5-13t-13-5h-107q-8%200-13%205t-5%2013v89q0%208%205%2013t13%205h107q8%200%2013-5t5-13zm357%20232q0%20117-57%20215t-156%20156-215%2058-216-58-155-156-58-215%2058-215%20155-156%20216-58%20215%2058%20156%20156%2057%20215z%22%2F%3E%3C%2Fsvg%3E";
        });

    nodeUpdate.select("circle.node-circle")
        .attr("r", self.nodeRadius.bind(self))
        .attr("stroke-width", 1)
        .style("fill", function (d) {
            return self.determineColour(d);
        });

    node.select("image.node-expander-icon")
        .attr("xlink:href",
        function (d) {
            var colour = self.determineColour(d, true);
            var blueToCollapse =
                "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%22200%22%20width%3D%22200%22%20viewBox%3D%220%200%201000%201000%22%3E%3Cpath%20fill%3D%22%23" + colour + "%22%20d%3D%22M893.15%20411v107q0%2022-16%2038t-38%2015h-678q-23%200-38-15t-16-38V411q0-23%2016-38t38-16h678q22%200%2038%2016t16%2038z%22%2F%3E%3C%2Fsvg%3E";
            var blueToExpand =
                "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%22200%22%20width%3D%22200%22%20viewBox%3D%220%200%201000%201000%22%3E%3Cpath%20fill%3D%22%23" + colour + "%22%20d%3D%22M893.15%20411v107q0%2022-16%2038t-38%2015h-232v233q0%2022-16%2037t-38%2016h-107q-22%200-38-16t-15-37V571h-232q-23%200-38-15t-16-38V411q0-23%2016-38t38-16h232V125q0-22%2015-38t38-16h107q23%200%2038%2016t16%2038v232h232q22%200%2038%2016t16%2038z%22%2F%3E%3C%2Fsvg%3E";
            return self.isExpanded(d) ? blueToCollapse : blueToExpand;
        });

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(self.options.transitionTime)
        .attr("transform", function (d) {
            var c = self.getCoordiantes("y", "x", source);
            return "translate(" + c.x + "," + c.y + ")";
        })
        .style("opacity", 0)
        .remove();
};

Explorer.TreeVM.prototype.renderLinks = function (svg, links, source) {
    var self = this;

    // Update the links…
    var link = self.svg.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", function (d) {
            var isHighlighted = d.target.IsMatch ? " highlighted" : "";
            return "link" + isHighlighted;
        })
        .attr("d", function (d) {
            var o = {
                x: source.x0,
                y: source.y0
            };

            return self.diagonal({
                source: o,
                target: o
            });
        })
        .style("stroke", function (d) {
            return self.options.colours.inactive;
        });

    // Transition links to their new position.
    link.transition()
        .duration(self.options.transitionTime)
        .attr("class", function (d) {
            var isHighlighted = d.target.IsMatch ? " highlighted" : "";
            return "link" + isHighlighted;
        })
        .attr("d", self.diagonal)
        .style("stroke", function (d) {
            return self.options.colours.inactive;
        });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(self.options.transitionTime)
        .attr("d", function (d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return self.diagonal({
                source: o,
                target: o
            });
        }).remove();
};

Explorer.TreeVM.prototype.rescale = function () {
    var self = this;

    var translate = window.d3.event.translate;
    self.panArea(translate[0], translate[1], window.d3.event.scale, false);
};

Explorer.TreeVM.prototype.resize = function () {
    var self = this;

    var domContainer = document.getElementById(self.options.containerId);
    self.width = domContainer.offsetWidth;
    self.height = domContainer.offsetHeight;
    window.d3.select("svg").attr("viewBox", "0 0 " + self.width + " " + self.height);
};

Explorer.TreeVM.prototype.showItemDetails = function (node, mouseX, mouseY) {
    var self = this;
    var name = self.decodeValue(node.name);
    var item = new Explorer.ExplorerItemVM(node.recordId, name);

    Analytics.event(self.options.analytics.category, self.options.analytics.nodeSelected, name + " (" + node.recordId + ")");

    self.selectedItem(item);
};

Explorer.TreeVM.prototype.zoomReset = function () {
    var self = this;

    var position = self.options.orientation === "horizontal" ? { x: self.options.margin.left, y: self.height / 2 } : { x: self.width / 2, y: self.options.margin.top };

    self.panArea(position.x, position.y, 1, true);
};

Explorer.TreeVM.prototype.zoom = function (factor, zoomIn) {
    var self = this;

    if (factor === undefined || zoomIn === undefined) {
        self.zoomReset();
        return null;
    }

    var direction = zoomIn ? 1 : -1;
    var target_zoom = 1;
    var center = [self.width / 2, self.height / 2];
    var extent = self.zoomer.scaleExtent();
    var translate = self.zoomer.translate();
    var translate0 = [];
    var l = [];
    var view = { x: translate[0], y: translate[1], k: self.zoomer.scale() };

    target_zoom = self.zoomer.scale() * (1 + factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    self.panArea(view.x, view.y, view.k, true);
};

/**
* Replaces url encoded values with the "real life" characters.
* @param {string} value - The value to decode.
* @returns {string} - A decoded string value.
*/
Explorer.TreeVM.prototype.decodeValue = function (value) {
    if (value !== undefined && value !== null && typeof (value) === 'string') {
        value = value.replace(/\+/g, '%20'); //decodeURI component won't decode +
        value = value.replace(/&amp;/g, '&');
        value = decodeURIComponent(value);
    }

    return value;
};

Explorer.TreeVM.prototype.determineColour = function (d, removeHash) {
    var self = this;

    removeHash = removeHash || false;

    var result = self.options.colours.inactive;

    if (d.isHighlighted) {
        result = self.options.colours.highlight;
    } else if (d.isMatch) {
        //result = d.isFamily ? "#ff0000" : d.colour;
        result = d.colour;
    }

    if (!removeHash && result[0] !== "#") {
        result = "#" + result;
    } else if (removeHash && result[0] === "#") {
        result = result.substring(1);
    }

    return result;
};

Explorer.TreeVM.prototype.findSelectedNode = function (tree) {
    var self = this;
    var foundNode = undefined;
    if (self.data) {
        if (tree.isHighlighted) {
            if (tree._children) {
                self.click(tree);
            } else if (tree.children) {
                tree.children.forEach(self.collapse.bind(self));
            }
            return tree;
        }

        if (tree.children) {
            for (var i = 0; i < tree.children.length; i++) {
                var child = tree.children[i];
                var searchedNode = self.findSelectedNode(child);
                if (searchedNode) {
                    foundNode = searchedNode;
                }
            }

            if (foundNode === undefined) {
                self.click(tree);
            }
        } else if (tree._children) {
            for (var j = 0; j < tree._children.length; j++) {
                var privateChild = tree._children[j];
                var privateSearchedNode = self.findSelectedNode(privateChild);
                if (privateSearchedNode) {
                    foundNode = privateSearchedNode;
                }
            }

            if (foundNode) {
                self.click(tree);
            }
        }
    }

    return foundNode;
};