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
*   @constructor MenubarButton
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
*       MenubarButton from within the menu object; its configure method
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
var MenubarButton = function (domNode, menuObj) {

  this.menubar = menuObj;
  this.domNode = domNode;
  this.popupMenu = false;

  this.hasFocus = false;
  this.hasHover = false;

  this.isMenubarItem = false;

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

MenubarButton.prototype.init = function () {
  this.domNode.tabIndex = 0;

  this.domNode.setAttribute('role', 'button');

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('keypress', this.handleKeypress.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));
  this.domNode.addEventListener('mouseenter', this.handleMouseover.bind(this));
  this.domNode.addEventListener('mouseleave', this.handleMouseout.bind(this));

 };

MenubarButton.prototype.handleKeydown = function (event) {
  var tgt = event.currentTarget,
      flag = false,
 clickEvent;

  switch (event.keyCode) {
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
    case this.keyCode.DOWN:
        if (this.menubar) {
            if (this.menubar.isOpen()) {
                this.menubar.close();
            } else {
                this.menubar.open();
                this.menubar.setFocusToFirstItem();
            }
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
        if (this.menubar) {
            this.menubar.open();
            this.menubar.setFocusToLastItem();
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

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

MenubarButton.prototype.handleKeypress = function (event) {
  var char = String.fromCharCode(event.charCode);

  function isPrintableCharacter (str) {
    return str.length === 1 && str.match(/\S/);
  }

  if (isPrintableCharacter(char)) {
    this.menubar.setFocusByFirstCharacter(this, char);
  }
};

MenubarButton.prototype.handleClick = function (event) {
    var self = this;
    function closeMenuBar(e) {
        // Cheating with jQuery, a parent loop not concise enough
        if ($(e.target).parents().filter(self.menubar.domNode.parentElement).length) return;
        self.menubar.close();
    }
    if (this.menubar) {
        if (this.menubar.isOpen()) {
            this.menubar.close();
            window.removeEventListener('click', closeMenuBar, true);
            return false;
        } else {
            this.menubar.open();
            window.addEventListener('click', closeMenuBar, true);

        }
    }
};

MenubarButton.prototype.handleFocus = function (event) {
  this.menubar.hasFocus = true;
};

MenubarButton.prototype.handleBlur = function (event) {
  this.menubar.hasFocus = false;
};

MenubarButton.prototype.handleMouseover = function (event) {
    this.hasHover = true;
};

MenubarButton.prototype.handleMouseout = function (event) {
    this.hasHover = false;
    
};

