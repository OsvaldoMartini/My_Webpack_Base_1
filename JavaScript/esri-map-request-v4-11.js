require([ 
  "esri/core/urlUtils",
  "esri/config",
  "esri/request"
], 
  function (urlUtils, esriConfig, esriRequest) {
    //esriConfig.request.proxyUrl = "/Map/icon/";
    urlUtils.addProxyRule({
      urlPrefix: "https://djanes.ihs.com",
      proxyUrl: "/Map/icon"
    });
    //esriConfig.request.trustedServers.push("https://djanes.ihs.com:5500");
    var resultsDiv = document.getElementById("resultsDiv");
    var input = document.getElementById("inputUrl");

    /************************************************
     *
     * Define the 'options' for our request.
     *
     *************************************************/
    var options = {
      // query: {
      //   f: "json"
      // },
      responseType: "blob"
    };

    // Make the request on a button click using the
    // value of the 'input' text.
    //on(btnQuery, "click", function() {
    btnQuery.addEventListener("click", function() {
      var url = input.value;
      esriRequest(url, options).then(function(response) {
        console.log("response", response);
        //var responseJSON = JSON.stringify(response, null, 2);
        resultsDiv.innerHTML = responseJSON;
      });
    });
  });