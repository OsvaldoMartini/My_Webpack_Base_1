//-------------------------------------------------------
Highcharts.Renderer.prototype.symbols.line = function(x, y, width, height) {
    return ['M',x ,y + width / 2,'L',x+height,y + width / 2];
};
//-------------------------------------------------------
Highcharts.setOptions({
    chart:{
        type:'bar',
        margin:[5,15,10,100],
    },
    credits:{enabled:false},
    exporting:{enabled:false},
    legend:{enabled:false},
    title:{text:''},
    xAxis:{
        tickLength:0,
        lineColor:'#999',
        lineWidth:1,
        labels:{style:{fontWeight:'bold'}}        
    },
    yAxis:{
        min:0,
        minPadding:0,
        maxPadding:0,
        tickColor:'#ccc',
        tickWidth:1,
        tickLength:3,
        gridLineWidth:0,
        endOnTick:true,
        title:{text: ''},
        labels:{
            y:10,
            style:{
                fontSize:'8px'
            },
            formatter:function(){
                if (this.isLast){
                    return this.value + ' %';
                }
                else{
                    return this.value;
                }
            }
        }
    },
    tooltip:{
        enabled:true,
        backgroundColor:'rgba(255, 255, 255, .85)',
        borderWidth:0,
        shadow:true,
        style:{fontSize:'10px',padding:2},
        formatter:function() {
           return this.series.name + ": <strong>" + Highcharts.numberFormat(this.y,2) + "</strong>";
        }
    },
    plotOptions:{
        bar:{
            color:'#000',
            shadow:false,
            borderWidth:0,
        },
        scatter:{
            marker:{
                symbol:'line',
                lineWidth:3,
                radius:8,
                lineColor:'#000'
            }
        }
    }
});

//-------------------------------------------------------
var chart1 = new Highcharts.Chart({
    chart:{renderTo:'container1'},
    xAxis:{categories:['Title 1']},
    yAxis:{
        max:100,
        labels:{y:10,style:{fontSize:'8px'}},    
        plotBands:[{from:0,to:70,color: 'rgba(103,103,103,.35)'},
                   {from:70,to:85,color: 'rgba(153,153,153,.35)'},
                   {from:85,to:100,color: 'rgba(204,204,204,.35)'}]
    },
    series:[{name:'Measure',pointWidth:10,data:[80]},
            {name:'Target',type: 'scatter',data:[90],}]
});

//-------------------------------------------------------
var chart2 = new Highcharts.Chart({
    chart:{renderTo:'container2'},
    xAxis:{categories:['Title 2']},
    yAxis:{
        max:100,
        labels:{y:10,style:{fontSize:'8px'}},   
        plotBands:[{from:0,to:75,color: 'rgba(103,103,103,.35)'},
                   {from:75,to:90,color: 'rgba(153,153,153,.35)'},
                   {from:90,to:100,color: 'rgba(204,204,204,.35)'}]
    },
    series:[{name:'Measure',pointWidth:10,data:[92]},
            {name:'Target',type: 'scatter',data:[95],}]
});

//-------------------------------------------------------
var chart3 = new Highcharts.Chart({
    chart:{renderTo:'container3'},
    xAxis:{categories:['Title 3']},
    yAxis:{
        max:100,
        labels:{y:10,style:{fontSize:'8px'}},   
        plotBands:[{from:0,to:50,color: 'rgba(103,103,103,.35)'},
                   {from:50,to:75,color: 'rgba(153,153,153,.35)'},
                   {from:75,to:100,color: 'rgba(204,204,204,.35)'}]
    },
    series:[{name:'Measure',pointWidth:10,data:[64]},
            {name:'Target',type: 'scatter',data:[75],}]
});

//-------------------------------------------------------
var chart4 = new Highcharts.Chart({
    chart:{renderTo:'container4'},
    xAxis:{categories:['Title 4']},
    yAxis:{
        max:1000,
        labels:{y:10,style:{fontSize:'8px'},formatter:function(){return this.value;}},   
        plotBands:[{from:0,to:600,color: 'rgba(103,103,103,.35)'},
                   {from:600,to:800,color: 'rgba(153,153,153,.35)'},
                   {from:800,to:1000,color: 'rgba(204,204,204,.35)'}]
    },
    series:[{name:'Measure',pointWidth:10,data:[970]},
            {name:'Target',type: 'scatter',data:[850],}]
});

//-------------------------------------------------------
var chart5 = new Highcharts.Chart({
    chart:{renderTo:'container5'},
    xAxis:{categories:['Title 5']},
    yAxis:{
        max:500,tickInterval:100,
        labels:{y:10,style:{fontSize:'8px'},formatter:function(){return this.value;}},   
        plotBands:[{from:0,to:300,color: 'rgba(103,103,103,.35)'},
                   {from:300,to:400,color: 'rgba(153,153,153,.35)'},
                   {from:400,to:500,color: 'rgba(204,204,204,.35)'}]
    },
    series:[{name:'Measure',pointWidth:10,data:[475]},
            {name:'Target',type: 'scatter',data:[450],}]
});
//-------------------------------------------------------


