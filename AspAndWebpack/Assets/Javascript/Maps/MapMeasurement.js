function MapMeasurement(map) {
    var self = this;

    // Local Data
    var Measurement;
    var measurement = null;
    var Units;
    var closing = false;
    var menu = $('#measureMenu');
    var menuBtn = menu.find('.dropdown-toggle').eq(0);
    var esriContainer = $('#measurementDiv', menu);
    var unitSelector = $('#unitSelector');
    var unitDictionary = {};

    // Dynamic Data
    self.activeTool = ko.observable();
    self.units = ko.observableArray();
    self.unit = ko.observable();
    self.measurementValue = ko.observable();
    self.location = {
        mouseLat: ko.observable('---'),
        mouseLon: ko.observable('---'),
        markerLat: ko.observable('---'),
        markerLon: ko.observable('---')
    };

    // Private methods
    function loadToolbar() {
        require([
            "esri/dijit/Measurement",
            "esri/units"
        ], function (
            _Measurement,
            _units
        ) {
            Measurement = _Measurement;
            Units = _units;
        });
    }

    // Store the units for the given tool
    function loadUnits(e) {

        var units = e.target['_' + e.toolName + 'UnitStrings'];
        if (e.toolName === 'location') {
            units = units.slice(0, 2);
        }

        self.units(units);
        self.unit(e.unitName);
    }

    // Store a dictionary to get the unit name from the unit title
    function setUnitDictionary() {
        var strings = measurement._unitStrings;
        unitDictionary = {};
        Object.keys(strings).forEach(function (n) {
            unitDictionary[strings[n]] = n;
        });
    }

    // Reset the location values.
    function reset() {
        self.location.mouseLat('---');
        self.location.mouseLon('---');
        self.location.markerLat('---');
        self.location.markerLon('---');
        self.measurementValue('');
        measurement.clearResult();
    }


    // Initialise the measureing tool
    function initialiseMeasuring() {
        if (measurement) {
            return;
        }

        measurement = new Measurement({
            map: map,
            defaultAreaUnit: Units.SQUARE_KILOMETERS,
            defaultLengthUnit: Units.KILOMETERS
        }, esriContainer[0]);
        measurement.startup();

        measurement.on('tool-change', function (e) {
            if (!e.toolName) {
                return;
            }

            map.setMapCursor("default");
            loadUnits(e);
        });

        measurement.on('measure', function (e) {
            self.measurementValue(e.values);
        });

        measurement.on('measure-end', function (e) {
            self.measurementValue(e.values);

            if (e.toolName === 'location') {
                self.location.markerLat(e.values[1]);
                self.location.markerLon(e.values[0]);
            }
        });

        setUnitDictionary();

        var _updateMouseLocation = measurement._updateMouseLocation;
        measurement._updateMouseLocation = function (lon, lat) {
            self.location.mouseLat(lat);
            self.location.mouseLon(lon);
            _updateMouseLocation.call(measurement, lon, lat);
        };
    }

    if (map.loaded) {
        loadToolbar();
    } else {
        map.on('load', loadToolbar);
    }

    // Interactions

    // popup Events
    menuBtn.on('click', function () {
        closing = true;
    });
    menu.on('show.bs.dropdown', function () {
        closing = false;
        initialiseMeasuring();
        map.emit('measure-start');
    });
    menu.on('hide.bs.dropdown', function (e) {
        if (!closing) {
            e.preventDefault();
            return false;
        }
    });
    menu.on('hidden.bs.dropdown', function () {
        closing = false;
        reset();
        if (self.activeTool()) {
            measurement.setTool(self.activeTool(), false);
        }

        map.emit('measure-end');
    });

    // subscriptions
    self.activeTool.subscribe(function (tool) {
        reset();
        measurement.setTool(tool, true);
    });
    self.units.subscribe(function () {
        unitSelector.trigger("chosen:updated");
    });
    self.unit.subscribe(function (unit) {
        if (!unit) {
            return;
        }
        var unitName = unitDictionary[unit];
        if (self.activeTool() === 'location') {
            measurement._switchLocationUnit(unitName);
        } else {
            measurement._switchUnit(unitName);
        }
    });

    // Computed
    self.measurementText = ko.computed(function () {
        var val = self.measurementValue();
        if (!val) {
            return '';
        }

        if (self.activeTool() === 'location') {
            return val[1] + ', ' + val[0];
        }

        var format = esri.numberUtils.format;

        if (val > 1E6) {
            val = format(val.toPrecision(9), {
                pattern: measurement.numberPattern
            });
        } else if (val < 10) {
            val = format(val.toFixed(2), {
                pattern: measurement.numberPattern + '0'
            });
        } else {
            val = format(val.toFixed(2), {
                pattern: measurement.numberPattern
            });
        }

        return val + ' ' + self.unit();
    });

    // Public methods
    self.close = function () {
        closing = true;
        menuBtn.dropdown('toggle');
    };
    self.copyValue = function () {
        window.copyTextToClipboard(self.measurementText());
    };

}