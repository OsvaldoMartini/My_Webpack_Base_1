
/**
 * class to define an ARIA-enabled slider widget. The class 
 *  will create needed handles and define ARIA attributes for the slider
 * @param {string} container_id - the id of the containing div for the slider
 * @param {boolean} vert - true if the slider is vertical; false if horizontal
 * @param {array} values - an array of values to display on the slider.
 * @param {integer} inc - the size of a single increment.
 * @param {integer} jump - the size of a large increment.
 * @param showVals 
 * @param {object} val - the initial value.
 * @param {function} format - a function used to format values.
 * @param {object} options - an object of options containing callback functions.
 */
function TimeSlider(container_id, vert, values, inc, jump, showVals, val, format, options) {

    // define slider object properties
    this.keys = new keyCodes();

    this.id = container_id;
    this.$container = $('#' + container_id).addClass('slider');

    this.$container.empty();

    this.vert = vert;
    this.showVals = showVals;

    // Store the size of the slider
    this.width = this.$container.outerWidth();
    this.height = this.$container.outerHeight();

    this.values = values;
    this.min = values[0];
    this.max = values[values.length - 1];

    this.inc = inc;
    this.jump = jump;
    this.val = null;
    this.format = format || function (v) {
        return v;
    };

    this.playing = false;

    this.options = $.extend({}, {
        onChanges: [],
        interval: 1000,
        createDropdown: false,
        dropdownContent: function (v){return v;}
    }, options);

    if (options.onChange) {
        this.options.onChanges.push(options.onChange);
    }

    this.$ticks = this.createTickMarks();
    this.$progress = this.createProgressBar();
    // Create the handle
    this.$handle = this.createHandle(val);
    this.$dropdown = this.createDropdown();


    this.$label = this.createLabel();

    this.positionHandle(this.$handle, val);
}

TimeSlider.prototype.onChange = function () {
    var self = this;
    if (!self.options.onChanges) return;
    self.options.onChanges.forEach(function (callback) {
        callback(self.val);
    });
}

/**
 * Create Label showing the current value.
 */
TimeSlider.prototype.createLabel = function () {
    var label = $('<div id="' + this.id + '_label" class="-label" role="presentation"></div>').appendTo(this.$container);
    return label;
};

/**
 * Create a dropdown with each value.
 */
TimeSlider.prototype.createDropdown = function () {
    var self = this;
    if (!self.options.createDropdown) return;
    var toggle = $('<button class="-dropdownToggle btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"><i class="icon-down-dir"></i></button>').appendTo(self.$container);
    var dropdown = $('<div class="-dropdown dropdown-menu" role="menu"></div>')
        .appendTo(self.$container.addClass('dropdown'));

    var list = '';
    for (var i = 0; i < self.values.length; i++) {
        list += self.options.dropdownContent(self.values[i]);
    }

    dropdown.append(list);

    var activeClass = "btn-success";
    var toggles = dropdown.find('[data-shape-layer]')
        .click(function (e) {
            var val = self.$ticks.filter('[data-val="' + e.target.getAttribute('data-shape-layer') + '"]').data('value');
            self.positionHandle(self.$handle, val);
        })
        .keydown(function (e) {
            return self.handleKeyDown(self.$handle, e);
        });;

    var setActiveState = function (v) {
        toggles.removeClass(activeClass).attr('tabindex', -1).siblings().attr('tabindex', -1);
        var btn = toggles.filter('[data-shape-layer="' + self.format(v) + '"]')
            .addClass(activeClass).attr('tabindex', 0);
        btn.siblings().attr('tabindex', 0);
        if (toggles.filter(':focus').length) {
            btn.focus();
        }
    };

    self.options.onChanges.push(setActiveState);

    toggle.click(function (e) {
    //    self.$container.toggleClass('open');
    });

    setActiveState(self.val)

    return dropdown;
};

/**
 * Create tickmarks for given values.
 */
