/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   PopupMenu.js
*
*   Desc:   Popup menu widget that implements ARIA Authoring Practices
*
*   Author: Jon Gunderson and Ku Ja Eun
*/

/*
*   @constructor PopupMenu
*
*   @desc
*       Wrapper object for a simple popup menu (without nested submenus)
*
*   @param domNode
*       The DOM element node that serves as the popup menu container. Each
*       child element of domNode that represents a menuitem must have a
*       'role' attribute with value 'menuitem'.
*
*   @param controllerObj
*       The object that is a wrapper for the DOM element that controls the
*       menu, e.g. a button element, with an 'aria-controls' attribute that
*       references this menu's domNode. See MenuButton.js
*
*       The controller object is expected to have the following properties:
*       1. domNode: The controller object's DOM element node, needed for
*          retrieving positioning information.
*       2. hasHover: boolean that indicates whether the controller object's
*          domNode has responded to a mouseover event with no subsequent
*          mouseout event having occurred.
*/
var PopupMenu = function (domNode, controllerObj, popupMenuItemObj) {
  var elementChildren,
      msgPrefix = 'PopupMenu constructor argument domNode ';

  if (typeof popupMenuItemObj !== 'object') {
    popupMenuItemObj = false;
  }

  // Check whether domNode is a DOM element
  if (!domNode instanceof Element) {
    throw new TypeError(msgPrefix + 'is not a DOM Element.');
  }
  // Check whether domNode has child elements
  if (domNode.childElementCount === 0) {
    throw new Error(msgPrefix + 'has no element children.');
  }
  // Check whether domNode descendant elements have A elements
  var childElement = domNode.firstElementChild;
  while (childElement) {
    var menuitem = childElement.firstElementChild;
    if (menuitem && menuitem === 'A') {
      throw new Error(msgPrefix + 'has descendant elements that are not A elements.');
    }
    childElement = childElement.nextElementSibling;
  }

  this.isMenubar = false;

  this.domNode = domNode;
  this.controller = controllerObj;
  this.popupMenuItem = popupMenuItemObj;

  this.menuitems = []; // See PopupMenu init method
  this.firstChars = []; // See PopupMenu init method

  this.firstItem = null; // See PopupMenu init method
  this.lastItem = null; // See PopupMenu init method

  this.hasFocus = false; // See MenuItem handleFocus, handleBlur
  this.hasHover = false; // See PopupMenu handleMouseover, handleMouseout

  this.isClosing = null;
  this.isOpen = false;
};

/*
*   @method PopupMenu.prototype.init
*
*   @desc
*       Add domNode event listeners for mouseover and mouseout. Traverse
*       domNode children to configure each menuitem and populate menuitems
*       array. Initialize firstItem and lastItem properties.
*/
PopupMenu.prototype.init = function () {
  var childElement, menuElement, menuItem, textContent, numItems, label;

  // Configure the domNode itself
  this.domNode.tabIndex = -1;

  this.domNode.setAttribute('role', 'menu');

  if (!this.domNode.getAttribute('aria-labelledby') && !this.domNode.getAttribute('aria-label') && !this.domNode.getAttribute('title')) {
      label = this.domNode.parentElement.children[0].innerHTML;
    this.domNode.setAttribute('aria-label', label);
  }

  this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
  this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));

  // Traverse the element children of domNode: configure each with
  // menuitem role behavior and store reference in menuitems array.
  childElement = this.domNode.firstElementChild;
  this.menuitems = [];
  while (childElement) {
    menuElement = childElement.firstElementChild;

    if (menuElement && (menuElement.tagName === 'A' || menuElement.tagName === 'LABEL')) {
      menuItem = new MenuItem(menuElement, this);
      menuItem.init();
      this.menuitems.push(menuItem);
      textContent = menuElement.textContent.trim();
      this.firstChars.push(textContent.substring(0, 1).toLowerCase());
    }
    childElement = childElement.nextElementSibling;
  }

  // Use populated menuitems array to initialize firstItem and lastItem.
  numItems = this.menuitems.length;
  if (numItems > 0) {
    this.firstItem = this.menuitems[ 0 ];
    this.lastItem = this.menuitems[ numItems - 1 ];
  }
};

/* EVENT HANDLERS */

PopupMenu.prototype.handleMouseover = function (event) {
    this.hasHover = true;
    if(this.isClosing) clearTimeout(this.isClosing);
};

PopupMenu.prototype.handleMouseout = function (event) {
  this.hasHover = false;
  this.isClosing = setTimeout(this.close.bind(this, false,10), 300);
};

/* FOCUS MANAGEMENT METHODS */

PopupMenu.prototype.setFocusToController = function (command, flag) {
  if (typeof command !== 'string') {
    command = '';
  }

  if (this.controller.close) {
      if (this.popupMenuItem) {
        this.popupMenuItem.domNode.focus();
      }
    this.close();

    if (command === 'next') {
      this.controller.hasFocus = false;
      this.controller.close();
      var that = this;
      var closestMenubar = this.closestMenubar(function (c) {
          if(c.close)c.close(true);
      });
      closestMenubar.menubar.setFocusToNextItem(closestMenubar, flag);
    }
    else if (command === 'previous') {
      this.controller.hasFocus = false;
      this.controller.close();
      var that = this;
      var closestMenubar = this.closestMenubar(function (c) {
          if(c.close)c.close(true);
      });
      closestMenubar.menubar.setFocusToPreviousItem(closestMenubar, flag);
    }
  }
  else {
    if (command === 'previous') {
      this.controller.menubar.setFocusToPreviousItem(this.controller, flag);
    }
    else if (command === 'next') {
      this.controller.menubar.setFocusToNextItem(this.controller, flag);
    }
    else {
      this.controller.domNode.focus();
    }
  }
};

