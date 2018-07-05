var TemporalSliderVM = function (container) {
    var self = this;
    self.closed = ko.observable(true);

    self.layers = ko.observableArray([]);
    self.isPlaying = ko.observable(false);;
    self.range = 0;
    self.position = 0;
    self.layersUpdated = ko.observable(0);
    self.playButton = null;

    self.min = +(new Date(2009,0,1));
    self.max = Date.now();

    var start = new Date();
    start.setMonth(start.getMonth() - 3);
    self.dates = ko.observable([+start, self.max]);
    self.dateRange = ko.pureComputed({
        read: function(){
            return this.dates();
        },
        write: function(value){
            var dates = [value[0], value[1]];
            dates.forEach(function(date, i){
                if(typeof date == "string"){
                    dates[i] = date.replace(' ','T');
                }
            });
            dates[0] = dates[0] ? +(new Date(dates[0])) : this.min;
            dates[1] = dates[1] ? +(new Date(dates[1])) : this.max;
            this.dates(dates);
        },
        owner: self
    });

    var months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    self.dateRangeLabel = ko.computed(function(){
        return self.dateRange()
            .map(function(d){
                var date = new Date(d);
                if(dateIsEqual(date, Date.now())) {
                    return 'present';
                }
                return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
            })
            .join(' - ');
    });

    self.onDateChange = function (from, to) {
        if (!from && !to) {
            return;
        }

        self.layers().forEach(function (layer) {
            if (layer.isVisible()) {
                layer.setDateRange(from, to);
            }
        });

        self.dateRange([from,to]);
    };
    self.progressSlider = function () {
        if (self.position >= self.chart.xAxis[0].dataMax) {
            if (self.isPlaying()) {
                self.isPlaying(false);
                self.chart.rangeSelector.buttons[4].textSetter('Play');
                if (self.onComplete) {
                    self.onComplete();
                    self.onTick = null;
                    self.onComplete = null;
                }
            }
            return;
        }
        var newMax = Math.min(self.position + self.range, self.chart.xAxis[0].dataMax);
        self.dateRange([self.position, self.position = newMax]);

        self.layersUpdated(0);
    };


    self.recordStart = null;
    self.onTick = null;
    self.onComplete = null;
    self.step = 0;
    self.progressPercent = function(){
        var totalRange = self.chart.xAxis[0].dataMax - self.recordStart;
        var steps = (totalRange / self.range)-1;
        var extremes = self.chart.xAxis[0].getExtremes();
        var range = extremes.max - extremes.min;
        var position = extremes.min ;

        return {
            pc: Math.min(1,(self.step++ * 1.00 / steps)),
            txt: Highcharts.dateFormat('%Y-%m-%d', position)+' - '+Highcharts.dateFormat( '%Y-%m-%d', self.chart.xAxis[0].dataMax? Math.min(position + range,self.chart.xAxis[0].dataMax):position + range  )
        };
    };
    self.record = function (onTick, onComplete) {
        var extremes = self.chart.xAxis[0].getExtremes();
        self.range = extremes.max - extremes.min;
        self.position = extremes.min;

        self.recordStart = self.position;
        self.step = 0;
        self.onTick = onTick;
        self.onComplete = onComplete;
        onTick(self.progressPercent(),function(){
            if(self.position + self.range >= self.chart.xAxis[0].dataMax){
                self.onComplete();
            }else{
                self.play();
            }
        });
    };
    self.playWarning = false;
    self.play = function () {
        self.playButton = self.chart.rangeSelector.buttons[4];
        if (self.isPlaying()) {
            self.isPlaying(false);
            self.playButton.textSetter('Play');
            self.playButton.element.removeAttributeNS('http://www.w3.org/2000/svg','data-play');
            return false;
        }
        var extremes = self.chart.xAxis[0].getExtremes();

        if (extremes.max >= self.chart.xAxis[0].dataMax) {
            self.playWarning = false;
            var warning = $(self.playButton.element).webuiPopover({
                title: 'Date selector at maximum position',
                content: '<p style="float:left;width:330px;">The date selector is already at it\'s maximum value. Please move the slider to an earlier starting position</p><svg xmlns="http://www.w3.org/2000/svg" style="height:103px;width:117px;float: right;"><path fill="none" stroke="#7cb5ec" d="M0 30.4L2.3 25H7c4.5 0 7 4.4 11.4 4.4S25.2 26 29.8 26c4.6 0 7 6 11.5 6 4.6 0 7-1 11.5-1.3 4.6-.5 7-.7 11.5-.7 4.6 0 7 1.6 11.5 1.6 4.6 0 7-3.4 11.5-3.4" stroke-linecap="round" stroke-linejoin="round" class="highcharts-graph"></path><path fill="rgba(102,133,194,0.3)" d="M75 1h15v70H75z"></path><path fill="#2CA2DC" stroke="#fff" d="M89 1v70h20V1zm12.5 32l3 3-3 3zm-5 0v6l-3-3zM59 1v70h20V1zm12.5 32l3 3-3 3zm-5 0v6l-3-3z"></path><path fill="#f2f2f2" stroke="#f2f2f2" d="M0 69.5h110v14H0z"></path><path fill="#ccc" stroke="#ccc" d="M62 69.5h37v14H62z"></path><path fill="none" stroke="#333" d="M77 74v5.8m3-5.8v5.8m3-5.8v5.8"></path><rect width="14" height="14" x="99.5" y="69.5" fill="#e6e6e6" stroke="#ccc" rx="0" ry="0"></rect><path fill="#333" d="M105 73.5v6l3-3"></path><path fill="none" stroke="red" stroke-width="5" d="M57 56.5l-25 20 25 20v-10h40v-20H57v-10z" stroke-linejoin="round"></path></svg>',
                trigger: 'manual',
                width: 500
            });

            warning.webuiPopover('show');
            function hideWarning() {
                self.playWarning.webuiPopover('hide');
                self.playWarning.webuiPopover('destroy');
                self.playWarning = false;
                $(document)
                    .off('click.webui.popover touchend.webui.popover')
                    .off('keyup.webui.popover');
            }
            window.setTimeout(function () {
                $(document)
                    .off('keyup.webui.popover')
                    .on('keyup.webui.popover', function (e) {
                        if (!self.playWarning) return;
                        if (e.keyCode === 27) {
                            hideWarning();
                        }
                    })
                    .off('click.webui.popover touchend.webui.popover')
                    .on('click.webui.popover touchend.webui.popover', function () {
                        if (!self.playWarning) return;
                        hideWarning();
                    });
                self.playWarning = warning;
            }, 1);
            return false;
        }

        self.range = extremes.max - extremes.min;
        self.position = extremes.min + self.range;
        self.playButton.textSetter('Pause');
        self.playButton.element.setAttributeNS('http://www.w3.org/2000/svg','data-play','true');
        self.isPlaying(true);// = setInterval(play, 6000);
        self.progressSlider();
        return false;
    };

    self.addLayer = function (mapLayer) {
        if (!mapLayer.search || !mapLayer.options.temporal) { return; }
        var newLayer = new TemporalSliderSeriesVM(mapLayer);
        self.layers.push(newLayer);
        newLayer.isVisible.subscribe(function (visible) {
            if (visible) {
                newLayer.series = self.chart.addSeries({
                    name: newLayer.name,
                    data: newLayer.data()
                });
            } else {
                newLayer.series.remove();
            }

            self.closed(self.layers().filter(function (l) { return l.isVisible(); }).length == 0);
        });
        newLayer.data.subscribe(function (newData) {
            if (newLayer.series) {
                newLayer.series.setData(newData);
            }
        });
        newLayer.setDateFacetWatch(function (data) {
            var date = newLayer.getDateRange();
            self.dateRange(date);
            self.layersUpdated(self.layersUpdated() + 1);
        });
    };

    self.updateData = function () {
        self.layers().forEach(function (layer) { layer.getData(); });
    };
    function dateIsEqual(date1, date2){
        return (new Date(date1)).setHours(0,0,0,0) === (new Date(date2)).setHours(0,0,0,0)
    }
    self.dateRange.subscribe(function(dates){
        var layers = self.layers().forEach(function(layer){
            if (!layer.isVisible()) {
                return;
            }
            var xAxis = layer.series.xAxis
            dates = dates.map(function (date) {
                if (!date) return date;
                if(typeof date == "string"){
                    date = date.replace(' ','T');
                }
                return DateUTC(date);
            });
            
            dates[0] = dates[0] || xAxis.dataMin;
            dates[1] = dates[1] || xAxis.dataMax;

            if (dates[0] === xAxis.userMin && dates[1] === xAxis.userMax) {
                return;
            }

            xAxis.setExtremes(
                dates[0],
                dates[1],
                true, true, {trigger:'facet'}
                );
        })
    });

    createHandles();
    Highcharts.setOptions({
        global: { useUTC: true },
        lang: {
            rangeSelectorZoom: '',
            noData: "Time slider data is loading"
        }
    });
    self.chart = Highcharts.StockChart({
        navigator: {
            height: container.clientHeight - 15 - 45,
            handles: {
                symbols: ['doublearrow', 'doublearrow'],
                lineWidth: 1,
                width: 10,
                height: 70,
                backgroundColor: '#2CA2DC',
                borderColor: '#fff'
            }
        },
        chart: {
            spacingLeft: 1,
            spacingBottom: 1,
            spacingRight: 1,
            renderTo: container,
            height: container.clientHeight
        },
        xAxis: {
            visible: false,
            minRange: 24 * 3600000,
            min: Date.UTC(2009, 0, 1),
            max: DateUTC(),
            events: {
                afterSetExtremes: _.debounce(function (e) {
                    self.onDateChange(Highcharts.dateFormat('%Y-%m-%d', e.min), Highcharts.dateFormat('%Y-%m-%d', e.max));
                }, 500)
            }
        },
        rangeSelector: {
            selected: 3,
            buttons: [{
                type: 'ytd',
                text: 'Last day',
                offsetMin: getOffset({ day: 1 })
            }, {
                type: 'ytd',
                text: 'Last week',
                offsetMin: getOffset({ day: 7 })
            }, {
                type: 'ytd',
                text: 'Last month',
                offsetMin: getOffset({ month: 1 })
            }, {
                type: 'ytd',
                text: 'Last 3 months',
                offsetMin: getOffset({ month: 3 })
            }, {
                text: 'Play',
                events: {
                    click: self.play
                }
            }],
            //inputEnabled: false
            buttonTheme: { // styles for the buttons
                width: 90,
                fill: '#FFF',
                stroke: '#CCC',
                'stroke-width': 1,
                padding: 5,
                r: 3,
                style: {
                    color: '#333'
                },
                states: {
                    hover: {
                    },
                    select: {
                        fill: '#2CA2DC',
                        stroke: '#008cc2',
                        style: {
                            color: '#fff'
                        }
                    }
                    // disabled: { ... }
                }
            },
            inputBoxBorderColor: 'gray',
            inputBoxWidth: 120,
            inputBoxHeight: 18,
            inputStyle: {
                color: '#333'
            },
            labelStyle: {
                color: '#333'
            },
        },
        navigation: { buttonOptions: { enabled: false } },
        tooltip: { enabled: false },
        credits: { enabled: false },
        yAxis: { visible: false },
        plotOptions: {
            series: {
                className: 'hidden',
                compare: 'percent',
                showInNavigator: true
            }
        },
        series: []
    });

    self.layersUpdated.subscribe(function (layers) {
        if (!self.isPlaying()) return;
        if (layers != self.layers().filter(function (l) { return l.isVisible(); }).length) return;
        
        if (self.onTick) {
            self.onTick(self.progressPercent(), self.progressSlider.bind(self));
        } else {
            window.setTimeout(function(){
                self.progressSlider();
            }, 2000);
        }
    });

    function getOffset(offset) {
        offset = offset || {};
        var now = new Date();
        var janFirst = new Date(now.getFullYear(), 0, 1);
        if (offset.day) {
            now.setDate(now.getDate() - offset.day);
        }
        if (offset.month) {
            now.setMonth(now.getMonth() - offset.month);
        }
        return now.getTime() - janFirst.getTime();
    }

    function createHandles() {
        if (Highcharts.SVGRenderer.prototype.symbols.doublearrow) {
            return;
        }
        // Define a custom symbol path
        var size = 3;
        Highcharts.SVGRenderer.prototype.symbols.doublearrow = function (x, y, w, h) {
            return [
                // box
                'M', x - w / 2, y,
                'v', h,
                'h', 2 * w,
                'v', -h,
                'z',
                // right arrow
                'M', x + w / 2 + w / 4, y + h / 2 - size,
                'l', size, size, -size, size,
                'Z',
                // left arrow
                'M', x + w / 2 - w / 4, y + h / 2 - size,
                'l', 0, size * 2, -size, -size,
                'Z'
            ];
        };
        if (Highcharts.VMLRenderer) {
            Highcharts.VMLRenderer.prototype.symbols.doublearrow = Highcharts.SVGRenderer.prototype.symbols.doublearrow;
        }
    }
};

