/****************************************************************/
/**   A collection of extension methods and 
/**           utilities for javascript
/****************************************************************/


/************************* STRING *************************/

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.isNullOrEmpty = function () {
    return this === undefined || this === null || this.length < 1;
};

String.prototype.isNullOrWhiteSpace = function () {
    var whiteSpaceMatches = this.match(/^\s*$/);
    return this.isNullOrEmpty() || whiteSpaceMatches !== null && whiteSpaceMatches.length > 0;
};

/************************* ARRAY *************************/

Array.prototype.removeInstance = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