TimeSlider.prototype.createTickMarks = function () {
    for (var i = 0; i < this.values.length; i++) {
        var v = this.values[i];
        var tick = $('<div class="-tick"><div class="-label">' + this.format(v, 2) + '</div></div>');
        this.$container.append(tick);
        this.placeMarker(tick, v, true);
        var visible = true;
        if (tick.data('remove')) {
            if (i < this.values.length - 1) {
                //tick.remove();
                tick.hide();
                visible = false;
            }
            else {
                //this.$ticks.last().remove();
                this.$ticks.last().hide();
                this.placeMarker(tick, v);
            }
        }
        tick.data('value', v);
        tick.attr('data-val', this.format(v));
        if (!visible) continue;

        this.bindTicks(tick);
        this.$ticks = this.$ticks ? this.$ticks.add(tick) : tick;
    }
    return this.$container.find('.-tick');
};

/**
 * Creates a progress bar for the slider.
 */
TimeSlider.prototype.createProgressBar = function () {
    var bar = $('<div class="-progress"></div>')
      .appendTo(this.$container);
    return bar;
};

/**
 * creates a handle for the slider. It defines ARIA attributes for the handle and positions
 * it at the specified value in the slider range. if showVals is true, create and position 
 * divs to display the handle value.
 * @param {integer} val - the initial value of the handle
 * @return {jQuery} the object pointer of the newly created handle
 */
TimeSlider.prototype.createHandle = function (val) {

    var id = this.id + '_handle';
    var label = this.id + '_label';
    var controls = this.id + '_text';
    var $handle;
    var handle = '<button type="button" aria-pressed="false" id="' + id + '" class="-handle" role="slider" ' +
      'aria-valuemin="' + this.format(this.min) +
      '" aria-valuemax="' + this.format(this.max) +
      '" aria-valuenow="' + this.format(val === undefined ? this.min : val) +
      '" aria-labelledby="' + label +
      '" aria-controls="' + controls + '" tabindex="0"></div>';

    // Create the handle
    this.$container.append(handle);

    // store the handle object
    $handle = $('#' + id);

    if (this.showVals === true) {
        var valContainer = '<div id="' + id + '_val" class="-sliderValue" role="presentation"></div>';

        // Create the container.
        this.$container.append(valContainer);
    }

    // store the value object
    $handle = $('#' + id);

    // position handle
    this.positionHandle($handle, val);

    // bind handlers
    this.bindHandlers($handle);

    return $handle;

}; // end createHandle()

/**
 * position a handle at the specified value for the slider. 
 * @param {jQuery} $handle - the slider handle
 * @param {object} val - the new value of the slider
 */
TimeSlider.prototype.positionHandle = function ($handle, val) {
    var pos = this.placeMarker($handle, val);
    // Set the aria-valuenow position of the handle
    $handle.attr('aria-valuenow', this.format(val));
    $handle.data('xy', pos);

    if (this.$label) this.$label[0].textContent = this.format(val);

    if (this.val === val) return;
    // Update the stored handle values
    this.val = val;

    // if showVal is true, update the value container
    if (this.showVals === true) {
        // this.updateValBox($handle, Math.round(valPos));
    }

    this.updateProgress($handle);

    this.onChange();
};

/**
 * Update the progress bar of the slider.
 * @param {jQuery} $handle - optional handle element which contains the size of the progress bar.
 */
TimeSlider.prototype.updateProgress = function ($handle) {
    $handle = $handle || this.$handle;
    if (!$handle) return;
    var xy = $handle.data('xy');
    if (!this.vert) {
        this.$progress[0].style.transform = 'scalex(' + xy.x + ')';
    } else {
        this.$progress[0].style.transform = 'scaley(' + xy.y + ')';
    }
};

/**
 * Position the marker (handle or tick) at the corresponding place of the val.
 * @param {jQuery} $handle - the element to place.
 * @param {object} val - the value to place the element at.
 * @param {boolean} preventOverlap - a value indicating whether, in the case of ticks, it can be placed on top of another marker.
 */
