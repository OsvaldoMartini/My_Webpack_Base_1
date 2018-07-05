/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   MenubarItemLinks.js
*
*   Desc:   Menubar Menuitem widget that implements ARIA Authoring Practices
*           for a menu of links
*
*   Author: Jon Gunderson, Ku Ja Eun and Nicholas Hoyt
*/

/*
*   @constructor MenubarItem
*
*   @desc
*       Object that configures menu item elements by setting tabIndex
*       and registering itself to handle pertinent events.
*
*       While menuitem elements handle many keydown events, as well as
*       focus and blur events, they do not maintain any state variables,
*       delegating those responsibilities to its associated menu object.
*
*       Consequently, it is only necessary to create one instance of
*       MenubarItem from within the menu object; its configure method
*       can then be called on each menuitem element.
*
*   @param domNode
*       The DOM element node that serves as the menu item container.
*       The menuObj PopupMenu is responsible for checking that it has
*       requisite metadata, e.g. role="menuitem".
*
*   @param menuObj
*       The PopupMenu object that is a delegate for the menu DOM element
*       that contains the menuitem element.
*/
var MenubarItem = function (domNode, menuObj) {

  this.menubar = menuObj;
  this.domNode = domNode;
  this.popupMenu = false;

  this.hasFocus = false;
  this.hasHover = false;

  this.isMenubarItem = true;
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

  if (this.domNode.tagName == 'LABEL') {
      var forAttr = this.domNode.getAttribute('for');
      if (forAttr && (forAttr = document.getElementById(forAttr))) {
          this.domNode = forAttr;
          return;
      }

      for (var i = 0; i < this.domNode.childElementCount; i++) {
          if (a11y.u.isFocusable(this.domNode.children[i])) {
              this.domNode = this.domNode.children[i];
              break;
          }
      }
  }
};

MenubarItem.prototype.init = function () {
  this.domNode.tabIndex = -1;

  this.domNode.setAttribute('role', 'menuitem');

  if (this.domNode.parentNode.tagName === 'LI') {
    this.domNode.parentNode.setAttribute('role', 'none');
  }

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('keypress', this.handleKeypress.bind(this));
  if(this.menubar.clickOpen){
    this.domNode.addEventListener('click', this.handleClick.bind(this));
  }
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));
  if(this.menubar.hoverOpen){
    this.domNode.addEventListener('mouseenter', this.handleMouseover.bind(this));
    this.domNode.addEventListener('mouseleave', this.handleMouseout.bind(this));
  }
  // Initialize pop up menus

  var nextElement = this.domNode.nextElementSibling;

  if (nextElement && nextElement.tagName === 'UL') {
    this.domNode.setAttribute('aria-haspopup', 'true');
    this.domNode.setAttribute('aria-expanded', 'false');
    this.popupMenu = new PopupMenu(nextElement, this);
    this.popupMenu.init();

    return;
  }

  if (nextElement && nextElement.tagName === 'DIV' /*&& /\bMMPanel\b/.test(nextElement.className)*/) {
      this.domNode.setAttribute('aria-haspopup', 'true');
      this.domNode.setAttribute('aria-expanded', 'false');
      this.popupMenu = new PopupMegaMenu(nextElement, this);
      this.popupMenu.init();
  }
};

MenubarItem.prototype.handleKeydown = function (event) {
  var tgt = event.currentTarget,
      flag = false,
 clickEvent;

  switch (event.keyCode) {
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
    case this.keyCode.DOWN:
      if (this.popupMenu) {
        this.popupMenu.open();
        this.popupMenu.setFocusToFirstItem();
        flag = true;
      } else if (this.domNode.parentElement.parentElement.classList && this.domNode.parentElement.parentElement.classList.contains('dropdown-menu')) {
          flag = true;
      }
      break;

    case this.keyCode.LEFT:
      this.menubar.setFocusToPreviousItem(this);
      flag = true;
      break;

    case this.keyCode.RIGHT:
      this.menubar.setFocusToNextItem(this);
      flag = true;
      break;

    case this.keyCode.UP:
      if (this.popupMenu) {
        this.popupMenu.open();
        this.popupMenu.setFocusToLastItem();
        flag = true;
      }
      break;

    case this.keyCode.HOME:
    case this.keyCode.PAGEUP:
      this.menubar.setFocusToFirstItem();
      flag = true;
      break;

    case this.keyCode.END:
    case this.keyCode.PAGEDOWN:
      this.menubar.setFocusToLastItem();
      flag = true;
      break;
    case this.keyCode.TAB:
      if (event.shiftKey) 
        flag = this.menubar.setFocusToPreviousItem(this, true);
      else
        flag = this.menubar.setFocusToNextItem(this, true);
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

MenubarItem.prototype.handleKeypress = function (event) {
  var char = String.fromCharCode(event.charCode);

  function isPrintableCharacter (str) {
    return str.length === 1 && str.match(/\S/);
  }

  if (isPrintableCharacter(char)) {
    this.menubar.setFocusByFirstCharacter(this, char);
  }
};

MenubarItem.prototype.handleClick = function (event) {
    if (this.popupMenu) {
        if (!this.popupMenu.isOpen) {
            this.popupMenu.open();
            event.stopPropagation();
            event.preventDefault();
            return false;
        } else {
            this.popupMenu.close(true);
        }
    }
};

MenubarItem.prototype.handleFocus = function (event) {
  this.menubar.hasFocus = true;
};

MenubarItem.prototype.handleBlur = function (event) {
    this.menubar.hasFocus = false;
    if (this.popupMenu && this.menubar.isDropDown()) {
        setTimeout(this.popupMenu.close.bind(this.popupMenu, false,3), 100);
    }
};

MenubarItem.prototype.handleMouseover = function (event) {
    this.hasHover = true;
    if (this.popupMenu && !this.menubar.isDropDown()) {
        this.isOpening = setTimeout(this.popupMenu.open.bind(this.popupMenu, false, 4), 80);
    }
};

MenubarItem.prototype.handleMouseout = function (event) {
    this.hasHover = false;
    if (this.isOpening) clearTimeout(this.isOpening);
    if (this.popupMenu && !this.menubar.isDropDown()) {
        if (!a11y.u.isVisible(this.popupMenu.domNode)) {
            this.popupMenu.close(false, 4.5)
        } else {
            setTimeout(this.popupMenu.close.bind(this.popupMenu, false,4), 300);
        }
    }
};

MenubarItem.prototype.close = function () {
    if (this.popupMenu) {
        this.popupMenu.close(false)
    }
};
