console.log('main');
import $ from './content/lib/jquery.js';
import * as jQuery from './content/lib/jquery.js';
import ko from './content/lib/knockout.js';

//import * as knockout from './content/lib/knockout.js';

//import jQuery from "./content/lib/jquery.js";
//window.$ = window.jQuery = jQuery;

class AppViewModel {
    constructor() {
        this.chosenSector = ko.observable('all');
        this.monthsData = ko.observable();
        console.log('refreshData');

        ko.computed(() => this.refreshData());
    }

    refreshData() {
        var sector = this.chosenSector();
        var url = 'http://www.wservices.co.uk/services/GeoService.svc/Backend/${sector}';
        
        console.log('refreshData');

        fetch(url)
            .then(response => response.json())
            .then(json => this.monthsData(json.months));
    }
}