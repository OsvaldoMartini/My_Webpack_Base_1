function drawChart() {
    var sample_data = document.getElementById('sample_data').value;
    var data2 = eval("["+sample_data+"]");
   
   
    // var data = google.visualization.arrayToDataTable([
    //     ['Year', 'Sales', 'Expenses'],
    //     ['2013',  1000,      400],
    //     ['2014',  1170,      460],
    //     ['2015',  660,       1120],
    //     ['2016',  1030,      540]
    //   ]);

    //   var options = {
    //     title: 'Company Performance',
    //     hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
    //     vAxis: {minValue: 0}
    //   };

    //var data = new google.visualization.arrayToDataTable(data2);
   
    // var options = {
    //     hAxis: {title: 'Age',  minValue: 0,maxValue:105},
    //     vAxis: {title:'Savings', minValue: 0,maxValue:2500000},
    //     width: 960, height: 300,
    //     colors: ['#4a82bd'],
    //     legend:'none'
    // };


    // var data = google.visualization.arrayToDataTable([
    //     ["Element", "Density", { role: "style" } ],
    //     ["Copper", 8.94, "#b87333"],
    //     ["Silver", 10.49, "silver"],
    //     ["Gold", 19.30, "gold"],
    //     ["Platinum", 21.45, "color: #e5e4e2"]
    //   ]);

    //   var view = new google.visualization.DataView(data);
    //   view.setColumns([0, 1,
    //                    { calc: "stringify",
    //                      sourceColumn: 1,
    //                      type: "string",
    //                      role: "annotation" },
    //                    2]);

    //   var options = {
    //     title: "Density of Precious Metals, in g/cm^3",
    //     width: 600,
    //     height: 400,
    //     bar: {groupWidth: "95%"},
    //     legend: { position: "none" },
    //   };


      var data = google.visualization.arrayToDataTable([
        ['City', '2010 Population', '2000 Population'],
        ['New York City, NY', 8175000, 8008000],
        ['Los Angeles, CA', 3792000, 3694000],
        ['Chicago, IL', 2695000, 2896000],
        ['Houston, TX', 2099000, 1953000],
        ['Philadelphia, PA', 1526000, 1517000]
      ]);

      var options = {
        chart: {
          title: 'Population of Largest U.S. Cities'
        },
        hAxis: {
          title: 'Total Population',
          minValue: 0,
        },
        vAxis: {
          title: 'City'
        },
        bars: 'vertical'
      };

    //var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    var chart = new google.charts.Bar(document.getElementById('chart_div'));
    chart.draw(data, options);

}


//google.load("visualization", "1", {packages:["corechart"]});
google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawChart);


function buffer(){
    setTimeout(function () {drawChart();}, 100);
}