TimeSlider.prototype.placeMarker = function ($handle, val, preventOverlap) {

    var handleHeight; // the total height of the handle
    var handleWidth; // the total width of the handle
    var handleOffset; // the distance from the value position for centering the handle
    var xPos; // calculated horizontal position of the handle;
    var yPos; // calculated vertical position of the handle;
    var valPos; //calculated new pixel position for the value;

    function getDimension($object) {
        var outerHeight = $object.data('outerHeight') || $object.data('outerHeight', $object.outerHeight()).outerHeight(); // the total height of the handle
        var outerWidth = $object.data('outerWidth') || $object.data('outerWidth', $object.outerWidth()).outerWidth(); // the total width of the handle
        return { h: outerHeight, w: outerWidth };
    }

    var dims = getDimension($handle);
    handleHeight = dims.h;
    handleWidth = dims.w;

    if (this.vert === false) {
        // horizontal slider

        // calculate the horizontal pixel position of the specified value
        valPos = ((val - this.min) / (this.max - this.min)) * (this.width);

        xPos = Math.round(valPos - (handleWidth / 2));
        yPos = Math.round((this.height / 2) - (handleHeight / 2));
    } else {
        // vertical slider

        // calculate the vertical pixel position of the specified value  
        valPos = ((val - this.min) / (this.max - this.min)) * (this.height);

        xPos = Math.round((this.width / 2) - (handleWidth / 2));
        yPos = Math.round(valPos - (handleHeight / 2));
    }

    if (preventOverlap && this.$ticks) {
        //console.log(this.$ticks);
        this.$ticks.each(function (i, t) {
            var $t = $(t);
            var tPos = $t.position();
            var tSize = getDimension($t)[this.vert ? "h" : "w"];
            var dir = this.vert ? "top" : "left";
            if (tPos[dir] + tSize * 1.3 > (this.vert ? yPos : xPos)) {
                $handle.data('remove', true);
                return false;
            }
        });
    }

    var xy = { x: xPos, y: yPos };
    // Set the position of the handle
    $handle[0].style.transform = 'translate(' + xy.x + 'px, ' + xy.y + 'px)';
    return xy;
};

/**
 * bind event handlers to a slider handle
 * @param {jQuery} $handle - the slider handle
 */
TimeSlider.prototype.bindHandlers = function ($handle) {

    var self = this; // store the this pointer

    $handle.keydown(function (e) {
        return self.handleKeyDown($handle, e);
    });

    $handle.keypress(function (e) {
        return self.handleKeyPress($handle, e);
    });

    $handle.focus(function (e) {
        //return self.handleFocus($handle, e);
    });

    $handle.blur(function (e) {
        // return self.handleBlur($handle, e);
    });

    $handle.mousedown(function (e) {
        return self.handleMouseDown($handle, e);
    });

    $handle.click(function (e) {
        if (e.target.hasAttribute('preventClick')) {
            e.target.removeAttribute('preventClick')
            return false;
        }
        self.play();
        e.stopPropagation();
        return false;
    });
};

/**
 * Bind event handlers to a slider tick
 * @param {jQuery} $tick - the slider tick to bind.
 */
TimeSlider.prototype.bindTicks = function bindTicks($tick) {
    var self = this;
    $tick
      .click(function (e) {
          return self.handleTickClick($tick, e);
      })
      .mouseenter(function (e) {
          return self.handleTickFocus($tick, e, true);
      })
      .mouseleave(function (e) {
          return self.handleTickFocus($tick, e, false);
      });
};

/**
 * Handles focus on a tick.
 * @param {jQuery} $tick - the tick target
 * @param {object} event - the mousedown event object.
 * @param {boolean} enter - a value indicating whether the focus in entering or leaving the $tick. 
 */
TimeSlider.prototype.handleTickFocus = function handleTickFocus($tick, e, enter) {
    this.$label[0].textContent = enter ? this.format($tick.data('value')) : this.format(this.val);
};

