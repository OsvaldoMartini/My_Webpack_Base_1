
/**
 * Functionality to improve the accessibility of bootstrap style components
 * Heavily inspired by http://oaa-accessibility.org/
 */
var accessibility = function () {

    /**
     * keyCodes() is an object to contain keycodes needed for the application 
     */
    function keyCodes() {
        // Define values for keycodes 
        this.tab = 9;
        this.enter = 13;
        this.esc = 27;

        this.space = 32;
        this.pageup = 33;
        this.pagedown = 34;
        this.end = 35;
        this.home = 36;

        this.left = 37;
        this.up = 38;
        this.right = 39;
        this.down = 40;

        this.asterisk = 106;
    }
    
    var tabpanel = function (panel) {
        var self = this;
        self.$panel = panel;
        self.keys = new keyCodes();
        self.$tabs = self.$panel.find('[role="tab"]');
        self.$panels = self.$panel.find('[role="tabpanel"]');
        self.accordian = false;

        self.setupAria();

        self.bindHandlers();
        self.init()
    };

    tabpanel.prototype.init = function () {
        var self = this;
        var $tab; // the selected tab
        self.$panels.attr('aria-hidden', 'true');
        self.$panels.filter('.fade:not(.active)').removeClass('in'); // if .fade remove .in
        $tab = self.$tabs.filter(function (i, el) { return $(el).parent().is('.active'); });
        if (!$tab) {
            $tab = self.$tabs.first();
            $tab.tab('show');
        }
        else {

        }
    };
    /**
     *  Function switchTabs() is a member function to give focus to a new tab or accordian header. 
     *  If it's a tab panel, the currently displayed panel is hidden and the panel associated with the new tab 
     *  is displayed. 
     * 
     * @param ($curTab obj) $curTab is the jQuery object of the currently selected tab 
     * @param ($newTab obj) $newTab is the jQuery object of new tab to switch to 
     * @return N/A 
     */
    tabpanel.prototype.switchTabs = function ($curTab, $newTab) {
        $newTab.tab('show');

        // remove tab from the tab order and update its aria-selected attribute 
        $curTab.attr('tabindex', '-1').attr('aria-selected', 'false');

        // update the aria attributes 

        // Highlight the new tab and update its aria-selected attribute 
        $newTab.addClass('selected').attr('aria-selected', 'true');

        // Make new tab navigable 
        $newTab.attr('tabindex', '0');

        // give the new tab focus 
        $newTab.focus();
    };
    
    /**
     * Function togglePanel() is a member function to display or hide the panel associated with an accordian header
     * @param ($tab obj) $tab is the jQuery object of the currently selected tab
     * @param (show bool) show will force the toggle
     * @return N/A 
     */
    tabpanel.prototype.togglePanel = function ($tab, show) {
        var controls = $tab.attr('aria-controls');

        var $panel = this.$panels.filter('#' + controls);

        if (show == undefined) {
            show = $panel.attr('aria-hidden') == 'true';
        }

        if (show === true) {
            $panel.attr('aria-hidden', 'false');
        } else {
            $panel.attr('aria-hidden', 'true');
        }
    };

    /**
     * Function bindHandlers() is a member function to bind event handlers for the tabs 
     */
    tabpanel.prototype.bindHandlers = function () {
        var self = this;
        ////////////////////////////// 
        // Bind handlers for the tabs / accordian headers 

        // bind a tab keydown handler 
        self.$tabs.keydown(function (e) {
            return self.handleTabKeyDown($(this), e);
        });

        // bind a tab keypress handler 
        self.$tabs.keypress(function (e) {
            return self.handleTabKeyPress($(this), e);
        });

        // bind a tab click handler 
        self.$tabs.click(function (e) {
            return self.handleTabClick($(this), e);
        });

        ///////////////////////////// 
        // Bind handlers for the panels 

        // bind a keydown handlers for the panel focusable elements 
        self.$panels.keydown(function (e) {
            return self.handlePanelKeyDown($(this), e);
        });

        // bind a keypress handler for the panel 
        self.$panels.keypress(function (e) {
            return self.handlePanelKeyPress($(this), e);
        });
    };

    /**
     * Function handleTabKeyDown() is a member function to process keydown events for a tab 
     * @param ($tab obj) $tab is the jquery object of the tab being processed 
     * @param (e obj) e is the associated event object 
     * @return (boolean) Returns true if propagating; false if consuming event 
     */
    tabpanel.prototype.handleTabKeyDown = function ($tab, e) {
        if (e.altKey) {
            // do nothing 
            return true;
        }

        switch (e.keyCode) {
            case this.keys.enter:
            case this.keys.space: {

                // Only process if this is an accordian widget 
                if (this.accordian == true) {
                    // display or collapse the panel 
                    this.togglePanel($tab);

                    e.stopPropagation();
                    return false;
                }

                return true;
            }
            case this.keys.left:
            case this.keys.up: {

                var self = this;
                var $prevTab; // holds jQuery object of tab from previous pass 
                var $newTab; // the new tab to switch to 

                if (e.ctrlKey) {
                    // Ctrl+arrow moves focus from panel content to the open 
                    // tab/accordian header. 
                }
                else {
                    var curNdx = this.$tabs.index($tab);

                    if (curNdx == 0) {
                        // tab is the first one: 
                        // set newTab to last tab 
                        $newTab = this.$tabs.last();
                    }
                    else {
                        // set newTab to previous 
                        $newTab = this.$tabs.eq(curNdx - 1);
                    }

                    // switch to the new tab 
                    this.switchTabs($tab, $newTab);
                }

                e.stopPropagation();
                return false;
            }
            case this.keys.right:
            case this.keys.down: {

                var self = this;
                var foundTab = false; // set to true when current tab found in array 
                var $newTab; // the new tab to switch to 

                var curNdx = this.$tabs.index($tab);

                if (curNdx == this.$tabs.length - 1) {
                    // tab is the last one: 
                    // set newTab to first tab 
                    $newTab = this.$tabs.first();
                }
                else {
                    // set newTab to next tab 
                    $newTab = this.$tabs.eq(curNdx + 1);
                }

                // switch to the new tab 
                this.switchTabs($tab, $newTab);

                e.stopPropagation();
                return false;
            }
            case this.keys.home: {

                // switch to the first tab 
                this.switchTabs($tab, this.$tabs.first());

                e.stopPropagation();
                return false;
            }
            case this.keys.end: {

                // switch to the last tab 
                this.switchTabs($tab, this.$tabs.last());

                e.stopPropagation();
                return false;
            }
        }
    };

    /**
     * Function handleTabKeyPress() is a member function to process keypress events for a tab. 
     * @param ($tab obj) $tab is the jquery object of the tab being processed 
     * @param (e obj) e is the associated event object 
     * @return (boolean) Returns true if propagating; false if consuming event
     */
    tabpanel.prototype.handleTabKeyPress = function ($tab, e) {

        if (e.altKey) {
            // do nothing 
            return true;
        }

        switch (e.keyCode) {
            case this.keys.enter:
            case this.keys.space:
            case this.keys.left:
            case this.keys.up:
            case this.keys.right:
            case this.keys.down:
            case this.keys.home:
            case this.keys.end: {
                e.stopPropagation();
                return false;
            }
            case this.keys.pageup:
            case this.keys.pagedown: {

                // The tab keypress handler must consume pageup and pagedown 
                // keypresses to prevent Firefox from switching tabs 
                // on ctrl+pageup and ctrl+pagedown 

                if (!e.ctrlKey) {
                    return true;
                }

                e.stopPropagation();
                return false;
            }
        }

        return true;
    };

    /**
     * Function handleTabClick() is a member function to process click events for tabs 
     * @param ($tab object) $tab is the jQuery object of the tab being processed 
     * @param (e object) e is the associated event object
     * @return (boolean) returns true
     */
    tabpanel.prototype.handleTabClick = function ($tab, e) {

        $tab.tab('show');
        
        // remove all tabs from the tab order and reset their aria-selected attribute 
        this.$tabs.attr('tabindex', '-1').attr('aria-selected', 'false');
        
        // Highlight the clicked tab and update its aria-selected attribute 
        $tab.attr('aria-selected', 'true');

        // make clicked tab navigable 
        $tab.attr('tabindex', '0');

        // give the tab focus 
        $tab.focus();

        this.togglePanel($tab, true);

        return false;
    };

    /**
     * Function handlePanelKeyDown() is a member function to process keydown events for a panel 
     * @param ($elem obj) $elem is the jquery object of the element being processed
     * @param (e obj) e is the associated event object 
     * @return (boolean) Returns true if propagating; false if consuming event
     */
    tabpanel.prototype.handlePanelKeyDown = function ($elem, e) {

        if (e.altKey) {
            // do nothing 
            return true;
        }

        switch (e.keyCode) {
            case this.keys.esc: {
                e.stopPropagation();
                return false;
            }
            case this.keys.left:
            case this.keys.up: {

                if (!e.ctrlKey) {
                    // do not process 
                    return true;
                }

                // get the jQuery object of the tab 
                var $tab = $('#' + $elem.attr('aria-labelledby'));

                // Move focus to the tab 
                $tab.focus();

                e.stopPropagation();
                return false;
            }
            case this.keys.pageup: {

                var $newTab;

                if (!e.ctrlKey) {
                    // do not process 
                    return true;
                }

                // get the jQuery object of the tab 
                var $tab = this.$tabs.filter('.selected');

                // get the index of the tab in the tab list 
                var curNdx = this.$tabs.index($tab);

                if (curNdx == 0) {
                    // this is the first tab, set focus on the last one 
                    $newTab = this.$tabs.last();
                }
                else {
                    // set focus on the previous tab 
                    $newTab = this.$tabs.eq(curNdx - 1);
                }

                // switch to the new tab 
                this.switchTabs($tab, $newTab);

                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            case this.keys.pagedown: {

                var $newTab;

                if (!e.ctrlKey) {
                    // do not process 
                    return true;
                }

                // get the jQuery object of the tab 
                var $tab = $('#' + $elem.attr('aria-labelledby'));

                // get the index of the tab in the tab list 
                var curNdx = this.$tabs.index($tab);

                if (curNdx == this.$tabs.length - 1) {
                    // this is the last tab, set focus on the first one 
                    $newTab = this.$tabs.first();
                }
                else {
                    // set focus on the next tab 
                    $newTab = this.$tabs.eq(curNdx + 1);
                }

                // switch to the new tab 
                this.switchTabs($tab, $newTab);

                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        }

        return true;

    };

    /**
     * Function handlePanelKeyPress() is a member function to process keypress events for a panel
     * @param ($elem obj) $elem is the jquery object of the element being processed
     * @param (e obj) e is the associated event object 
     * @return (boolean) Returns true if propagating; false if consuming event 
     */
    tabpanel.prototype.handlePanelKeyPress = function ($elem, e) {

        if (e.altKey) {
            // do nothing 
            return true;
        }

        if (e.ctrlKey && (e.keyCode == this.keys.pageup || e.keyCode == this.keys.pagedown)) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }

        switch (e.keyCode) {
            case this.keys.esc: {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        }

        return true;

    }

    /**
     * Sets up aria attributes
     */
    tabpanel.prototype.setupAria = function() {
        var self = this;
        self.$tabs.attr('tabindex', '-1');
        self.$tabs.each(function () {
            var $tab = $(this);
            var controls = $tab.attr('href');
            if (controls.substr(0, 1) == '#') controls = controls.substr(1);
            if (!$tab.attr('aria-controls')) {
                $tab.attr('aria-controls', controls);
            }

            var $panel = self.$panels.filter('#' + controls);
            if (!$panel.length) {
                $panel = self.$panel.find('#' + controls);
            }

            var tabId = $tab.attr('id');
            if(!tabId) {tabId = generateID('ariatab'); $tab.attr('id', tabId);}

            $panel.attr('aria-labelledby', tabId);
            $panel.attr('role', 'tabpanel');

            if ($tab.closest('.active').length) {
                $tab.attr('tabindex', '0');
            }
        });

        self.$panels = self.$panel.find('[role="tabpanel"]');
    };

    var generateID = (function() {
        var globalIdCounter = 0;
        return function(baseStr) {
            return(baseStr + '_' + globalIdCounter++);
        }
    })();

    /**
     * Function treeview() is a class constructor for a treeview widget. The widget binds to an 
     * unordered list. The top-level <ul> must have role='tree'. All list items must have role='treeitem'.
     * 
     * Tree groups must be embedded lists within the listitem that heads the group. the top <ul> of a group
     * must have role='group'. aria-expanded is used to indicate whether a group is expanded or collapsed. This
     * property must be set on the listitem the encapsulates the group.
     * 
     * parent nodes must be given the class tree-parent.
     * @param (tree obj) tree is the jquery object of the top-level element of the list to bind the widget to
     * @return N/A
     */
    var treeview = function ($tree) {
        var self = this;
        self.$tree = $tree;
        self.itemsClass = '[role="treeitem"]';
        self.$items = self.$tree.find(self.itemsClass);

        self.parentClass = 'icon-collapse-arrow';
        self.$parents = self.$tree.find('.' + self.parentClass);
        self.keys = new keyCodes();



        self.setupAria();

        // initialize the treeview
        this.init();

        // bind event handlers
        this.bindHandlers();

    };

    /**
     * Function init() is a member function to initialize the treeview widget. It traverses the tree, identifying
     * which listitems are headers for groups and applying initial collapsed are expanded styling 
     * @return N/A
     */
    treeview.prototype.init = function () {
        // If the aria-expanded is false, hide the group and display the collapsed state image
        this.$parents.each(function () {
            if (this.getAttribute('aria-expanded') !== 'false') return;
            var $group = $('#' + this.getAttribute('aria-owns'));
            $group
                //.removeClass('in')//bootstrap handles this
                .attr('aria-hidden', 'true');
        });

        this.updateVisibleList();

        this.$parents.first().attr('tabindex', '0');
    };

    /**
     * Function expandGroup() is a member function to expand a collapsed group
     * @param($item object) $item is the jquery id of the parent item of the group to expand
     * @param(hasFocus boolean) focus is true if the parent item has focus, false otherwise
     * @return N/A
     */
    treeview.prototype.expandGroup = function ($item) {
        var $group = $('#' + $item.attr('aria-owns'));
        if (!$group.length) $group = $item.children();
        // expand the group
        //$item.collapse('show');
        $group
            .attr('aria-hidden', 'false')
            .collapse('show');
        //$item.attr('aria-expanded', 'true');//bootstrap handles this
        // refresh the list of visible items
        this.updateVisibleList();
    };

    /**
     * Function collapseGroup() is a member function to collapse  a collapsed group
     * @param($item object) $item is the jquery id of the parent item of the group to collapse 
     * @param(hasFocus boolean) focus is true if the parent item has focus, false otherwise
     * @return N/A
     */
    treeview.prototype.collapseGroup = function ($item) {
        var $group = $('#' + $item.attr('aria-owns'));
        // expand the group
       // $item.collapse('hide');
        $group
            .attr('aria-hidden', 'true')
            .collapse('hide');
        //$item.attr('aria-expanded', 'true');//bootstrap handles this
        // refresh the list of visible items
        this.updateVisibleList();
    };

    /**
     * Function toggleGroup() is a member function to toggle the display state of a group
     * @param($item object) $item is the jquery id of the parent item of the group to toggle 
     * @param(hasFocus boolean) hasFocus is true if the parent item has focus, false otherwise
     * @return N/A
     */
    treeview.prototype.toggleGroup = function ($item) {
        if ($item.attr('aria-expanded') == 'true') {
            // collapse the group
            this.collapseGroup($item);
        } else {
            // expand the group
            this.expandGroup($item);
        }
    };

    /**
     * Function bindHandlers() is a member function to bind event handlers to the listItems
     */
    treeview.prototype.bindHandlers = function () {
        var self = this;

        // bind a click handler
        this.$items.click(function (e) {
            return self.handleClick($(this), e);
        });

        // bind a keydown handler
        this.$items.keydown(function (e) {
            return self.handleKeyDown($(this), e);
        });

        // bind a keypress handler
        this.$items.keypress(function (e) {
            return self.handleKeyPress($(this), e);
        });

        // bind a focus handler
        this.$items.focus(function (e) {
            return self.handleFocus($(this), e);
        });
    };

    /**
     * Function handleKeyDown() is a member function to process keydown events for the treeview items 
     * @param ($item object) $item is the jQuery id of the parent item firing event
     * @param (e object) e is the associated event object
     * @return (boolean) returns false if consuming event; true if not
     */
    treeview.prototype.handleKeyDown = function ($item, e) {
        var self = this;
        var $itemGroup = $item.parents('[role="group"]').first();
        var curNdx = this.$visibleItems.index($item);

        if ((e.altKey || e.ctrlKey)
             || (e.shiftKey && e.keyCode != this.keys.tab)) {
            // do nothing
            return true;
        }

        switch (e.keyCode) {
            case this.keys.tab: 
                return true;
            case this.keys.home: {
                this.$parents.first().focus();
                e.stopPropagation();
                return false;
            }
            case this.keys.end: {
                this.$visibleItems.last().focus();
                e.stopPropagation();
                return false;
            }
            case this.keys.enter:
            case this.keys.space: {
                if ($item.hasClass(self.parentClass) == false) {
                    return true; // do nothing
                } else {
                    // toggle the display of the child group
                    this.toggleGroup($item);
                }
                e.stopPropagation();
                return false;
            }
            case this.keys.left: {
                if ($item.hasClass(self.parentClass) == true
                      && $item.attr('aria-expanded') == 'true') {
                    this.collapseGroup($item);
                } else {
                    // move up to the parent
                    var groupID = $itemGroup.attr('id');
                    // set focus on the parent tree item
                    this.$parents.filter('[aria-owns=' + groupID + ']').focus();
                }
                e.stopPropagation();
                return false;
            }
            case this.keys.right: {

                if ($item.hasClass(self.parentClass) == false) {
                    // do nothing
                } else if ($item.attr('aria-expanded') == 'false') {
                    this.expandGroup($item);
                } else {
                    // move focus to first child item
                    var $owns = $('#' + $item.attr('aria-owns'));
                    if (!$owns.length) $owns = $item;
                    $owns
                        .find(self.itemsClass)
                        .not('group')
                        .first()
                        .focus();
                }

                e.stopPropagation();
                return false;
            }
            case this.keys.up: {
                if (curNdx > 0) {
                    // set focus on previous item
                    this.$visibleItems.eq(curNdx - 1).focus();
                }
                e.stopPropagation();
                return false;
            }
            case this.keys.down: {
                if (curNdx < this.$visibleItems.length - 1) {
                    // set focus on next item
                    this.$visibleItems.eq(curNdx + 1).focus();
                }
                e.stopPropagation();
                return false;
            }
            case this.keys.asterisk: {
                // expand all groups
                this.$parents.each(function () {
                    self.expandGroup($(this));
                });
                e.stopPropagation();
                return false;
            }
        }
        return true;
    };

    /**
     * Function handleKeyPress() is a member function to process keypress events for the treeview items
     * This function is needed for browsers, such as Opera, that perform window manipulation on kepress events
     * rather than keydown. The function simply consumes the event.
     * @param ($item object) $item is the jQuery id of the parent item firing event
     * @param (e object) e is the associated event object
     * @return (boolean) returns false if consuming event; true if not
     */
    treeview.prototype.handleKeyPress = function ($item, e) {
        var self = this;
        if (e.altKey || e.ctrlKey || e.shiftKey) {
            // do nothing
            return true;
        }

        switch (e.keyCode) {
            case this.keys.tab: {
                return true;
            }
            case this.keys.enter:
            case this.keys.space:
                return true;
            case this.keys.home:
            case this.keys.end:
            case this.keys.left:
            case this.keys.right:
            case this.keys.up:
            case this.keys.down: {
                e.stopPropagation();
                return false;
            }
            default: {
                var chr = String.fromCharCode(e.which);
                var bMatch = false;
                var itemNdx = this.$visibleItems.index($item);
                var itemCnt = this.$visibleItems.length;
                var curNdx = itemNdx + 1;

                // check if the active item was the last one on the list
                if (curNdx == itemCnt) {
                    curNdx = 0;
                }

                // Iterate through the menu items (starting from the current item and wrapping) until a match is found
                // or the loop returns to the current menu item 
                while (curNdx != itemNdx) {

                    var $curItem = this.$visibleItems.eq(curNdx);
                    var titleChr = $curItem.text().trim().charAt(0);

                    if ($curItem.hasClass(self.parentClass)) {
                        titleChr = $curItem.find('strong,a').text().trim().charAt(0);
                    }

                    if (titleChr.toLowerCase() == chr) {
                        bMatch = true;
                        break;
                    }

                    curNdx = curNdx + 1;

                    if (curNdx == itemCnt) {
                        // reached the end of the list, start again at the beginning
                        curNdx = 0;
                    }
                }

                if (bMatch == true) {
                    this.$activeItem = this.$visibleItems.eq(curNdx);
                    this.$activeItem.focus();
                }

                e.stopPropagation();
                return false;
            }
        }

        return true;

    };

    /**
     * Function handleDblClick() is a member function to process double-click events for parent items.
     * Click expands or collapses a group.
     * @param ($id object) $id is the jQuery id of the parent item firing event
     * @param (e object) e is the associated event object
     * @return (boolean) returns false if consuming event; true if not
     */
    treeview.prototype.handleClick = function ($id, e) {
        if (e.altKey || e.ctrlKey || e.shiftKey) {
            // do nothing
            return true;
        }

        if (!$id.hasClass(this.parentClass)) {
            return true;
        }

        // expand or collapse the group
        this.toggleGroup($id);

        // apply the focus
        this.updateStyling($id);

        e.stopPropagation();
        return false;

    };
    
    /**
     * Function handleFocus() is a member function to process focus events.
     * @param ($item object) $item is the jQuery id of the parent item firing event
     * @param (e object) e is the associated event object
     * @return (boolean) returns true
     */
    treeview.prototype.handleFocus = function ($item, e) {
        //if (this.$activeItem == null) {
        //    this.$activeItem = $item;
        //}
        this.updateStyling($item);
        return true;
    };
    
    /**
     * Function updateStyling() is a member function to update the styling for the tree items
     */
    treeview.prototype.updateStyling = function ($item) {
        var self = this;
        // remove the treeview items the tab order.
        self.$items.attr('tabindex', '-1');

        // apply the focus highlighting and place the element in the tab order
        $item.attr('tabindex', '0');
    };

    /**
     * Function updateVisible() is a member function to update the list of visible items.
     */
    treeview.prototype.updateVisibleList = function () {
        var self = this;
        self.$visibleItems = self.$items.filter(function (i, el) {
            return $(el).parentsUntil(self.$tree[0], '[aria-hidden="true"]').length == 0;
        });
    };

    /**
     * Sets up aria attributes
     */
    treeview.prototype.setupAria = function () {
        var self = this;
        self.$items.attr('tabindex', '-1');
        self.$parents.each(function (i,el) {
            var $item = $(el);
            var controls = $item.attr('href');
            if (!controls) return;
            var child = $(controls);
            if (controls.substr(0, 1) == '#') controls = controls.substr(1);
            if (!$item.has(child).length) {
                // need to add aria-owns
                $item.attr('aria-owns', controls);
            }
        });
    };

    var makeTabPanel = function (panel) {
        new tabpanel(panel);
        return this;
    };
    var makeTreeView = function (tree) {
        new treeview(tree);
        return this;
    };
    var makeDropdown = function (dropdown) {
        var toggle = '[data-toggle=dropdown], .dropdown-menu'
         , $par
         , firstItem
         , focusDelay = 200
         , menus = $(toggle).parent().find('ul').attr('role', 'menu')
         , lis = menus.find('li').attr('role', 'presentation')
         , keys = new keyCodes();


        // add menuitem role and tabIndex to dropdown links
        //lis.find('a').attr({ 'role': 'menuitem', 'tabIndex': '-1' })
        // add aria attributes to dropdown toggle
        $(toggle).attr({ 'aria-haspopup': 'true', 'aria-expanded': 'false' })
        $(toggle).parent()
          // Update aria-expanded when open
          .on('shown.bs.dropdown', function (e) {
              $par = $(this)
              var $toggle = $par.find(toggle)
              $toggle.attr('aria-expanded', 'true')
              $toggle.on('keydown.bs.dropdown', $.proxy(function (ev) {
                  setTimeout(function () {
                      firstItem = $('.dropdown-menu [role=menuitem]:visible', $par)[0]
                      try { firstItem.focus() } catch (ex) { }
                  }, focusDelay)
              }, this))

          })
          // Update aria-expanded when closed
          .on('hidden.bs.dropdown', function (e) {
              $par = $(this)
              var $toggle = $par.find(toggle)
              $toggle.attr('aria-expanded', 'false').removeClass('open');
          })


        function getParent($this) {
            var selector = $this.attr('data-target')

            if (!selector) {
                selector = $this.attr('href')
                selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
            }

            var $parent = selector && $(selector)

            return $parent && $parent.length ? $parent : $this.parent()
        }

        var newKeyDown = function (e) {
            if ([keys.up, keys.down, keys.esc, keys.space].indexOf(e.which) > -1
                || /input|textarea/i.test(e.target.tagName)
                || [keys.left, keys.right].indexOf(e.which) < 0) {
                return;
            }
            
            var submenuClass = 'dropdown-submenu';
            var openClass = 'open';

            switch (e.which) {
                case keys.right:
                    var $parent = $(e.target).parent();
                    var $items = $parent.find('.dropdown-menu')

                    if (!$items.length) return

                    if (!$parent.hasClass(submenuClass)) return;

                    $parent.addClass(openClass).siblings('.' + submenuClass + '.' + openClass).removeClass(openClass)

                    $items.first().find( ' li:not(.disabled):visible a').first().focus();
                    break;
                case keys.left:

                    var $parent = $(this).parent();
                    if ($parent.is('.dropdown')) return;
                    $parent
                        .removeClass(openClass)
                        .children('a').first().focus();
                    break;
            }
            e.preventDefault()
            e.stopPropagation()
            return false;
        };

        var onClose = function(e) {
            var $this = $(this).find('.open').removeClass('open');
        };

        // Close the dropdown if tabbed away from
        $(document)
          .on('focusout.dropdown.data-api', toggle, function (e) {
              var $this = $(this)
                , that = this;
              // since we're trying to close when appropriate,
              // make sure the dropdown is open
              if (!$this.parent().hasClass('open')) {
                  return;
              }

              // tabbed into the dropdown.
              if ($(e.relatedTarget).parents().filter($this.parent()).length) {
                  return;
              }

              setTimeout(function () {
                  if (!$.contains(that, document.activeElement) && $this.parent().hasClass('open')) {
                      $this.parent().find('[data-toggle=dropdown]').dropdown('toggle')
                  }
              }, 150)
          })

            .on('keydown.bs.dropdown.data-api', toggle, newKeyDown);

        return this;
    };

    makeDropdown();

    var makeMenubar = function (navbar) {
        var navBar = navbar;
        if (typeof navbar == "string") {
            navBar = $(navbar);
        }

        if (navBar.jquery) {
            navBar.each(function (i, e) {
                var menubar = new Menubar(e);
                menubar.init();
                $(e).data('menu-bar', menubar);
            });
            return;
        }

        var menubar = new Menubar(navbar);
        menubar.init();
    };

    var utilities = {};
    utilities.isFocusable = function (element) {
        var map, mapName, img, focusableIfVisible, fieldset,
            hasTabindex = element.getAttribute('tabindex'),
                nodeName = element.nodeName.toLowerCase();

        if (/^(input|select|textarea|button|object)$/.test(nodeName)) {
            focusableIfVisible = !element.disabled;

            function closest(element, tag) {
                if (element.nodeName.toLowerCase() == tag.toLowerCase()) {
                    return element;
                }
                if (!element.parentElement) return null;
                return closest(element.parentElement, tag);
            }
            if (focusableIfVisible) {
                fieldset = closest(element, "fieldset");
                if (fieldset) {
                    focusableIfVisible = !fieldset.disabled;
                }
            }
        } else if ("label" === nodeName) {
            var forAttr = element.getAttribute('for'), forEl;
            if (forAttr && (forEl = document.getElementById(forAttr))) {
                return utilities.isFocusable(forEl);
            }

            for (var i = 0; i < element.childElementCount && !focusableIfVisible; i++) {
                focusableIfVisible = utilities.isFocusable(element.children[i]);
            }
        } else if ("a" === nodeName) {
            focusableIfVisible = element.href || hasTabindex;
        } else {
            focusableIfVisible = hasTabindex;
        }

        if (focusableIfVisible) {
            return utilities.isVisible(element);
        }

        return focusableIfVisible;
    };
    utilities.isVisible = function (element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };

    return {
        tabpanel: makeTabPanel,
        treeview: makeTreeView,
        dropdown: makeDropdown,
        menubar: makeMenubar,
        u: utilities
    }
};
window.a11y = new accessibility();