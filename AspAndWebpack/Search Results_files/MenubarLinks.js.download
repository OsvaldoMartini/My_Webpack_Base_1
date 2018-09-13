/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   Menubar.js
*
*   Desc:   Menubar widget that implements ARIA Authoring Practices
*
*   Author: Jon Gunderson, Ku Ja Eun and Nicholas Hoyt
*/

/*
*   @constructor Menubar
*
*   @desc
*       Wrapper object for a menubar (with nested submenus of links)
*
*   @param domNode
*       The DOM element node that serves as the menubar container. Each
*       child element of menubarNode that represents a menubaritem must
*       be an A element
*/

var Menubar = function (domNode) {
  var elementChildren,
      msgPrefix = 'Menubar constructor argument menubarNode ';

  // Check whether menubarNode is a DOM element
  if (!domNode instanceof Element) {
    throw new TypeError(msgPrefix + 'is not a DOM Element.');
  }

  // Check whether menubarNode has descendant elements
  if (domNode.childElementCount === 0) {
    throw new Error(msgPrefix + 'has no element children.');
  }

  // Check whether menubarNode has A elements
  e = domNode.firstElementChild;

  while (e) {
    var menubarItem = e.firstElementChild;
    //if (e && menubarItem && !isFocusable(menubarItem)) {
    //  throw new Error(msgPrefix + 'has child elements that are not focusable.');
    //}
    e = e.nextElementSibling;
  }

  this.domNode = domNode;

  this.menubarItems = []; // See Menubar init method
  this.firstChars = []; // See Menubar init method

  this.firstItem = null; // See Menubar init method
  this.lastItem = null; // See Menubar init method

  this.hasFocus = false; // See MenubarItem handleFocus, handleBlur
  this.hasHover = false; // See Menubar handleMouseover, handleMouseout

  this.menuButton = false;
  this.isDropdown = false; // See Menubar open method.

  this.alignDropdowns = 'left';

  this.clickOpen = false;
  this.hoverOpen = true;
};

/*
*   @method Menubar.prototype.init
*
*   @desc
*       Adds ARIA role to the menubar node
*       Traverse menubar children for A elements to configure each A element as a ARIA menuitem
*       and populate menuitems array. Initialize firstItem and lastItem properties.
*/
Menubar.prototype.init = function () {
  var menubarItem, childElement, menuElement, textContent, numItems;
  var newMenubarItems = [];
  this.domNode.setAttribute('role', 'menubar');

  this.clickOpen = this.domNode.getAttribute('data-menu-open-on') == 'click';
  this.hoverOpen = this.domNode.hasAttribute('data-menu-open-on') 
                    ? this.domNode.getAttribute('data-menu-open-on') == 'hover'
                    : true;

  // Traverse the element children of menubarNode: configure each with
  // menuitem role behavior and store reference in menuitems array.
  elem = this.domNode.firstElementChild;

  while (elem) {
    var menuElement = elem.firstElementChild;

    if (elem && menuElement && a11y.u.isFocusable(menuElement, false)) {
        var found = false;
        for (var i = 0; i < this.menubarItems.length; i++) {
            if (this.menubarItems[i].domNode == menuElement) {
                newMenubarItems.push(this.menubarItems[i]);
                found = true;
                break;
            }
        }
        if (!found) {
          menubarItem = new MenubarItem(menuElement, this);
          menubarItem.init();
          newMenubarItems.push(menubarItem);
          textContent = menuElement.textContent.trim();
          this.firstChars.push(textContent.substring(0, 1).toLowerCase());
        }
    }

    elem = elem.nextElementSibling;
  }
  this.menubarItems = newMenubarItems;

  // Use populated menuitems array to initialize firstItem and lastItem.
  numItems = this.menubarItems.length;
  if (numItems > 0) {
    this.firstItem = this.menubarItems[ 0 ];
    this.lastItem = this.menubarItems[ numItems - 1 ];
    this.firstItem.domNode.tabIndex = 0;
  }

  if (!this.menuButton && this.domNode.parentElement.childElementCount == 2 && this.domNode.previousElementSibling && this.domNode.previousElementSibling.nodeName == 'BUTTON') {
      var openButton = this.domNode.previousElementSibling;

      this.menuButton = new MenubarButton(openButton, this);
      this.menuButton.init();
  }
  var navAlign;
  if ((navAlign = this.domNode.getAttribute('data-navbar-align'))) {
      this.alignDropdowns = navAlign;
  }
};

