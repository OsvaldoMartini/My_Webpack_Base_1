var map = L.map('map').setView([45.526, -122.667], 15);

  L.esri.basemapLayer('Streets').addTo(map);

  //  (new constructor syntax at 2.0.0)
  L.esri.Cluster.featureLayer({
    url: 'https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Trimet_Transit_Stops/FeatureServer/0'
    //url: 'Local_Feature.html'
  }).addTo(map);