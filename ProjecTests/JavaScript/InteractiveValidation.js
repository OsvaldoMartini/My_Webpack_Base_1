// used to revert invalid entry to previous valid entry
var oldValue;

// ensures an object value is a number within a given range
// and that it is thousands formatted if required
// sets the value to zero if not
function validateAndFormatThousands(obj, minRangeValue, maxRangeValue) {
    if (isValidNumberRange(obj, minRangeValue, maxRangeValue)) {
        applyThousandsFormat(obj);
    }
    else {
        obj.value = obj.defaultValue;
    }
}

// ensures an object value is a number within a given range
// or does not allow the key press to be registered
function validateNumberRange(obj, minRangeValue, maxRangeValue) {
    if (isValidNumberRange(obj, minRangeValue, maxRangeValue)) {
        oldValue = obj.value;
    }
    else {
        obj.value = oldValue;
    }
}

// checks if an object value is a number within a given range
function isValidNumberRange(obj, minRangeValue, maxRangeValue) {
    if (isNaN(obj.value) || (parseInt(obj.value) > parseInt(maxRangeValue)) || (parseInt(obj.value) < minRangeValue)) {
        return false;
    }
    else {
        return true;
    }
}

// removes the thousand separator from an object value
function stripThousandsFormat(obj) {
    obj.value = obj.value.replace(/,/g, '');
    oldValue = obj.value;
    obj.select();
}

// creates thousand separators in an object value
function applyThousandsFormat(obj) {
    obj.value += '';
    x = obj.value.split('.');
    x1 = x[0];
    x2 = x.length > 1 && x[1].length > 0 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    obj.value = x1 + x2;
}

// determines whether the supplied event key code is a digit
// or other permitted character - tab, del, backspace, left arrow, right arrow
function onlyNumbers(obj, e) {
    var keynum = e.keyCode;

    // allow 0-9, escape, left arrow, right arrow, del, tab, backspace, home, end, numeric keypad: 0-9
    // keynum: 48-57 || 37 || 39 || 46 || 8 || 9 || 36 || 35 || 96 -105
    switch (true) {
        case (keynum >= 8 && keynum <= 9):
        case (keynum >= 35 && keynum <= 37):
        case (keynum == 39):
        case (keynum == 46):
        case (keynum >= 48 && keynum <= 57):
        case (keynum >= 96 && keynum <= 105):
            return true;
            break;

        case (keynum == 27):
            obj.value = obj.defaultValue;
            stripThousandsFormat(obj);

        default:
            return false;
            break;
    }
}

// determines whether the supplied event key code is a digit
// or other permitted character - tab, del, backspace, left arrow, right arrow
function onlyDecimals(obj, e) {
    var keynum = e.keyCode;

    // additionally allow the decimal point (.)
    // otherwise allow numeric keys and control keys
    switch (true) {
        case (keynum == 110):
        case (keynum == 190):
            return obj.value.indexOf(".") == -1; ;
            break;

        default:
            return onlyNumbers(obj, e);
            break;
    }
}

// makes a client side control visible given it's id
function showControl(objName) {
    document.getElementById(objName).style.visibility = "visible";
}

// makes a client side control hidden given it's id
function hideControl(objName) {
    document.getElementById(objName).style.visibility = "hidden";
}