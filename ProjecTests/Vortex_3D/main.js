import $ from './content/lib/jquery';
//import * as jQuery from './content/lib/jquery.js';
import ko from './content/lib/knockout';

//import * as knockout from './content/lib/knockout.js';

//import jQuery from "./content/lib/jquery.js";
//window.$ = window.jQuery = jQuery;

class AppViewModel {
    constructor() {
        this.chosenSector = ko.observable('all');
        this.dataGetter = ko.observable();
        console.log('AppViewModel');

        ko.computed(() => this.refreshData());
    }

    refreshData() {
        var sector = this.chosenSector();
        var url = 'http://www.wservices.co.uk/services/GeoService.svc/Backend/${sector}';
        
        console.log('refreshData');

        fetch(url)
            .then(response => response.json())
            .then(json => this.dataGetter(json.months));
    }
}

$(() => ko.applyBindings(new AppViewModel));

// --------

class salesChart extends HTMLElement{
    createdCallBack(){
        //Could inject some markup from a <template> instead of hardcode
        this.innerHTML = "HELLO THERE";
    }
}

document.registerElement('sales-chart', salesChart);