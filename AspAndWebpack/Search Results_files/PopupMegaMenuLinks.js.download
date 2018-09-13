/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   PopupMegaMenu.js
*
*   Desc:   Popup menu widget that implements ARIA Authoring Practices
*
*   Author: Jon Gunderson and Ku Ja Eun
*/

/*
*   @constructor PopupMegaMenu
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
var PopupMegaMenu = function (domNode, controllerObj, popupMenuItemObj) {
  var elementChildren,
      msgPrefix = 'PopupMegaMenu constructor argument domNode ';

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

  this.menuitems = []; // See PopupMegaMenu init method
  this.firstChars = []; // See PopupMegaMenu init method

  this.firstItem = null; // See PopupMegaMenu init method
  this.lastItem = null; // See PopupMegaMenu init method

  this.hasFocus = false; // See MenuItem handleFocus, handleBlur
  this.hasHover = false; // See PopupMegaMenu handleMouseover, handleMouseout

  this.isClosing = null;
  this.isOpen = false;
  this.isOpening = false;

  this.keyCode = Object.freeze({
      'TAB': 9,
      'RETURN': 13,
      'ESC': 27,
      'SPACE': 32,
      'PAGEUP': 33,
      'PAGEDOWN': 34,
      'END': 35,
      'HOME': 36,
      'LEFT': 37,
      'UP': 38,
      'RIGHT': 39,
      'DOWN': 40
  });
};

/*
*   @method PopupMegaMenu.prototype.init
*
*   @desc
*       Add domNode event listeners for mouseover and mouseout. Traverse
*       domNode children to configure each menuitem and populate menuitems
*       array. Initialize firstItem and lastItem properties.
*/
PopupMegaMenu.prototype.init = function () {
  var childElement, menuElement, menuItem, textContent, numItems, label;

  // Configure the domNode itself
  this.domNode.tabIndex = -1;

  this.domNode.setAttribute('role', 'menu');

  if (!this.domNode.getAttribute('aria-labelledby') && !this.domNode.getAttribute('aria-label') && !this.domNode.getAttribute('title')) {
    label = this.controller.domNode.innerHTML;
    this.domNode.setAttribute('aria-label', label);
  }

  this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
  this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('keypress', this.handleKeypress.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));

  // Traverse the element children of domNode: configure each with
  // menuitem role behavior and store reference in menuitems array.
  childElement = this.domNode.firstElementChild;

  while (childElement) {
      // Child element is a MMcol
    var focusableItems = this.getFocusable(childElement);
    for (var i = 0; i < focusableItems.length; i++) {
      menuItem = new MegaMenuItem(menuElement, this);
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

// Cheating here by using jquery
PopupMegaMenu.prototype.getFocusable = function (parent) {
    return $(parent).find(':focusable');
};


/* EVENT HANDLERS */

PopupMegaMenu.prototype.handleMouseover = function (event) {
    this.hasHover = true;
    if(this.isClosing) clearTimeout(this.isClosing);
};

PopupMegaMenu.prototype.handleMouseout = function (event) {
    var self = this;
    self.hasHover = false;
    self.isClosing = setTimeout(self.close.bind(self, false,5), 300);
};



PopupMegaMenu.prototype.handleKeydown = function (event) {
  var tgt = event.currentTarget,
      flag = false,
 clickEvent;

  //  Console.log("[PopupMegaMenu][handleKeydown]: " + event.keyCode + " " + this.menu)

  switch (event.keyCode) {
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
      if (this.popupMenu) {
        this.popupMenu.open();
        this.popupMenu.setFocusToFirstItem();
      }
      else {
          if (event.target.nodeName === 'A' || event.target.nodeName === "INPUT") {
          break;
        }
        // Create simulated mouse event to mimic the behavior of ATs
        // and let the event handler handleClick do the housekeeping.
        try {
          clickEvent = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
          });
        }
        catch (err) {
          if (document.createEvent) {
            // DOM Level 3 for IE 9+
            clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent('click', true, true);
          }
        }
        tgt.dispatchEvent(clickEvent);
      }

      flag = true;
      break;

    case this.keyCode.ESC:
      this.setFocusToController();
      this.close(true);
      flag = true;
      break;

    case this.keyCode.UP:
      this.setFocusToPreviousItem(event.target);
      flag = true;
      break;

    case this.keyCode.DOWN:
      this.setFocusToNextItem(event.target);
      flag = true;
      break;

    case this.keyCode.LEFT:
      this.setFocusToController('previous', true);
      this.close(true);
      flag = true;
      break;

    case this.keyCode.RIGHT:
      if (this.popupMenu) {
        this.popupMenu.open();
        this.popupMenu.setFocusToFirstItem();
      }
      else {
        this.setFocusToController('next', true);
        this.close(true);
      }
      flag = true;
      break;

    case this.keyCode.HOME:
    case this.keyCode.PAGEUP:
      this.setFocusToFirstItem();
      flag = true;
      break;

    case this.keyCode.END:
    case this.keyCode.PAGEDOWN:
      this.setFocusToLastItem();
      flag = true;
      break;

    case this.keyCode.TAB:
      //this.setFocusToController();
      //this.close(true);
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

PopupMegaMenu.prototype.handleKeypress = function (event) {
  var char = String.fromCharCode(event.charCode);

  function isPrintableCharacter (str) {
    return str.length === 1 && str.match(/\S/);
  }

  if (isPrintableCharacter(char)) {
    this.setFocusByFirstCharacter(this, char);
  }
};

PopupMegaMenu.prototype.handleClick = function (event) {
 // this.setFocusToController();
  //this.close(true);
};

PopupMegaMenu.prototype.handleFocus = function (event) {
  this.hasFocus = true;
  if (!this.controller.isMenubarItem) {
    this.controller.hasFocus = true;
  }
};

PopupMegaMenu.prototype.handleBlur = function (event) {
    var self = this;
    self.hasFocus = false;
    if (!self.controller.isMenubarItem) {
        self.controller.hasFocus = false;
  }
    setTimeout(self.close.bind(self, false,6), 300);
};

/* FOCUS MANAGEMENT METHODS */

PopupMegaMenu.prototype.setFocusToController = function (command, flag) {
  if (typeof command !== 'string') {
    command = '';
  }

  if (this.controller.close) {
    this.controller.domNode.focus();
    this.close();

    if (command === 'next') {
      this.controller.hasFocus = false;
      this.controller.close();
      this.controller.controller.menubar.setFocusToNextItem(this.controller.controller, flag);
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

PopupMegaMenu.prototype.setFocusToFirstItem = function () {
    $(this.domNode).find(':focusable:first').focus();
};

PopupMegaMenu.prototype.setFocusToLastItem = function () {
    $(this.domNode).find(':focusable:last').focus();
};

PopupMegaMenu.prototype.setFocusToPreviousItem = function (currentItem) {
  var index, focusableItems;
  focusableItems = this.getFocusable(this.domNode);

  if (currentItem === focusableItems[0]) {
      focusableItems.last().focus();
  } else {
      index = focusableItems.index(currentItem);
      focusableItems.eq(index - 1).focus();
  }
};

PopupMegaMenu.prototype.setFocusToNextItem = function (currentItem) {
    var index, focusableItems;
    focusableItems = this.getFocusable(this.domNode);

    if (currentItem === focusableItems.last()[0]) {
    focusableItems.first().focus();
  }
  else {
      index = focusableItems.index(currentItem);
      focusableItems.eq(index + 1).focus();
  }
};

PopupMegaMenu.prototype.setFocusByFirstCharacter = function (currentItem, char) {
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

PopupMegaMenu.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (char === this.firstChars[ i ]) {
      return i;
    }
  }
  return -1;
};

/* MENU DISPLAY METHODS */

PopupMegaMenu.prototype.open = function () {

    var isShown = this.controller.menubar.domNode.querySelectorAll('.is-shown');
    for (var i = 0; i < isShown.length; i++) {
        removeClass(isShown[i], 'is-shown');
    }
    addClass(this.domNode, 'is-shown');

    this.controller.domNode.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
};

PopupMegaMenu.prototype.close = function (force) {
  var controllerHasHover = this.controller.hasHover;

  if (!this.controller.isMenubarItem) {
    controllerHasHover = false;
  }

  if (force || (!this.hasFocus && !this.hasHover && !controllerHasHover)) {
      removeClass(this.domNode, 'is-shown');

    this.controller.domNode.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
  }
};
