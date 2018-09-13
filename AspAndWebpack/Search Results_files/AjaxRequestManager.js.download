/**
* A manager to hold a reference to all active AJAX requests.
*/
var AjaxRequestManager = function() {

};

/**
* A collection of all AJAX requests.
*/
AjaxRequestManager.requests = [];

AjaxRequestManager.abortAll = function () {
    while (AjaxRequestManager.requests.length) {//  cycle through list of recorded connection
        AjaxRequestManager.requests[0].abort(); //  aborts connection
        AjaxRequestManager.requests.splice(0, 1); //  removes from list by index
    }
};

$(document).ready(function () {
    $.ajaxSetup({
        cache: false,
        beforeSend: function(jqXHR) {
            //  annd connection to list
            AjaxRequestManager.requests.push(jqXHR);
            //console.log("Added: " + jqXHR);
        },
        complete: function(jqXHR) {
            var i = AjaxRequestManager.requests.indexOf(jqXHR); //  get index for current connection completed
            if (i > -1) {
                //  removes from list by index
                AjaxRequestManager.requests.splice(i, 1);
            }
        }
    });

    $(window).on('beforeunload', function (e) {
        AjaxRequestManager.abortAll();
    });
});