var TemporalSliderSeriesVM = function (layer) {
    var self = this;
    self.mapLayer = layer;
    self.dateRange = ko.observableArray([]);
    self.isVisible = ko.computed(function () {
        return self.mapLayer.isVisible();
    });

    self.data = ko.observable([]);
    self.name = self.mapLayer.id;
    self.series;
    self._lastQuery = null;
    self._datefacet = null;
    self.dateFacet = function () {
        if (self._datefacet) return self._datefacet;
        var panelgroups = self.mapLayer.facets.facetPanels();
        for (var i = 0; i < panelgroups.length; i++) {
            var panels = panelgroups[i].facets();
            for (var j = 0; j < panels.length; j++) {
                if (panels[j].facetKey === self.mapLayer.options.temporal) {
                    self._datefacet = panels[j].children()[0];
                    return self._datefacet;
                }
            }
        }
        return null;
    };

    self.setDateFacetWatch = function (callback) {
        self.mapLayer.search.registerFinishedCallback(callback);
    };

    self.getData = function () {
        var facets = self.mapLayer.facets.getFacetsFromSearch();
        if (facets[self.mapLayer.options.temporal]) delete facets[self.mapLayer.options.temporal];
        if (facets["latlongs"]) delete facets["latlongs"];
        var query = self.mapLayer.search.calculateQueryString({ f: self.mapLayer.facets.encodeFacets(facets) });
        if (self._lastQuery === query) return;
        self._lastQuery = query;
        var url = "/Map/Temporal?" + query;
        $.get2(url, function (result) {
            var data = result.Data.sort(function (a, b) { return a[0] - b[0]; });
            self.data(data);
        });
    };

    self.mapLayer.temporalSlider = self;

    self.getDateRange = function () {
        var date = self.mapLayer.facets.getFacetValues(self.mapLayer.options.temporal)[0];
        if (!date || date === '::') return ['', ''];;
        var dates = decodeURIComponent(date).split('::');

        return dates
    };

    self.setDateRange = function (from, to) {
        if (!self.dateFacet()) return;
        from = (from || '').split(' ')[0];
        to = (to || '').split(' ')[0];
        var dates = self.getDateRange();
        if (from === dates[0] && to === (dates[1] || Highcharts.dateFormat('%Y-%m-%d', Date.now()))) return;
        var facet = from + '::' + to;
        self.dateFacet().selectedLowerValue(from);
        self.dateFacet().selectedUpperValue(to);
        self.dateFacet().updateApplyButton();
        self.mapLayer.facets.applyFacets();
    };
};

function DateUTC(date) {
    var d = date ? new Date(date) : new Date();
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}