
console.log('main');
//import './content/lib/jquery';
//import ko from './content/lib/knockout';

class AppViewModel {
    constructor() {
        this.chosenSector = ko.observable('all');
        this.monthsData = ko.observable();

        ko.computed(() => this.refreshData());
    }

    refreshData() {
        var sector = this.chosenSector();
        var url = 'http://www.wservices.co.uk/services/GeoService.svc/Backend/${sector}.json';
        
        console.log('refreshData');

        fetch(url)
            .then(response => response.json())
            .then(json => this.monthsData(json.months));
    }
}