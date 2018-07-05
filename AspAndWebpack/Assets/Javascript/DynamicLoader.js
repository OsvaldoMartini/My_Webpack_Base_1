
/**
 * An javascript object designed to allow us to easily load javascript onto the page in a dynamic fashion.
 */
var DynamicLoader = function () {

    // document.getElementsByTagName
    //$("script[src*='" + '/Assets/Javascript/BrightCoveVideoService.js' + "'").size();
}	


/**
 * Attempt to dynamically load the resource found at the supplied url.
 * If the resource is found and can be loaded the caller can chain the promised success method.
 * If the resource can not be loaded the fail method can be chained.
 * @param {string} url - The url of the Javascript to load.
 */
DynamicLoader.prototype.loadScript = function loadScript(url) {
	
	var self = this;
	var operation = new this.Operation();

    var script = document.createElement("script");
	script.type = "text/javascript";

	if (script.readyState){  //IE
	    self.loadIE(script, operation);
	} else {  //Others
		self.loadOther(script, operation);
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
	
	return operation;
};

/**
 * Older ersions of IE need there own implementation as the standard way of working out if
 * the script has loaded does not work.
 */
DynamicLoader.prototype.loadIE = function(script, operation) {
	script.onreadystatechange = function(){
	    if (script.readyState === "loaded" || script.readyState === "complete") {
			script.onreadystatechange = null;
			operation.succeeded(script);
		}
	};

	//var millisecondsToWait = 15000;
	//setTimeout(function () {
	//    script.onreadystatechange = null;
	//    operation.failed("Failed");
	//}, millisecondsToWait);
};

/**
 * Standard version associates the loading of the resource with the operation functions
 * @param {object} script - The script to test whether it is loaded (or not)
 * @param {objecy} operation - The operation to associate events with 
 */
DynamicLoader.prototype.loadOther = function (script, operation) {
	script.onload = function(){
		operation.succeeded(script);
		
	};
	script.onerror = function (data) {
		operation.failed(data);
	}
};

/**
 * Operation type object, uses to support the 'promise' behaviour of the DynamicLoader
 */
DynamicLoader.prototype.Operation = function () {
	var operation = {
		successReactions: [],
		errorReactions: []
	};
	
	operation.success = function (success) {
		operation.successReactions.push(success || function() { console.log("Default success called")});
		return operation;
	}

	operation.fail = function (fail) {
		operation.errorReactions.push(fail || function() { console.log("Default Fail Called")});
		return operation;
	}
	
	operation.succeeded = function (script) {
	    for (var c = 0; c < operation.successReactions.length; c++) {
	        operation.successReactions[c](script);
	    }
	}
	
	operation.failed = function (message) {
        for (var c = 0; c < operation.errorReactions.length; c++) {
	        operation.errorReactions[c](message);
	    }
	}
	
	return operation;
};
