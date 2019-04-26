var map;
require([
  "esri/config",
  "esri/map",
  "dojo/_base/lang",
  "esri/request",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dojo/domReady!"
], function(
  esriConfig, Map, lang, esriRequest
) {
  esriConfig.defaults.io.corsEnabledServers.push('https://api.census.gov') ;
  map = new Map("map", {
    basemap: "topo",
    center: [-120.1883, 37.0868],
    zoom: 6
  });

  esriRequest({
      url:"https://api.census.gov/data/2016/acs/acs5",
      content:{
        get: 'NAME,B01001_001E',
        for: 'tract:010805',
        in: ['state:01','county:073']
      },
      handleAs:'json',
      timeout:15000
    }).then(lang.hitch(this,function(resp){
      console.info(resp);
    }),lang.hitch(this,function(error){
      alert("Data failed");
    }));
});