/* FOCUS MANAGEMENT METHODS */

Menubar.prototype.setFocusToItem = function (newItem) {

  var flag = false;

  for (var i = 0; i < this.menubarItems.length; i++) {
    var mbi = this.menubarItems[i];

    if (mbi.domNode.tabIndex == 0) {
      flag = mbi.domNode.getAttribute('aria-expanded') === 'true';
    }

    mbi.domNode.tabIndex = -1;
    if (mbi.popupMenu) {
      mbi.popupMenu.close();
    }
  }

  newItem.domNode.focus();
  newItem.domNode.tabIndex = 0;

  if (flag && newItem.popupMenu) {
    newItem.popupMenu.open();
  }
};

Menubar.prototype.setFocusToFirstItem = function (flag) {
  this.setFocusToItem(this.firstItem);
};

Menubar.prototype.setFocusToLastItem = function (flag) {
  this.setFocusToItem(this.lastItem);
};

Menubar.prototype.setFocusToPreviousItem = function (currentItem, orExit) {
  var index;

  if (currentItem === this.firstItem || currentItem.domNode === this.firstItem.domNode) {
    if (orExit) {
      return false;
    }
    newItem = this.lastItem;
  }
  else {
    index = this.menubarItems.indexOf(currentItem);
    newItem = this.menubarItems[ index - 1 ];
  }

  if (currentItem.domNode.tagName == 'SELECT') {
      currentItem.domNode.disabled = true;
      setTimeout(function () { currentItem.domNode.disabled = false; }, 0);
  }

  if (!a11y.u.isVisible(newItem.domNode)) {
    this.setFocusToLastItem(newItem);
    return true;
  }

  this.setFocusToItem(newItem);
  return true;
};

Menubar.prototype.setFocusToNextItem = function (currentItem, orExit) {
  var index;

  if (currentItem === this.lastItem) {
    if (orExit) {
      return false;
    }
    newItem = this.firstItem;
  }
  else {
    index = this.menubarItems.indexOf(currentItem);
    newItem = this.menubarItems[ index + 1 ];
  }

  if (currentItem.domNode.tagName == 'SELECT') {
      currentItem.domNode.disabled = true;
      setTimeout(function () { currentItem.domNode.disabled = false; }, 0);
  }

  if (!a11y.u.isVisible(newItem.domNode)) {
    this.setFocusToLastItem(newItem);
    return true;
  }

  this.setFocusToItem(newItem);
  return true;

};

Menubar.prototype.setFocusByFirstCharacter = function (currentItem, char) {
  var start, index, char = char.toLowerCase();
  var flag = currentItem.domNode.getAttribute('aria-expanded') === 'true';

  // Get start index for search based on position of currentItem
  start = this.menubarItems.indexOf(currentItem) + 1;
  if (start === this.menubarItems.length) {
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
    this.setFocusToItem(this.menubarItems[ index ]);
  }
};

Menubar.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (char === this.firstChars[ i ]) {
      return i;
    }
  }
  return -1;
};
Menubar.prototype.open = function () {
    addClass(this.domNode.parentElement, 'open');
    this.isDropdown = true;

    if (!this.menubarItems.length) {
        this.init();
    }
};
Menubar.prototype.close = function () {
    removeClass(this.domNode.parentElement, 'open');
    this.isDropdown = false;

    for (var i = 0; i < this.menubarItems.length; i++) {
        this.menubarItems[i].close();
    }
};

Menubar.prototype.isDropDown = function () {
    if (!this.isDropdown) return false;
    if (!this.menuButton) return false;
    var btn = this.menuButton.domNode;

    return !!(btn.offsetWidth || btn.offsetHeight || btn.getClientRects().length);
};

Menubar.prototype.isOpen = function () {
    //if (!this.isDropDown()) return false;
    return hasClass(this.domNode.parentElement, 'open');
};

function addClass(element, css) {
    if (element.classList) element.classList.add(css);
    else element.className += ' '+ css ;
}
function removeClass(element, css) {
    if (element.classList) element.classList.remove(css);
    else element.className = element.className.replace(new RegExp('(^|\\b)' + css + '(\\b|$)', 'gi'), '');
}
function hasClass(element, css) {
    if (element.classList)
        return element.classList.contains(css);
        return new RegExp('(^| )' + css + '( |$)', 'gi').test(element.className);
}