/**
 * function to process click events for a slider tick.
 * @param {jQuery} $tick - the tick target
 * @param {object} event - the mousedown event object.
 * @return {boolean} true if propagating; false is consuming event.
 */
TimeSlider.prototype.handleTickClick = function ($tick, e) {
    var offset = this.$container.offset();
    this.left = Math.round(offset.left);
    this.top = Math.round(offset.top);
    this.handleMouseMove(this.$handle, e);
    this.$handle.focus();
};

/**
 * function to process keydown events for a slider handle
 * @param {jQuery} $handle - the handle
 * @param {object} event - the mousedown event object.
 * @return {boolean} true if propagating; false is consuming event.
 */
TimeSlider.prototype.handleKeyDown = function ($handle, evt) {

    if (evt.ctrlKey || evt.shiftKey || evt.altKey) {
        // Do nothing
        return true;
    }

    switch (evt.keyCode) {
        case this.keys.home:
            // move the handle to the slider minimum
            this.positionHandle($handle, this.min);
            evt.stopPropagation();
            return false;
        case this.keys.end:
            this.positionHandle($handle, this.max);
            evt.stopPropagation();
            return false;
        case this.keys.pageup:
            this.moveHandle($handle, -this.jump);
            evt.stopPropagation();
            return false;
        case this.keys.pagedown:
            this.moveHandle($handle, this.jump);
            evt.stopPropagation();
            return false;
        case this.keys.left:
        case this.keys.up:
            // decrement
            this.moveHandle($handle, -this.inc);
            evt.stopPropagation();
            return false;
        case this.keys.right:
        case this.keys.down:
            // increment
            this.moveHandle($handle, this.inc);
            evt.stopPropagation();
            return false;
    }

    return true;

};

/**
 * function to process keypress events for a slider handle. Needed for
 * browsers that perform window scrolling on keypress rather than keydown events.
 * @param {jQuery} $handle - the handle
 * @param {object} event - the mousedown event object.
 * @return {boolean} true if propagating; false is consuming event.
 */
TimeSlider.prototype.handleKeyPress = function ($handle, evt) {

    if (evt.ctrlKey || evt.shiftKey || evt.altKey) {
        // Do nothing
        return true;
    }
    switch (evt.keyCode) {
        case this.keys.home:
        case this.keys.pageup:
        case this.keys.end:
        case this.keys.pagedown:
        case this.keys.left:
        case this.keys.up:
        case this.keys.right:
        case this.keys.down:
            // Consume the event
            evt.stopPropagation();
            return false;
    }

    return true;

};

/**
 * Set the timeline to play.
 */
TimeSlider.prototype.play = function () {
    var self = this;
    if (self.playing) {
        self.$handle.attr('aria-pressed', "false");
        this.$container.removeClass('_playing');
        clearInterval(self.playing);
        this.playing = false;

        return;
    }
    this.$container.addClass('_playing');

    self.$handle.attr('aria-pressed', "true");

    var doMove = function () {
        self.moveHandle(self.$handle, 1);
        if (self.val == self.max) self.play();
    };

    self.playing = setInterval(doMove, this.options.interval);
};

/**
 * process mousedown events for a slider handle. The function binds a mousemove handler
 * @param {jQuery} $handle - the handle
 * @param {object} event - the mousedown event object.
 * @return {boolean} true if propagating; false is consuming event.
 */
TimeSlider.prototype.handleMouseDown = function ($handle, evt) {

    var self = this; // store the this pointer

    // Set focus to the clicked handle
    $handle.focus();

    $handle.removeAttr('data-moving');

    var offset = this.$container.offset();
    this.left = Math.round(offset.left);
    this.top = Math.round(offset.top);

    if (evt.target.hasAttribute('preventClick')) {
        evt.target.removeAttribute('preventClick')
    }

    // bind a mousemove event handler to the document to capture the mouse
    $(document).mousemove(function (e) {
        self.handleMouseMove($handle, e);
    });

    //bind a mouseup event handler to the document to capture the mouse
    $(document).mouseup(function (e) {
        return self.handleMouseUp($handle, e);
    });

    evt.stopPropagation();
    return false;

};

