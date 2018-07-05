(function(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") exports["customScrollbar"] = factory();
  else root["customScrollbar"] = factory();
})(this, function() {
  function getScrollbarSize() {
    var outer = createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
  }
  function createElement(name, classlist) {
    var element = document.createElement(name);
    element.className +=
      Object.prototype.toString.call(classlist) === "[object Array]"
        ? classlist.join(" ")
        : classlist;
    return element;
  }

  function wheelScrollData(e) {
    var wheelDeltaX = e.wheelDeltaX,
      wheelDeltaY = e.wheelDeltaY;
    if (wheelDeltaX == null && e.detail && e.axis === e.HORIZONTAL_AXIS) {
      wheelDeltaX = e.detail;
    }
    if (wheelDeltaY == null && e.detail && e.axis === e.VERTICAL_AXIS) {
      wheelDeltaY = e.detail;
    } else if (wheelDeltaY == null) {
      wheelDeltaY = e.wheelDelta;
    }

    return { x: wheelDeltaX, y: wheelDeltaY };
  }

  function nearest(element, find) {
    if (element === find) return element;
    if (element.parentElement) return nearest(element.parentElement, find);
    return null;
  }

  var customScrollbar = function(el, options) {
    if (!el) {
      return;
    }
    if (el.length) {
      for (var i = 0; i < el.length; i++) {
        customScrollbar(el[i], options);
      }
      return;
    }
    function isSetup(el) {
      var childNodes = el.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        if (childNodes[i].nodeType === 3) continue;
        if (/(?:^|\s)scroll-box(?:$|\s)/.test(childNodes[i].className))
          return true;
      }
      return false;
    }
    if (isSetup(el)) return;
      
    var self = {};
    self.element = el;
    self.content = null;
    self.scrollBox = null;
    self.scroller = null;
    self.scrollbar = null;
    self.bar = null;
    self.scrollbarV = null;
    self.barV = null;
    self.scrollbarH = null;
    self.barH = null;
    self.factor = 1;
    self.scrollbarSize = 10;
    self.options = options || {};
    self.options.callbacks = self.options.callbacks || {};
    function setupNesting() {
      self.element.className += " custom-scrollbar";
      self.scrollBox = createElement("div", "scroll-box");
      self.scroller = createElement("div", "scroller");
      self.scrollBox.appendChild(self.scroller);
      self.content = self.element.children[0];
      self.element.replaceChild(self.scrollBox, self.content);
      self.scroller.appendChild(self.content);

      self.scrollBox.appendChild(
        (self.scrollbarH = createElement("div", ["scrollbar", "scrollbar-h"]))
      );
      self.scrollbarH.appendChild(
        (self.barH = createElement("div", "dragger"))
      );
      self.barH.appendChild(createElement("div", "bar"));

      self.scrollBox.appendChild(
        (self.scrollbarV = createElement("div", ["scrollbar", "scrollbar-v"]))
      );
      self.scrollbarV.appendChild(
        (self.barV = createElement("div", "dragger"))
      );
      self.barV.appendChild(createElement("div", "bar"));

      self.scrollbarSize = getScrollbarSize();
    }

    function scrollbarPercent() {
      var totalHeight = self.scroller.scrollHeight;
      var viewHeight = self.scroller.clientHeight;
      return viewHeight / totalHeight;
    }
    function scrollbarHeight() {
      return scrollbarPercent() * self.scroller.clientHeight;
    }

    function scrollbarHPercent() {
      var totalWidth = self.scroller.scrollWidth;
      var viewWidth = self.scroller.clientWidth;
      return viewWidth / totalWidth;
    }

    function scrollbarWidth() {
      return scrollbarHPercent() * self.scroller.clientWidth;
    }

    function setupSize() {

      var width = scrollbarWidth();
      if (width < self.scroller.clientWidth) {
        self.barH.style.width = width + "px";
        self.scrollbarH.style.display = "block";
        self.scroller.style.height = '';
        self.scrollBox.style.height = '';
        self.scrollBox.style.height = self.scrollBox.clientHeight + 'px';
        self.scroller.style.height = (self.scrollBox.clientHeight +  self.scrollbarSize ) + 'px';
      } else {
        self.scrollbarH.style.display = "none";
        self.scroller.style.height = "100%";
      }
      var height = scrollbarHeight();
      if (height < self.scroller.clientHeight) {
        self.barV.style.height = height + "px";
        self.scrollbarV.style.display = "block";
        self.scroller.style.width = "calc(100% + " + self.scrollbarSize + "px)";
      } else {
        self.scrollbarV.style.display = "none";
        self.scroller.style.width = "100%";
      }
    }

    //var barpos = 0;

    function getScrollData(e) {
      var scrollData = wheelScrollData(e);
      (scrollData.x *= self.factor), (scrollData.y *= self.factor);
      return scrollData;
    }
    function moveScrollerTo(dir, pos) {
      self.scroller[dir === "y" ? "scrollTop" : "scrollLeft"] = pos;
    }

    function calculateOffset(vertical) {
      if (!self.scroller[vertical ? "clientHeight" : "clientWidth"]) return;
      var scrollTop = self.scroller[vertical ? "scrollTop" : "scrollLeft"];
      var scrollHeight =
        self.scroller[vertical ? "scrollHeight" : "scrollWidth"];
      var clientHeight =
        self.scroller[vertical ? "clientHeight" : "clientWidth"];
      var scrollPercent = scrollTop / (scrollHeight - clientHeight);
      var size = 1;
      if (vertical) {
        size = scrollbarHeight();
      } else {
        size = scrollbarWidth();
      }
      var scrollOffset = scrollPercent * clientHeight - scrollPercent * size;
      return scrollOffset;
    }

    function onMouseWheel(e) {
      var scrollbarDir = nearest(e.target, self.scrollbarV) ? "y" : "x";
      var scrollDist = getScrollData(e)[scrollbarDir];
      var pos =
        self.scroller[scrollbarDir === "y" ? "scrollTop" : "scrollLeft"];
      moveScrollerTo(scrollbarDir, pos + scrollDist);
    }

    function onScrollerScroll(e) {
      if (!self.scroller.clientHeight) return;
      var scrollVOffset = calculateOffset(true);
      var scrollHOffset = calculateOffset(false);
      self.barV.style.top = scrollVOffset + "px";
      self.barH.style.left = scrollHOffset + "px";

      if (self.options.callbacks.whileScrolling) {
        window[
          window.requestAnimationFrame ? "requestAnimationFrame" : "setTimeout"
        ](function() {
          self.options.callbacks.whileScrolling.call(self.scroller);
        });
      }
    }

    var mouseDownPos = {};

    function onMouseMoveV(e) {
      self.scroller.scrollTop =
        mouseDownPos.scrollY +
        (e.clientY - mouseDownPos.y) / mouseDownPos.scrollRatioY;
    }
    function onMouseMoveH(e) {
      self.scroller.scrollLeft =
        mouseDownPos.scrollX +
        (e.clientX - mouseDownPos.x) / mouseDownPos.scrollRatioX;
    }

    function onMouseUp() {
      self.scroller.className = self.scroller.className.replace(
        /(?:^|\s)unselectable(?:\s|$)/,
        " "
      );
      window.removeEventListener("mouseup", onMouseUp);

      window.removeEventListener("mousemove", onMouseMoveV);
      window.removeEventListener("mousemove", onMouseMoveH);
    }

    function barMousedown(vertical, e) {
      if (!e && vertical.constructor === MouseEvent) {
        e = vertical;
        vertical = true;
      }
      e.stopImmediatePropagation();
      e.preventDefault();
      mouseDownPos.y = e.clientY;
      mouseDownPos.scrollY = self.scroller.scrollTop;
      mouseDownPos.scrollRatioY = scrollbarPercent();
      mouseDownPos.x = e.clientX;
      mouseDownPos.scrollX = self.scroller.scrollLeft;
      mouseDownPos.scrollRatioX = scrollbarHPercent();
      if (vertical) {
        window.addEventListener("mousemove", onMouseMoveV);
      } else {
        window.addEventListener("mousemove", onMouseMoveH);
      }
      window.addEventListener("mouseup", onMouseUp);

      self.scroller.className += " unselectable";
    }
    function scollbarClick(e) {
      var vertical = !!nearest(e.target, self.scrollbarV);
      var barRect = self[vertical ? "barV" : "barH"].getBoundingClientRect();
      var pos = e[vertical ? "clientY" : "clientX"];
      var weight = 0;
      if (vertical) {
        if (pos < barRect.top) weight = -1;
        else if (pos > barRect.bottom) weight = 1;

        self.scroller.scrollTop =
          self.scroller.scrollTop + weight * self.scroller.clientHeight;
      } else {
        if (pos < barRect.left) weight = -1;
        else if (pos > barRect.right) weight = 1;

        self.scroller.scrollLeft =
          self.scroller.scrollLeft + weight * self.scroller.clientWidth;
      }
    }

    function setupFactor() {
      var userAgent = navigator.userAgent;
      var isMSIE = /MSIE \d/.test(userAgent);
      var isTrident = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
      var isEdge = /Edge\/(\d+)/.exec(userAgent);
      var isIE = isMSIE || isTrident || isEdge;
      var isFF = /gecko\/\d/i.test(userAgent);
      var isChrome = !isEdge && /Chrome\//.test(userAgent);
      var isMac = /Apple Computer/.test(navigator.vendor);
      self.factor = isIE
        ? -0.53
        : isFF ? 15 : isChrome ? -0.7 : isMac ? -1 / 3 : null;
    }

    setupNesting();
    setupSize();
    setupFactor();

    self.scroller.addEventListener("scroll", onScrollerScroll);

    self.scrollbarV.addEventListener("click", scollbarClick);
    self.scrollbarH.addEventListener("click", scollbarClick);

    self.barV.addEventListener("mousedown", barMousedown);
    self.barH.addEventListener("mousedown", barMousedown.bind(null, false));

    self.scrollbarV.addEventListener("mousewheel", onMouseWheel);
    self.scrollbarH.addEventListener("mousewheel", onMouseWheel);

    if (window.ResizeObserver) {
      var ro = new window.ResizeObserver(function(entries) {
        setupSize();
      });
      ro.observe(self.content);
    } else {
      window.setInterval(setupSize, 500);
    }
  };

  return customScrollbar;
});