PopupMenu.prototype.setFocusToFirstItem = function () {
  this.firstItem.domNode.focus();
};

PopupMenu.prototype.setFocusToLastItem = function () {
  this.lastItem.domNode.focus();
};

PopupMenu.prototype.setFocusToPreviousItem = function (currentItem) {
  var index;

  if (currentItem === this.firstItem || currentItem.domNode === this.firstItem.domNode) {
    this.lastItem.domNode.focus();
  }
  else {
    index = this.menuitems.indexOf(currentItem);
    if(index < 0){
      index = this.menuitems.findIndex(function(item){ return item.domNode === currentItem.domNode; }) || this.menuitems.length;
    }
    this.menuitems[ index - 1 ].domNode.focus();
  }
};

PopupMenu.prototype.setFocusToNextItem = function (currentItem) {
  var index;

  if (currentItem === this.lastItem) {
    this.firstItem.domNode.focus();
  }
  else {
    index = this.menuitems.indexOf(currentItem);
    this.menuitems[ index + 1 ].domNode.focus();
  }
};

PopupMenu.prototype.setFocusByFirstCharacter = function (currentItem, char) {
  var start, index, char = char.toLowerCase();

  // Get start index for search based on position of currentItem
  start = this.menuitems.indexOf(currentItem) + 1;
  if (start === this.menuitems.length) {
    start = 0;
  }

  // Check remaining slots in the menu
  index = this.getIndexFirstChars(start, char);

  // If not found in remaining slots, check from beginning
  if (index === -1) {
    index = this.getIndexFirstChars(0, char);
  }

  // If match was found...
  if (index > -1) {
    this.menuitems[ index ].domNode.focus();
  }
};

PopupMenu.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (char === this.firstChars[ i ]) {
      return i;
    }
  }
  return -1;
};

/* MENU DISPLAY METHODS */

PopupMenu.prototype.open = function () {
  if(this.isOpen) return;
  this.init();
  // Get position and bounding rectangle of controller object's DOM node
    var rect = this.controller.domNode.getBoundingClientRect();
    addClass(this.domNode.parentNode, 'open');
    var screenWidth = window.document.documentElement.clientWidth;
    this.domNode.style.display = 'block';
    var menuRect = this.domNode.getBoundingClientRect();

  // Set CSS properties
    this.domNode.style.top = 0;
  if (!this.controller.isMenubarItem) {
    this.domNode.parentNode.style.position = 'relative';
    this.domNode.style.position = 'absolute';
    if (rect.right + menuRect.width > screenWidth) {
        this.domNode.style.right = (rect.width - 20) + 'px'
        this.domNode.style.left = 'initial';
        if (rect.left - menuRect.width < 0) {
            this.domNode.style.left = 'initial';
            this.domNode.style.right = 'initial';
            this.domNode.style.top = (this.domNode.parentNode.getBoundingClientRect().height - 3) + 'px';
        }
    } else {
        this.domNode.style.right = 'initial';
        this.domNode.style.left = (rect.width - 20) + 'px';
    }

    this.domNode.style.zIndex = 100;
  }
  else {

      // Close other open poput menus.
      var isShown = this.controller.menubar.domNode.querySelectorAll('.open');
      for (var i = 0; i < isShown.length; i++) {
          if (isShown[i] == this.domNode.parentNode) continue;
          removeClass(isShown[i], 'open');

          var dropdownMenu = isShown[i].querySelector('.dropdown-menu');
          if(dropdownMenu) dropdownMenu.style.display = 'none';
      }

      this.domNode.style.position = 'absolute';
      if (this.controller.menubar.isDropDown()) {
          if (menuRect.width > rect.width) {
            this.domNode.style.top = (-rect.height) + 'px';
          } else {
              //this.domNode.style.top = '0px';
              this.domNode.style.top = rect.height + 'px';
          }
      } else {
          this.domNode.style.top = (rect.height - 1) + 'px';
      }
    this.domNode.style.zIndex = 100;
    if (this.closestMenubar().menubar.alignDropdowns != "left" || rect.left + menuRect.width > screenWidth) {
        this.domNode.style.right = 0;
        this.domNode.style.left = (rect.width - menuRect.width) + 'px';
    } else {
        this.domNode.style.right = 'initial';
        this.domNode.style.left = 0;
    }
  }

  this.controller.domNode.setAttribute('aria-expanded', 'true');
  this.isOpen = true;
};

PopupMenu.prototype.close = function (force) {

  var controllerHasHover = this.controller.hasHover;

  if (!this.controller.isMenubarItem) {
    controllerHasHover = false;
  }

  if (force || (!this.hasFocus && !this.hasHover && !controllerHasHover)) {
      removeClass(this.domNode.parentNode, 'open');
    this.domNode.style.display = 'none';
    this.domNode.style.zIndex = 0;
    this.controller.domNode.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
    for (var i = 0; i < this.menuitems.length; i++) {
        this.menuitems[i].close();
    }
  }
};

PopupMenu.prototype.closestMenubar = function (onEach) {
    if(onEach) onEach(this.controller);
    if (this.controller.menubar) return this.controller;
    return this.controller.closestMenubar(onEach);
};
