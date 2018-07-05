// Copyright © IHS Energy 2010

// Check/Un-Check child nodes
function treCmpTree_NodeChecked(treeId, nodeId, checked) {
    var selectedNode = igtree_getNodeById(nodeId);
    var childNodes = selectedNode.getChildNodes();
    var tag = selectedNode.getTag();
    if (tag != null) {
        var value = tag.split("|")[0];
        var controlStub = selectedNode.WebTree.UniqueId.replace(/\$/g, "_");
        controlStub = controlStub.replace("treCmpTree", "");
        var hiddenSelectionId = controlStub + "hidTreeSelection";
        var applyButtonId = controlStub.replace("tree_", "btnApply");

        for (var i = 0; i < childNodes.length; i++) {
            childNodes[i].setEnabled(!checked);
            childNodes[i].setChecked(checked);
            childNodes[i].setClass(childNodes[i].getClass() + " treeClass");
        }

        //ManageParentNode(selectedNode);

        if (selectedNode.getEnabled()) {
            var numberChecked = ManageCheckedNodes(hiddenSelectionId, value, checked);

            var applyButton = GetObject(applyButtonId);
            if (applyButton != null) {
                applyButton.disabled = (numberChecked == 0);

                addApplyStateToArray(applyButtonId, !applyButton.disabled);
            }
        }
    }
}

// Manage the parent node, check it if all children are checked
function ManageParentNode(selectedNode) {
    var parentNode = selectedNode.getParent();
    if (parentNode != null) {
        var tag = parentNode.getTag();
        if (tag != null) {
            var checkedCount = 0;
            var siblingNodes = parentNode.getChildNodes();
            for (var i = 0; i < siblingNodes.length; i++) {
                if (siblingNodes[i].getChecked()) {
                    checkedCount++;
                }
            }

            if (checkedCount == siblingNodes.length) {
                parentNode.setChecked(true);
            } else if (parentNode.getChecked()) {
                // parentNode.setChecked(false);
            }
        }
    }
}

// Manage checked nodes
function ManageCheckedNodes(hiddenSelectionId, value, addFlag) {
    var hidden = GetObject(hiddenSelectionId);
    var checkedNodes = new Array();
    if (hidden.value != "") {
        checkedNodes = hidden.value.split("|");
    }

    if (addFlag) {
        //add the node if not already added
        var found = false;
        for (var x = 0; x < checkedNodes.length; x++) {
            if (checkedNodes[x] == value) {
                found = true;
                break;
            }
        }

        if (!found) {
            checkedNodes[checkedNodes.length] = value;
        }
    }
    else {
        for (var x = 0; x < checkedNodes.length; x++) {
            if (checkedNodes[x] == value) {
                checkedNodes.splice(x, 1);
                break;
            }
        }
    }

    hidden.value = checkedNodes.join("|");

    return checkedNodes.length;
}

// Process Demand Load
// There is a need to save the tag value of the node being expanded and its parents.
// This is done because most nodes are added to the tree 'on demand' via callbacks - these
// dynamically added nodes are not available in view state, and therefore the server-side
// NodeExpanded event will be passed the wrong node when it fires for dynamically created nodes.
// The tag tree list is used to work out which node has really been expanded and re-built the tree
function treCmpTree_DemandLoad(treeId, nodeId) {
    _lastServerContact = new Date();

    var tree = igtree_getTreeById(treeId);
    var node = igtree_getNodeById(nodeId);
    var tagTree = node.getTag();
    var parentNode = node;

    // Build a pipe delimited list of tag values for this node and all its parents
    if (node.getLevel() > 0) {
        do {
            parentNode = parentNode.getParent();
            tagTree = parentNode.getTag().split("|")[0] + "|" + tagTree;
        }
        while (parentNode.getLevel() > 0)
    }

    parentNode.setTag(tagTree);
}

// Stop postbacks on Node Expand if the node is already populated
// (The server side code resets LoadOnDemand to false when a node
// is populated meaning a subsequent collapse and re-expand of the node
// results in a PostBack, not a CallBack - the Infragistics Client Side
// Object model offers no way to cancel a callBack, but does offer a way to
// cancel a PostBack - grr!!)
var longest;
function treCmpTree_NodeExpand(treeId, nodeId) {
    var tree = igtree_getTreeById(treeId);
    var node = igtree_getNodeById(nodeId);

    updateTreeWidth(tree, node, true);

    if (typeof (_treeLoadingText) != "undefined" && node.getText() == _treeLoadingText) {
        tree.CancelPostBack = true;
    }
    else if (node.hasChildren()) {
        if (node.getChildNodes().length > 0) {
            tree.CancelPostBack = true;
        }
    }
}

function treCmpTree_NodeCollapsed(treeID, nodeID) {
    var tree = igtree_getTreeById(treeID);
    var node = igtree_getNodeById(nodeID);

    updateTreeWidth(tree, node, false);
}

function treCmpTree_InitializeTree(treeID, nodeID) {
    var tree = igtree_getTreeById(treeID);

    updateTreeWidth(tree, null, null);
}

function updateTreeWidth(tree, node, expanding) {
    longest = 0;
    calculateTreeWidth(tree, node, expanding);

    var minWidth = 280;
    var newWidth = Math.max(minWidth, longest * 8);

    if (tree.Id != undefined && tree.Id.indexOf("CrossProduct") == -1) {
        $(tree.Element).width(newWidth).css('overflow', 'hidden');
    }
}

function calculateTreeWidth(tree, node, expanding) {
    var items;
    if (tree.getNodes != undefined)
        items = tree.getNodes();
    else
        items = tree.getChildNodes();

    $.each(items, function (index, item) {
        var tempLength = item.getText().length + (item.getLevel() * 3);
        if (tempLength > longest)
            longest = tempLength;

        if (expanding) {
            if (item.getExpanded() == true || item == node) {
                calculateTreeWidth(item, node, expanding);
            }
        }
        else {
            if (item.getExpanded() == true && item != node) {
                calculateTreeWidth(item, node, expanding);
            }
        }
    });
}

// Process Node Clicked events
function treCmpTree_NodeClick(treeId, nodeId, button) {
    var node = igtree_getNodeById(nodeId);

    node.setChecked(!node.getChecked());
    node.setSelected(false);
}

try {
    Sys.Application.notifyScriptLoaded();
}
catch (e) {; }