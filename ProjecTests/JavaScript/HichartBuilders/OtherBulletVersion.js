//-------------------------------------------------------
Highcharts.Renderer.prototype.symbols.line = function(x, y, width, height) {
    return ['M',x ,y + width / 2,'L',x+height,y + width / 2];
};
//-------------------------------------------------------
var chart = new Highcharts.Chart({
    chart:{
        renderTo:'containerOtherBullet',
        type:'bar',
        borderWidth:1,
        borderColor:'#eee',
        margin:[0,0,20,100]
    },
    credits:{enabled:false},
    exporting:{enabled:false},
    title:{text:''},
    legend:{enabled:false},
    xAxis:{
        tickLength:100,
        tickColor:'#eee',
        gridLineWidth:1,
        gridLineColor:'#eee',
        labels: {
            style: {
                fontWeight:'bold'
            }
        },
        lineColor:'#eee',
        lineWidth:1,
        categories:['Measure 1','Measure 2','Measure 3','Measure 4','Measure 5']
    },
    yAxis:{
        tickInterval:2,
        allowDecimals:false,
        tickColor:'#ccc',
        tickWidth:1,
        tickLength:3,
        lineColor:'#eee',
        lineWidth:1,
        gridLineWidth:1,
        gridLineColor:'rgba(255,255,255,.15)',
        endOnTick:true,
        title:{text: ''},
        //gridZIndex:4,
        min:-0.5,
        max:11.75,
        endOnTick:false,
        startOnTick:false,
        plotLines: [{
            value:10.5,
            width:1,
            color:'#eee'
        }],
        labels: {
            style: {
                fontSize:'9px'
            }
        }
     },
    plotOptions:{
        bar:{
            grouping: false,
            shadow:false,
            borderWidth:0,
            pointPadding:.25,
            groupPadding:0
        },
        scatter:{
            marker:{
                symbol:'line',
                lineWidth:3,
                radius:9,
                lineColor:'#333'
            }
        }
    },
     series:[{
        name:'Bands 3',
        enableMouseTracking:false,
        borderWidth:0,
        borderRadius:0,
        stacking:'normal',
        grouping:false,
        color:'rgba(156,156,156,.1)',
        data:[2,1.5,1.5,1.5,2]
     },{
        name:'Bands 2',
        enableMouseTracking:false,
        borderWidth:0,
        borderRadius:0,
        stacking:'normal',
        grouping:false,
        color:'rgba(156,156,156,.4)',
        data:[2,1.5,1.5,2,3]
     },{
        //pointRange:1.1,
        name:'Bands 1',
        enableMouseTracking:false,
        borderWidth:0,
        borderRadius:0,
        stacking:'normal',
        grouping:false,
        color:'rgba(156,156,156,.7)',
        data:[6,7,7,6.5,5]
     },{
        name:'Measure',
        color:'rgba(56,56,56,1)',
        pointRange:.5,
        zIndex:10,
        data:[7,5,9,3,6]
    },{
        name:'Target',
        type:'scatter',
        zIndex:20,
        data:[7.5,8,7.5,8.5,8.5]
    },{
        name:'Warnings',
        type:'scatter',
        marker: { 
            symbol:'circle', 
            radius:6, 
            color:'rgba(238,46,47,1)',
            lineWidth:0,
            lineColor:'#fff',
            states: {
                hover: {
                    enabled: false
                }
            }
        },
        data:[
            {x:0,y:11,marker:{fillColor:'rgba(238,46,47,0)'}},
            {x:1,y:11,marker:{fillColor:'rgba(238,46,47,.5)'}},
            {x:2,y:11,marker:{fillColor:'rgba(238,46,47,0)'}},
            {x:3,y:11,marker:{fillColor:'rgba(238,46,47,1)'}},
            {x:4,y:11,marker:{fillColor:'rgba(238,46,47,0)'}}
        ]
    }]
});
//-------------------------------------------------------