function ViewModel() {
    var self =this;
    self.rangeSelect = ko.observable('all');

    self.companySalesList = ko.observableArray();

    self.dataGetter = ko.computed(function(){
        var range = self.rangeSelect();

        var preUrl = 'http://wservices.co.uk/services/GeoService.svc/Backend/' + range;
        console.log(preUrl);
        var data;
        
            // $.ajax({
            //     type: 'GET',   
            //     url: preUrl,
            //     contentType: "application/json; charset=utf-8",
            //     dataType: "jsonp",
            //     success: function(data) {
            //         //var observableData = JSON.parse(data);
            //         var observableData = ko.mapping.fromJS(data.BackendResult);
            //         var array = observableData();
            //         self.companySalesList(array);
            //     },
            //     error:function(jq, st, error){
            //         alert(error);
            //     }
            // });
   
            var listSales = [];
            
            $.ajax({
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                url: preUrl,//'http:www.svc/Service1.svc/GetJson',
                //data: "{ }",
                processData: false,
                dataType: "jsonp",               
                success: function (data) {                    
                    var result = data.BackendResult;

                    result.forEach(function(item, index, array) {
                        var salesObj = {};
                        salesObj['OrderId'] = item.CompanySalesID;
                        salesObj['SalesType'] = item.TCompany.CompanyType;
                        salesObj['SalesMonth'] = item.Month;
                        salesObj['SalesValue'] =item.Sales;
                        salesObj['SalesYear'] = item.Year;
                        listSales.push(salesObj);
                      });

                    //   listSales.forEach(function(item, index, array) {
                    //     console.log(item, index);
                    // });

                    self.companySalesList(listSales);
                },
                error: function (xhr) {
                    alert(xhr.responseText);
                }
            });

           
            // $.getJSON(preUrl, function(data) { 
            //     // Now use this data to update your view models, 
            //     // and Knockout will update your UI automatically 
            //                 var observableData = ko.mapping.fromJS(data);
            //                 var array = observableData();
            //                 self.companySalesList(array);
            // })


        if(range=='all'){
            return "['Age','Savings'],"+
                       "[25,0],"+
                       "[26,2738],"+
                       "[27,5834],"+
                       "[28,9278],"+
                       "[29,13191],"+
                       "[30,17592],"+
                       "[31,22288],"+
                       "[32,27418],"+
                       "[33,32993],"+
                       "[34,38954],"+
                       "[35,45304],"+
                       "[36,52127],"+
                       "[37,59254],"+
                       "[38,66663],"+
                       "[39,74535],"+
                       "[40,83148],"+
                       "[41,91537],"+
                       "[42,100823],"+
                       "[43,110002],"+
                       "[44,119837],"+
                       "[45,129897],"+
                       "[46,141052],"+
                       "[47,152166],"+
                       "[48,163757],"+
                       "[49,175561],"+
                       "[50,188520],"+
                       "[51,200952],"+
                       "[52,214325],"+
                       "[53,228245],"+
                       "[54,243532],"+
                       "[55,259149],"+
                       "[56,274371],"+
                       "[57,290571],"+
                       "[58,307564],"+
                       "[59,322976],"+
                       "[60,340957],"+
                       "[61,358337],"+
                       "[62,375345],"+
                       "[63,392495],"+
                       "[64,410609],"+
                       "[65,428638],"+
                       "[66,400252],"+
                       "[67,370044],"+
                       "[68,340162],"+
                       "[69,306514],"+
                       "[70,274417],"+
                       "[71,239492],"+
                       "[72,205637],"+
                       "[73,169858],"+
                       "[74,133103],"+
                       "[75,97019],"+
                       "[76,58116],"+
                       "[77,19529],"+
                       "[78,0],"+
                       "[79,0],"+
                       "[80,0],"+
                       "[81,0],"+
                       "[82,0],"+
                       "[83,0],"+
                       "[84,0],"+
                       "[85,0],"+
                       "[86,0],"+
                       "[87,0],"+
                       "[88,0],"+
                       "[89,0]";

        }

        if(range=='aero'){
            return "['Age','Savings'],"+
                "[25,0],"+
                "[26,2763],"+
                "[27,5903],"+
                "[28,9425],"+
                "[28,13446],"+
                "[30,17979],"+
                "[31,22878],"+
                "[32,28219],"+
                "[33,34039],"+
                "[34,40228],"+
                "[35,46859],"+
                "[36,54017],"+
                "[37,61553],"+
                "[38,69396],"+
                "[39,77845],"+
                "[40,86793],"+
                "[41,95891],"+
                "[42,105723],"+
                "[43,115624],"+
                "[44,126388],"+
                "[45,137413],"+
                "[46,149463],"+
                "[47,161610],"+
                "[48,174637],"+
                "[49,188323],"+
                "[50,201752],"+
                "[51,216495],"+
                "[52,232232],"+
                "[53,249291],"+
                "[54,266171],"+
                "[55,284657],"+
                "[56,303552],"+
                "[57,322324],"+
                "[58,342561],"+
                "[59,360749],"+
                "[60,384075],"+
                "[61,407563],"+
                "[62,430104],"+
                "[63,452547],"+
                "[64,478876],"+
                "[65,502663],"+
                "[66,482031],"+
                "[67,460505],"+
                "[68,436020],"+
                "[69,410875],"+
                "[70,385525],"+
                "[71,357512],"+
                "[72,331003],"+
                "[73,302766],"+
                "[74,270112],"+
                "[75,239441],"+
                "[76,204458],"+
                "[77,170147],"+
                "[78,135332],"+
                "[79,99096],"+
                "[80,60097],"+
                "[81,20800],"+
                "[82,0],"+
                "[83,0],"+
                "[84,0],"+
                "[85,0],"+
                "[86,0],"+
                "[87,0],"+
                "[88,0],"+
                "[89,0]";


        }

        if(range=='toys'){
            return     "['Age','Savings'],"+
                "[25,0],"+
                "[26,2770],"+
                "[27,5923],"+
                "[28,9475],"+
                "[29,13352],"+
                "[30,18098],"+
                "[31,23072],"+
                "[32,28500],"+
                "[33,34380],"+
                "[34,40634],"+
                "[35,47414],"+
                "[36,54661],"+
                "[37,62364],"+
                "[38,70244],"+
                "[39,78957],"+
                "[40,88011],"+
                "[41,97367],"+
                "[42,107449],"+
                "[43,117533],"+
                "[44,128446],"+
                "[45,139854],"+
                "[46,152196],"+
                "[47,164734],"+
                "[48,178446],"+
                "[49,192185],"+
                "[50,206185],"+
                "[51,221798],"+
                "[52,237983],"+
                "[53,256007],"+
                "[54,273350],"+
                "[55,293178],"+
                "[56,312529],"+
                "[57,333228],"+
                "[58,354387],"+
                "[59,374656],"+
                "[60,397386],"+
                "[61,422795],"+
                "[62,447954],"+
                "[63,474574],"+
                "[64,502022],"+
                "[65,528116],"+
                "[66,508208],"+
                "[67,489122],"+
                "[68,469393],"+
                "[69,446790],"+
                "[70,425620],"+
                "[71,399269],"+
                "[72,374341],"+
                "[73,347950],"+
                "[74,320046],"+
                "[75,289477],"+
                "[76,259481],"+
                "[77,226566],"+
                "[78,195239],"+
                "[79,161137],"+
                "[80,124524],"+
                "[81,87936],"+
                "[82,49105],"+
                "[83,9223],"+
                "[84,0],"+
                "[85,0],"+
                "[86,0],"+
                "[87,0],"+
                "[88,0],"+
                "[89,0]";
        }

        if(range=='bags'){
            return     "['Age','Savings'],"+
                "[25,0],"+
                "[26,2777],"+
                "[27,5945],"+
                "[28,9525],"+
                "[29,13621],"+
                "[30,18246],"+
                "[31,23263],"+
                "[32,28752],"+
                "[33,34709],"+
                "[34,41703],"+
                "[35,47927],"+
                "[36,55348],"+
                "[37,63149],"+
                "[38,71133],"+
                "[39,79953],"+
                "[40,89218],"+
                "[41,98820],"+
                "[42,109074],"+
                "[43,119427],"+
                "[44,130599],"+
                "[45,142195],"+
                "[46,154751],"+
                "[47,167842],"+
                "[48,182056],"+
                "[49,195975],"+
                "[50,210944],"+
                "[51,227013],"+
                "[52,243238],"+
                "[53,262412],"+
                "[54,280982],"+
                "[55,301273],"+
                "[56,321808],"+
                "[57,344012],"+
                "[58,365755],"+
                "[59,386597],"+
                "[60,411162],"+
                "[61,438555],"+
                "[62,463823],"+
                "[63,494641],"+
                "[64,523299],"+
                "[65,551297],"+
                "[66,537169],"+
                "[67,516997],"+
                "[68,502759],"+
                "[69,483642],"+
                "[70,462924],"+
                "[71,439222],"+
                "[72,417198],"+
                "[73,391691],"+
                "[74,367612],"+
                "[75,341845],"+
                "[76,312223],"+
                "[77,282649],"+
                "[78,249556],"+
                "[79,220004],"+
                "[80,186632],"+
                "[81,152438],"+
                "[82,114808],"+
                "[83,77722],"+
                "[84,38624],"+
                "[85,0],"+
                "[86,0],"+
                "[87,0],"+
                "[88,0],"+
                "[89,0]";
        }

        if(range=='metals'){
            return     "['Age','Savings'],"+
                "[25,0],"+
                "[26,2786],"+
                "[27,5971],"+
                "[28,9570],"+
                "[28,13704],"+
                "[30,18373],"+
                "[31,23443],"+
                "[32,28982],"+
                "[33,35048],"+
                "[34,41489],"+
                "[35,48454],"+
                "[36,55997],"+
                "[37,63928],"+
                "[38,72082],"+
                "[39,81085],"+
                "[40,90335],"+
                "[41,100141],"+
                "[42,110564],"+
                "[43,121448],"+
                "[44,132626],"+
                "[45,144297],"+
                "[46,157620],"+
                "[47,171060],"+
                "[48,185356],"+
                "[49,199957],"+
                "[50,215204],"+
                "[51,231915],"+
                "[52,249507],"+
                "[53,268765],"+
                "[54,288130],"+
                "[55,308893],"+
                "[56,330782],"+
                "[57,354500],"+
                "[58,378065],"+
                "[59,399396],"+
                "[60,425435],"+
                "[61,455705],"+
                "[62,481828],"+
                "[63,513748],"+
                "[64,545058],"+
                "[65,574577],"+
                "[66,564651],"+
                "[67,548752],"+
                "[68,536922],"+
                "[69,517938],"+
                "[70,500535],"+
                "[71,478030],"+
                "[72,458729],"+
                "[73,437272],"+
                "[74,415832],"+
                "[75,393035],"+
                "[76,367364],"+
                "[77,336848],"+
                "[78,306959],"+
                "[79,279837],"+
                "[80,248487],"+
                "[81,213600],"+
                "[82,181529],"+
                "[83,147792],"+
                "[84,112113],"+
                "[85,76294],"+
                "[86,39301],"+
                "[87,104],"+
                "[88,0],"+
                "[89,0]";
                ;
        }

        if(range=='hats'){
            return     "['Age','Savings'],"+
                "[25,0],"+
                "[26,2794],"+
                "[27,5993],"+
                "[28,9618],"+
                "[29,13779],"+
                "[30,18504],"+
                "[31,23631],"+
                "[32,29320],"+
                "[33,35387],"+
                "[34,41911],"+
                "[35,48993],"+
                "[36,56634],"+
                "[37,64692],"+
                "[38,72983],"+
                "[39,82101],"+
                "[40,91570],"+
                "[41,101540],"+
                "[42,112196],"+
                "[43,123369],"+
                "[44,134976],"+
                "[45,146856],"+
                "[46,160860],"+
                "[47,174187],"+
                "[48,189197],"+
                "[49,204699],"+
                "[50,220890],"+
                "[51,237571],"+
                "[52,256558],"+
                "[53,276256],"+
                "[54,296966],"+
                "[55,318733],"+
                "[56,342416],"+
                "[57,366487],"+
                "[58,391413],"+
                "[59,415809],"+
                "[60,443588],"+
                "[61,474867],"+
                "[62,503044],"+
                "[63,534527],"+
                "[64,570607],"+
                "[65,601668],"+
                "[66,595372],"+
                "[67,583042],"+
                "[68,574661],"+
                "[69,559823],"+
                "[70,543853],"+
                "[71,526871],"+
                "[72,506862],"+
                "[73,492386],"+
                "[74,472854],"+
                "[75,451655],"+
                "[76,429040],"+
                "[77,403881],"+
                "[78,380852],"+
                "[79,353785],"+
                "[80,326895],"+
                "[81,296793],"+
                "[82,269441],"+
                "[83,240067],"+
                "[84,205984],"+
                "[85,176523],"+
                "[86,143190],"+
                "[87,105151],"+
                "[88,69312],"+
                "[89,33088],";
        }
    });
}


//Activate knockout.js
ko.applyBindings(new ViewModel());

$(document).ready(function(){

  $("input[name='range']").change(function(){
     buffer();
   });
})


ko.bindingHandlers.date = { 
    update: function(element, valueAccessor, allBindingsAccessor) { 
        var value = valueAccessor(), allBindings = allBindingsAccessor(); 
        var valueUnwrapped = ko.utils.unwrapObservable(value); 
        
        var d = ""; 
        if (valueUnwrapped) { 
            var m = /Date\([\d+-]+\)/gi.exec(valueUnwrapped); 
            if (m) { 
                d = String.format("{0:dd/MM/yyyy}", eval("new " + m[0])); 
            } 
        }        
        $(element).text(d);    
    } 
}; 
ko.bindingHandlers.money = { 
    update: function(element, valueAccessor, allBindingsAccessor) { 
        var value = valueAccessor(), allBindings = allBindingsAccessor(); 
        var valueUnwrapped = ko.utils.unwrapObservable(value); 
        
        var m = ""; 
        if (valueUnwrapped) {        
            m = parseInt(valueUnwrapped); 
            if (m) { 
                m = String.format("{0:n0}", m); 
            } 
        }        
        $(element).text(m);    
    } 
}; 