/**
 * process mouseup events for a slider handle. The function unbinds the mousemove handler
 * @param {jQuery} $handle - the object associated with the event
 * @param {object} evt - the event object associated with the the event
 * @return {boolean}  true if propagating; false if consuming event
 */
TimeSlider.prototype.handleMouseUp = function ($handle, evt) {

    if ($handle.attr('data-moving')) {
        $handle.removeAttr('data-moving');
        if (evt.target === this.$handle.get(0)) {
            evt.target.setAttribute('preventClick', true);
        }
    }

    // unbind the event listeners to release the mouse
    $(document).unbind('mousemove');
    $(document).unbind('mouseup');

    evt.stopPropagation();
    return false;

};

/**
 * Process mousemove events for a slider handle.
 * @param {jQuery} $handle - the object associated with the event
 * @param {object} evt - the event object associated with the the event
 * @return {boolean}  true if propagating; false if consuming event
 */
TimeSlider.prototype.handleMouseMove = function ($handle, evt) {
    var self = this;
    var curVal = self.val;
    var newVal;
    var startVal = self.min;
    var stopVal = self.max;

    if (self.vert === false) {
        // horizontal slider
        // Calculate the new slider value based on the horizontal pixel position of the mouse
        newVal = (evt.pageX - self.left) / self.width * (self.max - self.min);
    } else {
        // vertical slider

        // Calculate the new slider value based on the vertical pixel position of the mouse
        newVal = (evt.pageY - this.top) / this.height * (this.max - this.min);
    }

    if (self.min instanceof Date) {
        newVal = self._addTime(self.min, newVal);
    } else {
        newVal += self.min;
    }
    // find nearest
    newVal = self._closest(newVal, self.values);

    //console.log(newVal.toString(), startVal.toString(), stopVal.toString());
    //return;
    if (newVal >= startVal && newVal <= stopVal) {

        // Do not move handle unless new value is a slider increment
        if (newVal % this.inc === 0) {
            this.positionHandle($handle, newVal);
        }
    } else if (newVal < startVal) {

        // value is less than minimum for slider - set handle to min
        this.positionHandle($handle, startVal);
    } else if (newVal > stopVal) {

        // value is greater than maximum for slider - set handle to max
        this.positionHandle($handle, stopVal);
    }

    $handle.attr('data-moving', true);

    evt.stopPropagation();
    return false;

};

/**
 * Move the handle inc increments.
 * @param {jQuery} $handle - the handle to move.
 * @param {integer} inc - the increment size.
 */
TimeSlider.prototype.moveHandle = function ($handle, inc) {
    var currentVal = this.val;

    var newVal = this.values[this.values.indexOf(this.val) + inc];
    var stopVal = this.min; // where to stop moving

    newVal = (newVal > this.min ? newVal < this.max ? newVal : this.max : this.min);
    // move the handle one jump increment toward the stopVal
    // If value is less than stopVal, set at stopVal instead
    this.positionHandle($handle, newVal);
};

/**
 * finds the closes value in the array.
 * @param {object} num - the value to search for.
 * @param {array} arr - the array to search in.
 * @return the value in the array that is closes to num.
 */
TimeSlider.prototype._closest = function (num, arr) {
    var curr = arr[0];
    var diff = Math.abs(num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs(num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
    }
    return curr;
};

/**
 * Add time to date.
 * @param {Date} date - the date to add to.
 * @param {int} time - the time to add, this is an integer value of seconds.
 *                    e.g. Date.getTime();
 * @return {Date} a new instance of time.
 */
TimeSlider.prototype._addTime = function (date, time) {
    var d = new Date();
    d.setTime(date.getTime() + time);
    return d;
};


/**
 * object to contain key code values for the application
 */
function keyCodes() {
    // Define values for keycodes
    this.backspace = 8;
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

}