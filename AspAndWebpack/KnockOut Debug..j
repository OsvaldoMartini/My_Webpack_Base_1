grid gridJMF
chartContextMenu
data-bind="visible: gridChartVM.viewGrid"
visible: gridChartVM.viewingChartContextMenu, with: gridChartVM
chartDiv  ui-resizable


"/{categoryKey}/Activity/{event}/{level}?message={message}"

FacetsSearcher
addChartPanelVisible

ko.dataFor($0)
ko.contextFor($0)


	@*<ul data-bind="debug: $data">*@
        

ko.bindingHandlers.debugLog =
    {
        init: function (element, valueAccessor) {
            console.log('Knockoutbinding:');
            console.log(element);
            console.log(ko.toJS(valueAccessor()));
        }
    };

	
	
	
 <div id="wrapper">
        <ul data-bind="debug: $data">

            simple:
            <input data-bind="value: simpleObject, valueUpdate: 'afterkeydown'" />
            <span id="simpleSubscribtionFeedback" data-update="chartTable"></span>

            <hr />
            <div data-bind="with: complexObject">
                company: <input data-bind="value: company, valueUpdate: 'afterkeydown'" /><br />
                email: <input data-bind="value: email, valueUpdate: 'afterkeydown'" />
                <span id="complexSubscribtionFeedback"></span>
            </div>
        </ul>
    </div>



	@*<input data-bind="blah: console.log($data), value: description" />*@
	@*<pre data-bind="text: ko.computed(function() { debugger; })"></pre>*@
	@*<pre data-bind="text: ko.toJSON($data, null, 2)"></pre>*@
	@*<ul data-bind="debug: $data">*@
	<!-- ko if: true -->
		<div class='u-overflow-auto u-font-85' data-bind="css:{hidden:$data.chartDataTable() == false},attr:{id:$data.chart.chartdivId + 'DataTable'}"></div>
	<!-- /ko -->

	
	

var ns = ns || {};

ns.ComplexObj = function (item) {
    var self = this;

    if (!item) {
        item = {};
    }

    self.id = item.Id || '';
    self.company = ko.observable(item.Company || '');
    self.email = ko.observable(item.Email || '');
    self.visible = ko.observable(true);

    self.company.subscribe(function () {
        console.log('debug: company changed');
    });

    self.email.subscribe(function () {
        console.log('debug: email changed');
    });

    return self;
};

//ViewModel em Main ou CommandsVMs.js

ns.mainvm = function () {
    var simpleObject = ko.observable(true);
    simpleObject.subscribe(function (newValue) {
        $("#debugCollection").attr("hidden", "hidden");
    });

    var complexObject = ko.observable(ns.ComplexObj());
    complexObject.subscribe(function (newValue) {
        // i would like to react to any change in complex object
        document.getElementById('complexSubscribtionFeedback').innerText = 'i dont get executed :(';
    });

    return {
        simpleObject: simpleObject,
        complexObject: complexObject
    };
};

var containerGridTableChart = document.getElementById('wrapper');
if (containerGridTableChart) {
    ko.applyBindings(ns.mainvm, containerGridTableChart);
} else {
    console.warn("container for binding ko not found");
}

function removeElement(elementClass) {
    // Removes an element from the document
    var element = document.getElementsByClassName(elementClass)[0];
    //var elemParent = element.parentNode;
    //if (elemParent)
    //    elemParent.removeChild(element);
}
	
              
https://knockoutjs.com/examples/contactsEditor.html
https://knockoutjs.com/documentation/plugins-mapping.html
https://stackoverflow.com/questions/16946130/how-do-i-call-a-function-in-a-viewmodel-knockout
http://jsfiddle.net/xcajt4qn/86/
https://knockoutjs.com/documentation/binding-context.html
https://stackoverflow.com/questions/7084557/javascript-select-all-elements-with-data-attribute-without-jquery
https://stackoverflow.com/questions/11553999/how-to-template-if-else-structures-in-data-bound-views
https://www.w3schools.com/js/js_htmldom_eventlistener.asp
https://stackoverflow.com/questions/34896106/attach-event-to-dynamic-elements-in-javascript			  