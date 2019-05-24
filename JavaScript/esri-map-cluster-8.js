var map;
var srcData_Intern = [];
var srcData_File = [];

//Alternative way to do "includes"
self.stringIncludes = function(a, b) {
  return a.indexOf(b) >= 0;
};

function getRealMimeType(reader) {
  var arr = new Uint8Array(reader.result).subarray(0, 4);
  var header = "";
  var realMimeType;

  for (var i = 0; i < arr.length; i++) {
    header += arr[i].toString(16);
  }

  // magic numbers: http://www.garykessler.net/library/file_sigs.html
  switch (header) {
    case "89504e47":
      realMimeType = "image/png";
      break;
    case "47494638":
      realMimeType = "image/gif";
      break;
    case "ffd8ffDB":
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
    case "ffd8ffe3":
    case "ffd8ffe8":
      realMimeType = "image/jpeg";
      break;
    default:
      realMimeType = "unknown"; // Or you can use the blob.type as fallback
      break;
  }

  return realMimeType;
}

function encodeImageFileAsURL(file, nameImg) {
  var filesSelected = document.getElementById("inputFileToLoad").files;

  if (typeof file !== "undefined" || typeof filesSelected !== "undefined") {
    var fileToLoad = file;

    if (filesSelected && filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];
    }

    var fileReader = new FileReader();

    fileReader.onload = function(fileLoadedEvent) {
      //   var realMimeType = getRealMimeType(fileReader);
      //   if (realMimeType !== "unknown") {
      //     readerBase64.readAsDataURL(image);
      //   } else {
      //     alert("Please upload a valid image file");
      //   }

      if (typeof file !== "undefined") {
        srcData_Intern.push({
          NameImg: nameImg,
          src: fileLoadedEvent.target.result
        }); // <--- data: base64
      }

      if (filesSelected && filesSelected.length > 0) {
        srcData_File.push({
          NameImg: nameImg,
          src: fileLoadedEvent.target.result
        }); // <--- data: base64
      }

      var newImage = document.createElement("img");

      //newImage.src = srcData_File  || srcData_Intern;
      newImage.src = fileLoadedEvent.target.result;

      //document.getElementById("imgTest").innerHTML = newImage.outerHTML;
      //alert(
      //  "Converted Base64 version is " +
      //    document.getElementById("imgTest").innerHTML
      //);
      console.log(
        "Converted Base64 version is " +
          document.getElementById("imgTest").innerHTML
      );
    };
    //fileReader.readAsBinaryString(fileToLoad);
    //fileReader.readAsArrayBuffer(fileToLoad);
    fileReader.readAsDataURL(fileToLoad);
  }
}

async function createFileFromUrl(path, name) {
  let response = await fetch(path + "/" + name);
  let data = await response.blob();
  let metadata = {
    type: data.type //"image/svg+xml"
  };
  let file = new File([data], name, metadata);
  encodeImageFileAsURL(file);
  // ... do something with the file or return it
}

async function createFileFromScratch(name, dataXml, elemFiltered) {
  //   elemModified = elemFiltered.querySelector("fill").forEach(function(item) {
  //     item = "url(#patternDouble)";
  //   });

  // var rect = elemFiltered.querySelectorAll("#rectBaseLand")[0];
  //  rect.setAttribute("fill", "url(#patternMulti)");

  let data = elemFiltered.outerHTML;
  let metadata = {
    type: "image/svg+xml"
  };
  let file = new File([data], name, metadata);
  encodeImageFileAsURL(file, name);
  // ... do something with the file or return it
}

function createInitialImg(nameFile, strElem) {
  // var parser = new DOMParser();
  // var xmlSvgEntry = parser.parseFromString(srcData, "image/svg+xml");

  // console.log("xmlSvgEntry", xmlSvgEntry);

  // console.log(svgImage.outerHTML);

  var namespace = "http://www.w3.org/2000/svg";

  //Actions
  var svgImage = document.createElementNS(namespace, "svg");

  //var defsElem = parser.parseFromString(srcData, "image/svg+xml").querySelector("defs");
  //   var linGradElem = parser
  //     .parseFromString(srcData, "image/svg+xml")
  //     .querySelector("linearGradient");
  //   var stopElem = parser
  //     .parseFromString(srcData, "image/svg+xml")
  //     .querySelector("stop");
  //   var rectElem = parser
  //     .parseFromString(srcData, "image/svg+xml")
  //     .querySelector("rect");

  var linGrad = document.createElement("linearGradient");
  linGrad.setAttribute("id", "patternMulti"); //<linearGradient id='patternMulti' x2='0%' y2='100%'></linearGradient>
  linGrad.setAttribute("x2", "0%");
  linGrad.setAttribute("y2", "100%");

  var stopGrad1 = document.createElement("stop");
  stopGrad1.setAttribute("id", "stop1");
  stopGrad1.setAttribute("offSet", "33%");
  stopGrad1.setAttribute("stop-color", "red");

  var stopGrad2 = document.createElement("stop");
  stopGrad2.setAttribute("id", "stop2");
  stopGrad2.setAttribute("offSet", "33%");
  stopGrad2.setAttribute("stop-color", "#FF6");

  var stopGrad3 = document.createElement("stop");
  stopGrad3.setAttribute("id", "stop3");
  stopGrad3.setAttribute("offSet", "66%");
  stopGrad3.setAttribute("stop-color", "#FF6");

  var stopGrad4 = document.createElement("stop");
  stopGrad4.setAttribute("id", "stop4");
  stopGrad4.setAttribute("offSet", "66%");
  stopGrad4.setAttribute("stop-color", "#F60");

  linGrad.innerHTML += stopGrad1.outerHTML + "\n";
  linGrad.innerHTML += stopGrad2.outerHTML + "\n";
  linGrad.innerHTML += stopGrad3.outerHTML + "\n";
  linGrad.innerHTML += stopGrad4.outerHTML + "\n";

  var defsSvg = document.createElementNS(namespace, "defs");
  defsSvg.innerHTML = linGrad.outerHTML + "\n";

  var rectMulti = document.createElement("rect");
  rectMulti.setAttribute("id", "rectMulti");
  rectMulti.setAttribute("x", "0");
  rectMulti.setAttribute("y", "0");
  rectMulti.setAttribute("rx", "5");
  rectMulti.setAttribute("ry", "5");
  rectMulti.setAttribute("width", "30");
  rectMulti.setAttribute("height", "30");
  rectMulti.setAttribute("fill", "url(#patternMulti)");
  rectMulti.setAttribute("stroke", "black");
  rectMulti.setAttribute("stroke-width", "1");
  rectMulti.setAttribute("opacity", "0.5");

  svgImage.innerHTML = defsSvg.outerHTML + "\n";
  svgImage.innerHTML += rectMulti.outerHTML + "\n";

  createFileFromScratch(nameFile, svgImage, strElem);
}

require([
  "dojo/parser",
  "dojo/ready",
  "dojo/_base/array",
  "esri/Color",
  "dojo/dom-style",
  "dojo/query",

  "esri/map",
  "esri/request",
  "esri/graphic",
  "esri/geometry/Extent",

  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/PictureMarkerSymbol",
  "esri/renderers/ClassBreaksRenderer",

  "esri/layers/GraphicsLayer",
  "esri/SpatialReference",
  "esri/dijit/PopupTemplate",
  "esri/geometry/Point",
  "esri/geometry/webMercatorUtils",

  "extras/ClusterLayer",

  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dojo/domReady!"
], function(
  parser,
  ready,
  arrayUtils,
  Color,
  domStyle,
  query,
  Map,
  esriRequest,
  Graphic,
  Extent,
  SimpleMarkerSymbol,
  SimpleFillSymbol,
  PictureMarkerSymbol,
  ClassBreaksRenderer,
  GraphicsLayer,
  SpatialReference,
  PopupTemplate,
  Point,
  webMercatorUtils,
  ClusterLayer
) {
  ready(function() {
    parser.parse();

    var clusterLayer;
    var popupOptions = {
      markerSymbol: new SimpleMarkerSymbol(
        "circle",
        20,
        null,
        new Color([0, 0, 0, 0.25])
      ),
      marginLeft: "20",
      marginTop: "20"
    };
    map = new Map("map", {
      basemap: "oceans",
      center: [-117.789, 33.543],
      zoom: 13
    });

    map.on("load", function() {
      // hide the popup's ZoomTo link as it doesn't make sense for cluster features
      domStyle.set(query("a.action.zoomTo")[0], "display", "none");

      self.ImgToRender = null;

      var svgImg = esriRequest({
        url: "data/BaseLand-MultiGrp-2.svg",
        handleAs: "xml"
      });
      svgImg.then(function(response, reject) {
        console.log(
          typeof reject !== "undefined" ? reject : "request accepted",
          typeof response !== "undefined" ? response : "response failled"
        );
        self.ImgToRender = response;

        createInitialImg(
          "BaseLand-MultiGrp-2.svg",
          self.ImgToRender.documentElement
        );
      });

      // get the svg folder
      var svgImg = esriRequest({
        url: "data/BaseLand-MultiGrp-3.svg",
        handleAs: "xml"
      });
      svgImg.then(function(response, reject) {
        console.log(
          typeof reject !== "undefined" ? reject : "request accepted",
          typeof response !== "undefined" ? response : "response failled"
        );
        self.ImgToRender = response;

        createInitialImg(
          "BaseLand-MultiGrp-3.svg",
          self.ImgToRender.documentElement
        );

        //createFile("data", "BaseLand-DoubleGrp.svg");
        //encodeImageFileAsURL([{ element: self.ImgToRender }]);
        // var parser = new DOMParser();
        // var xmlSvgEntry = parser.parseFromString(
        //   self.ImgToRender,
        //   "image/svg+xml"
        // );
        // console.log("xmlSvgEntry", xmlSvgEntry);

        // get the latest 1000 photos from instagram/laguna beach
        var photos = esriRequest({
          url: "data/1000-photos.json",
          handleAs: "json"
        });

        photos.then(addClusters, error);
      });

      //addClusters, error}
    });

    function addClusters(resp) {
      var photoInfo = {};
      var wgs = new SpatialReference({
        wkid: 4326
      });
      photoInfo.data = arrayUtils.map(resp, function(p) {
        var latlng = new Point(parseFloat(p.lng), parseFloat(p.lat), wgs);
        var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
        var attributes = {
          Caption: p.caption,
          Name: p.full_name,
          Image: p.image,
          Link: p.link
        };
        return {
          x: webMercator.x,
          y: webMercator.y,
          attributes: attributes
        };
      });

      // popupTemplate to work with attributes specific to this dataset
      var popupTemplate = new PopupTemplate({
        title: "",
        fieldInfos: [
          {
            fieldName: "Caption",
            visible: true
          },
          {
            fieldName: "Name",
            label: "By",
            visible: true
          },
          {
            fieldName: "Link",
            label: "On Instagram",
            visible: true
          }
        ]
      });

      var p = {};
      p.Type = ["BaseAir", "BaseLand", "BaseSea"];
      p.TypeDoubleGrp = [
        "BaseAir-DoubleGrp",
        "BaseLand-DoubleGrp",
        "BaseSea-DoubleGrp"
      ];
      p.TypeMultiGrp = [
        "BaseAir-MultiGrp",
        "BaseLand-MultiGrp",
        "BaseSea-MultiGrp"
      ];

      // cluster layer that uses OpenLayers style clustering
      clusterLayer = new ClusterLayer({
        data: photoInfo.data,
        distance: 100,
        id: "clusters",
        labelColor: "white",
        labelOffset: 10,
        resolution: map.extent.getWidth() / map.width,
        singleColor: "#888",
        singleTemplate: popupTemplate
      });

      //Preparing Pre Group Info
      //clear(); //For the console.log
      var xUniqueId = 0;
      self.arrayLinearMarkers = [];
      console.log(clusterLayer._clusterData);
      clusterLayer._clusterData.map(function(item) {
        if (true) {
          //It Defines the Some Logic
          xUniqueId += 1; //New Line for the Caret Arrow Line
          // this is defining the LIne GROUP_HEADER
          self.arrayLinearMarkers.push({
            UniqueId: xUniqueId,
            Caption: item.attributes.Caption,
            Image: item.attributes.Image,
            Link: item.attributes.Link,
            Name: item.attributes.Name,
            x: item.x,
            y: item.y
          });
        }
      });
      console.log(self.arrayLinearMarkers);

      //Grouping By base Type
      //clear();
      var groupByType = [
        self.arrayLinearMarkers.reduce(function(r, a) {
          r[a.Name] = r[a.Name] || [];
          r[a.Name].push(a);
          return r;
        }, Object.create(null))
      ].filter(function(item, i, arr) {
        return arr.indexOf(item) >= i;
      });

      groupByType.filter(function(item, i, arr) {
        return arr.indexOf("Base") >= 0;
      });

      //Its Possible combine as Many as wish By "allFacetsSvg"
      var allFacetsMultiImages = [];

      allFacetsMultiImages.push({
        ClusterMinimalCounter: 1,
        Type: "BaseLand",
        ImgName: "BaseLand" //Level Two Different Types Dark Green (land) / Green (Land Foreign)
      });

      allFacetsMultiImages.push({
        ClusterMinimalCounter: 2,
        Type: "BaseLandForeign",
        ImgName: "BaseLand-MultiGrpForeign-2" //Level Two Different Types Dark Green (land) / Green (Land Foreign)
      });

      allFacetsMultiImages.push({
        ClusterMinimalCounter: 3,
        Type: "BaseLandForeign", //Level Tres Different Types  //Dark Blue (Sea) / Blue (Blue) / Dark Green (Land)
        ImgName: "BaseLand-MultiGrp-3"
      });

      allFacetsMultiImages.push({
        ClusterMinimalCounter: 3,
        Type: "BaseLandForeign", //Level Tres Different Types  //Dark Blue (Sea) / Blue (Blue) / Green (Land Foreign)
        ImgName: "BaseLand-MultiGrpForeign-3"
      });

      // It filters All BaseLand and BaseLandForeign
      self.arrayLinearMarkers.filter(function(item, i, arr) {
        return self.stringIncludes(item.Name, "BaseLand");
      });

      //Search Two Diff Array and creatses New One Combining the filters
      var markersWitImages = self.arrayLinearMarkers
        .filter(function(marker) {
          return (
            allFacetsMultiImages.filter(function(img) {
              return img.Type === marker.Name; //It Should Have a Property called Type = 'BaseLand' like so
            }).length > 0
          );
        })
        .map(function(item) {
          return {
            UniqueId: xUniqueId,
            Name: item.Name,
            x: item.x,
            y: item.y,
            ImageName: allFacetsMultiImages
              .filter(function(img) {
                return (
                  img.Type === item.Name &&
                  img.ClusterMinimalCounter <= item.ClusterCounter
                ); //Here it Should Compare
              })
              .map(function(icon) {
                return icon.ImgName != null ? icon.ImgName : "BaseLand"; //Defining some Base Image TODO => Refactor this Line
              })[0], //To Return just the Values Encountered
            Caption: item.Caption,
            Image: item.Image,
            Link: item.Link
          };
        });

      console.log(markersWitImages);

      //console.log('Changed: ', changed);
      //This Makes Update at the Original Array
      //   var arrToFilter = [{ UniqueId: uniqueId }];
      //   self.arrayLinearMarkers
      //     .filter(function(marker) {
      //       return (
      //         arrToFilter.filter(function(img) {
      //           return img.UniqueId === marker.UniqueId;
      //         }).length > 0
      //       );
      //     })
      //     .map(function(item) {
      //       return (item.GroupActive = !item.GroupActive);
      //     });

      // Caption: "another crappy day at work..."
      // Image: "https://distilleryimage11.instagram.com/231895caaf2211e19dc71231380fe523_6.jpg"
      // Link: "https://instagr.am/p/Lfz0O-Io5_/"
      // Name: "gino beltran"

      //   <text
      //     fill="rgb(255, 255, 255)"
      //     fill-opacity="1"
      //     stroke="none"
      //     stroke-opacity="0"
      //     stroke-width="1"
      //     stroke-linecap="butt"
      //     stroke-linejoin="miter"
      //     stroke-miterlimit="4"
      //     x="534"
      //     y="257"
      //     text-anchor="middle"
      //     text-decoration="undefined"
      //     rotate="0"
      //     kerning="auto"
      //     text-rendering="auto"
      //     font-style="normal"
      //     font-variant="normal"
      //     font-weight="bold"
      //     font-size="12"
      //     font-family="Arial"
      //     dominant-baseline="alphabetic"
      //     filter="url(#halo_map_bases_2_0_0_0_1_1)"
      //     transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,0.00000000,4.00000000)"
      //     fill-rule="evenodd"
      //   >
      //     6
      //   </text>;

      var defaultSym = new SimpleMarkerSymbol().setSize(4);
      var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

      var object = document.createElement("object");
      object.setAttribute("type", "image/svg+xm");
      object.setAttribute("type", "BaseLand-DoubleGrp.svg");
      //FallBack
      var imgSvg = document.createElement("img");
      imgSvg.setAttribute(
        "src",
        "http://localhost:49918/Assets/Images/Map/Markers/BaseLand-DoubleGrp.svg"
      );
      object.innerHTML = imgSvg.outerHTML;

      //   var parser = new DOMParser();
      //   var xmlSvgEntry = parser.parseFromString(
      //     self.ImgToRender.documentElement,
      //     "image/svg+xml"
      //   );
      //   console.log(xmlSvgEntry);

      //   var imgSrc = document.createElement("img");
      //   imgSrc.setAttribute("onclick", "alert('ola IMG');");
      //   imgSrc.setAttribute("onmousemove", "console.log('ola IMG');");
      //   imgSrc.setAttribute("onmouseout", "console.log('ola IMG');");
      //   imgSrc.setAttribute("src", "data/BaseLand-MultiGrp.svg");
      //   //imgSrc.setAttribute('src', "/Assets/Images/Map/Markers/" + IconName + ".svg");
      //   imgSrc.setAttribute("id", "imdId_BaseLand-MultiGrp_" + 1954);
      //   imgSrc.setAttribute("width", "16");
      //   imgSrc.setAttribute("height", "16");
      //   console.log(imgSrc);
      //   var imgTest = document.getElementById("imgTest");
      //   imgTest.appendChild(imgSrc);

      //var picBaseUrl = "https://static.arcgis.com/images/Symbols/Shapes/";
      var picBaseUrl = "http://localhost:49918/Assets/Images/Map/Markers/";
      var singlePic = new PictureMarkerSymbol(
        picBaseUrl + p.Type[1] + ".svg", //"BluePin1LargeB.png",
        32,
        32
      ).setOffset(0, 15);

      //  var doublePic = new PictureMarkerSymbol(
      //    "BaseLand-DoubleGrp.svg", //picBaseUrl + p.TypeDoubleGrp[1] + ".svg", //"GreenPin1LargeB.png",
      //    64,
      //    64
      //  ).setOffset(0, 15);

      var multiPic2 = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 12,
        type: "esriPMS",
        url: "data/BaseLand-MultiGrp.svg",
        contentType: "image/svg",
        width: 24,
        height: 24
      });

      var doublePic2 = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 12,
        type: "esriPMS",
        url: "data/BaseLand-DoubleGrp.svg",
        contentType: "image/svg",
        width: 24,
        height: 24
      });

      var symbolMarker3 = new SimpleMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        type: "esriPMS",
        imageData:
          //     "PHN2Zz48ZGVmcz48bGluZWFyZ3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3AgaWQ9InN0b3AxIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0icmVkIj48L3N0b3A+PHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiI+PC9zdG9wPjxzdG9wIGlkPSJzdG9wMyIgb2Zmc2V0PSI2NiUiIHN0b3AtY29sb3I9IiNGRjYiPjwvc3RvcD48c3RvcCBpZD0ic3RvcDQiIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjRjYwIj48L3N0b3A+PC9saW5lYXJncmFkaWVudD48L2RlZnM+PHJlY3QgaWQ9InJlY3RNdWx0aSIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InVybCgjcGF0dGVybk11bHRpKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD48L3N2Zz4=",
          "PHN2Zz48ZGVmcz48bGluZWFyZ3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3AgaWQ9InN0b3AxIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0icmVkIj48L3N0b3A+PHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiI+PC9zdG9wPjxzdG9wIGlkPSJzdG9wMyIgb2Zmc2V0PSI2NiUiIHN0b3AtY29sb3I9IiNGRjYiPjwvc3RvcD48c3RvcCBpZD0ic3RvcDQiIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjRjYwIj48L3N0b3A+PC9saW5lYXJncmFkaWVudD48L2RlZnM+PHJlY3QgaWQ9InJlY3RNdWx0aSIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InVybCgjcGF0dGVybk11bHRpKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD48L3N2Zz4=",
        //"UEhOMlp6NDhaR1ZtY3o0OGJHbHVaV0Z5WjNKaFpHbGxiblFnYVdROUluQmhkSFJsY201TmRXeDBhU0lnZURJOUlqQWxJaUI1TWowaU1UQXdKU0krUEhOMGIzQWdhV1E5SW5OMGIzQXhJaUJ2Wm1aelpYUTlJak16SlNJZ2MzUnZjQzFqYjJ4dmNqMGljbVZrSWo0OEwzTjBiM0ErUEhOMGIzQWdhV1E5SW5OMGIzQXlJaUJ2Wm1aelpYUTlJak16SlNJZ2MzUnZjQzFqYjJ4dmNqMGlJMFpHTmlJK1BDOXpkRzl3UGp4emRHOXdJR2xrUFNKemRHOXdNeUlnYjJabWMyVjBQU0kyTmlVaUlITjBiM0F0WTI5c2IzSTlJaU5HUmpZaVBqd3ZjM1J2Y0Q0OGMzUnZjQ0JwWkQwaWMzUnZjRFFpSUc5bVpuTmxkRDBpTmpZbElpQnpkRzl3TFdOdmJHOXlQU0lqUmpZd0lqNDhMM04wYjNBK1BDOXNhVzVsWVhKbmNtRmthV1Z1ZEQ0OEwyUmxabk0rUEhKbFkzUWdhV1E5SW5KbFkzUk5kV3gwYVNJZ2VEMGlNQ0lnZVQwaU1DSWdjbmc5SWpVaUlISjVQU0kxSWlCM2FXUjBhRDBpTXpBaUlHaGxhV2RvZEQwaU16QWlJR1pwYkd3OUluVnliQ2dqY0dGMGRHVnliazExYkhScEtTSWdjM1J5YjJ0bFBTSmliR0ZqYXlJZ2MzUnliMnRsTFhkcFpIUm9QU0l4SWlCdmNHRmphWFI1UFNJd0xqVWlQand2Y21WamRENDhMM04yWno0PQ==",
        // path:
        //   "<svg xmlns='http://www.w3.org/2000/svg'>\n" +
        //   "<defs>\n" +
        //   "<linearGradient id='patternMulti' x2='0%' y2='100%'>\n" +
        //   "<stop id='stop1' offset='33%' stop-color='red' />\n" +
        //   "<stop id='stop2' offset='33%' stop-color='#FF6' />\n" +
        //   "<stop id='stop3' offset='66%' stop-color='#FF6' />\n" +
        //   "<stop id='stop4' offset='66%' stop-color='#F60' />\n" +
        //   "</linearGradient>\n" +
        //   "<linearGradient id='patternDouble' x2='0%' y2='100%'>\n" +
        //   "<stop id='stop1' offset='33%' stop-color='green' />\n" +
        //   "<stop id='stop2' offset='33%' stop-color='#F60' />\n" +
        //   "<stop id='stop3' offset='66%' stop-color='#F60' />\n" +
        //   "</linearGradient>\n" +
        //   "</defs>\n" +
        //   "<rect id='rectBaseLand' x='0' y='0' rx='5' ry='5' width='30' height='30'\n" +
        //   "fill='url(#patternMulti)' stroke='black' stroke-width='1' opacity='0.5' />\n" +
        //   "</svg>\n",
        contentType: "image/svg",
        width: 24,
        height: 24
      });

      var multiplePic = new PictureMarkerSymbol(
        picBaseUrl + p.TypeMultiGrp[1] + ".svg", //"GreenPin1LargeB.png",
        64,
        64
      ).setOffset(0, 15);

      var symbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        style: "square",
        color: "blue",
        size: "8px", // pixels
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 0],
          width: 3 // points
        }
      };

      var symbol = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        type: "esriPMS",
        url:
          "http://static.arcgis.com/images/Symbols/Basic/esriCartographyMarker_81_Blue.png",
        imageData:
          "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",
        contentType: "image/png",
        width: 24,
        height: 24
      });

      var symbolMarkerDouble = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        type: "esriPMS",
        //url: "http://static.arcgis.com/images/Symbols/Basic/RedBeacon.png",
        imageData: srcData_File,
        //   "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",
        contentType: "svg+xml",
        width: 24,
        height: 24
      });

      var symbolMulti = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        type: "esriPMS",
        //url:
        //  "http://static.arcgis.com/images/Symbols/Transportation/esriBusinessMarker_90_Yellow.png",
        imageData:
          "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",
        contentType: "image/png",
        width: 24,
        height: 24
      });

      console.log(srcData_File, srcData_Intern);
      var srcDataImg2 = srcData_Intern.filter(function(item) {
        return self.stringIncludes(item.NameImg, "BaseLand-MultiGrp-2");
      })[0];
      if (srcDataImg2.src) {
        srcDataImg2.src = srcDataImg2.src.replace(
          "data:image/svg+xml;base64,",
          ""
        );
      }

      var srcDataImg3 = srcData_Intern.filter(function(item) {
        return self.stringIncludes(item.NameImg, "BaseLand-MultiGrp-3");
      })[0];
      if (srcDataImg3.src) {
        srcDataImg3.src = srcDataImg3.src.replace(
          "data:image/svg+xml;base64,",
          ""
        );
      }

      console.log(srcDataImg2.src, srcDataImg3.src);
      var symbolMultiImg_2 = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        type: "esriPMS",
        //url: "data/BaseLand-DoubleGrp.svg",
        //srcData
        //srcData,
        imageData: srcDataImg2.src,
        //"PHN2Zz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3AgaWQ9InN0b3AxIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0icmVkIj48L3N0b3A+PHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiI+PC9zdG9wPjxzdG9wIGlkPSJzdG9wMyIgb2Zmc2V0PSI2NiUiIHN0b3AtY29sb3I9IiNGRjYiPjwvc3RvcD48c3RvcCBpZD0ic3RvcDQiIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjRjYwIj48L3N0b3A+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgaWQ9InJlY3RNdWx0aSIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InVybCgjcGF0dGVybk11bHRpKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD48L3N2Zz4=",
        //"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGRlZnM+DQogICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+DQogICAgICAgIDxzdG9wIGlkPSJzdG9wMSIgb2Zmc2V0PSIzMyUiIHN0b3AtY29sb3I9InJlZCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3A0IiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoJICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5Eb3VibGUiIHgyPSIwJSIgeTI9IjEwMCUiPg0KICAgICAgICA8c3RvcCBpZD0ic3RvcDEiIG9mZnNldD0iMzMlIiBzdG9wLWNvbG9yPSJncmVlbiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQo8L2RlZnM+DQoJPHJlY3QgaWQ9InJlY3RCYXNlTGFuZCIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiDQogICAgICBmaWxsPSJ1cmwoI3BhdHRlcm5Eb3VibGUpIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNSIgLz4gICAgICAgIA0KPC9zdmc+DQoNCg==",
        //  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGRlZnM+DQogICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+DQogICAgICAgIDxzdG9wIGlkPSJzdG9wMSIgb2Zmc2V0PSIzMyUiIHN0b3AtY29sb3I9InJlZCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3A0IiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoJICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5Eb3VibGUiIHgyPSIwJSIgeTI9IjEwMCUiPg0KICAgICAgICA8c3RvcCBpZD0ic3RvcDEiIG9mZnNldD0iMzMlIiBzdG9wLWNvbG9yPSJncmVlbiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQo8L2RlZnM+DQoJPHJlY3QgaWQ9InJlY3RCYXNlTGFuZCIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiDQogICAgICBmaWxsPSJ1cmwoI3BhdHRlcm5NdWx0aSkiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC41IiAvPiAgICAgICAgDQo8L3N2Zz4NCg0K",
        //  "PHN2Zz48ZGVmcz48bGluZWFyZ3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3AgaWQ9InN0b3AxIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0icmVkIj48L3N0b3A+PHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiI+PC9zdG9wPjxzdG9wIGlkPSJzdG9wMyIgb2Zmc2V0PSI2NiUiIHN0b3AtY29sb3I9IiNGRjYiPjwvc3RvcD48c3RvcCBpZD0ic3RvcDQiIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjRjYwIj48L3N0b3A+PC9saW5lYXJncmFkaWVudD48L2RlZnM+PHJlY3QgaWQ9InJlY3RNdWx0aSIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InVybCgjcGF0dGVybk11bHRpKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD48L3N2Zz4=",
        //"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",
        contentType: "image/svg+xml",
        width: 24,
        height: 24
      });

      var symbolMultiImg_3 = new PictureMarkerSymbol({
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        type: "esriPMS",
        //url: "data/BaseLand-DoubleGrp.svg",
        //srcData
        //srcData,
        imageData: srcDataImg3.src,
        //"PHN2Zz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3AgaWQ9InN0b3AxIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0icmVkIj48L3N0b3A+PHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiI+PC9zdG9wPjxzdG9wIGlkPSJzdG9wMyIgb2Zmc2V0PSI2NiUiIHN0b3AtY29sb3I9IiNGRjYiPjwvc3RvcD48c3RvcCBpZD0ic3RvcDQiIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjRjYwIj48L3N0b3A+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgaWQ9InJlY3RNdWx0aSIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InVybCgjcGF0dGVybk11bHRpKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD48L3N2Zz4=",
        //"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGRlZnM+DQogICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+DQogICAgICAgIDxzdG9wIGlkPSJzdG9wMSIgb2Zmc2V0PSIzMyUiIHN0b3AtY29sb3I9InJlZCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3A0IiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoJICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5Eb3VibGUiIHgyPSIwJSIgeTI9IjEwMCUiPg0KICAgICAgICA8c3RvcCBpZD0ic3RvcDEiIG9mZnNldD0iMzMlIiBzdG9wLWNvbG9yPSJncmVlbiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQo8L2RlZnM+DQoJPHJlY3QgaWQ9InJlY3RCYXNlTGFuZCIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiDQogICAgICBmaWxsPSJ1cmwoI3BhdHRlcm5Eb3VibGUpIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNSIgLz4gICAgICAgIA0KPC9zdmc+DQoNCg==",
        //  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGRlZnM+DQogICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+DQogICAgICAgIDxzdG9wIGlkPSJzdG9wMSIgb2Zmc2V0PSIzMyUiIHN0b3AtY29sb3I9InJlZCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0ZGNiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3A0IiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoJICA8bGluZWFyR3JhZGllbnQgaWQ9InBhdHRlcm5Eb3VibGUiIHgyPSIwJSIgeTI9IjEwMCUiPg0KICAgICAgICA8c3RvcCBpZD0ic3RvcDEiIG9mZnNldD0iMzMlIiBzdG9wLWNvbG9yPSJncmVlbiIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgICAgPHN0b3AgaWQ9InN0b3AzIiBvZmZzZXQ9IjY2JSIgc3RvcC1jb2xvcj0iI0Y2MCIgLz4NCiAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQo8L2RlZnM+DQoJPHJlY3QgaWQ9InJlY3RCYXNlTGFuZCIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiDQogICAgICBmaWxsPSJ1cmwoI3BhdHRlcm5NdWx0aSkiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC41IiAvPiAgICAgICAgDQo8L3N2Zz4NCg0K",
        //  "PHN2Zz48ZGVmcz48bGluZWFyZ3JhZGllbnQgaWQ9InBhdHRlcm5NdWx0aSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3AgaWQ9InN0b3AxIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0icmVkIj48L3N0b3A+PHN0b3AgaWQ9InN0b3AyIiBvZmZzZXQ9IjMzJSIgc3RvcC1jb2xvcj0iI0ZGNiI+PC9zdG9wPjxzdG9wIGlkPSJzdG9wMyIgb2Zmc2V0PSI2NiUiIHN0b3AtY29sb3I9IiNGRjYiPjwvc3RvcD48c3RvcCBpZD0ic3RvcDQiIG9mZnNldD0iNjYlIiBzdG9wLWNvbG9yPSIjRjYwIj48L3N0b3A+PC9saW5lYXJncmFkaWVudD48L2RlZnM+PHJlY3QgaWQ9InJlY3RNdWx0aSIgeD0iMCIgeT0iMCIgcng9IjUiIHJ5PSI1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9InVybCgjcGF0dGVybk11bHRpKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD48L3N2Zz4=",
        //"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",
        contentType: "image/svg+xml",
        width: 24,
        height: 24
      });

      renderer.addBreak(0, 1, singlePic);
      renderer.addBreak(1, 2, symbolMultiImg_2);
      renderer.addBreak(2, 10000, symbolMultiImg_3);

      clusterLayer.setRenderer(renderer);
      map.addLayer(clusterLayer);

      // close the info window when the map is clicked
      map.on("click", cleanUp);
      // close the info window when esc is pressed
      map.on("key-down", function(e) {
        if (e.keyCode === 27) {
          cleanUp();
        }
      });
    }

    function cleanUp() {
      map.infoWindow.hide();
      clusterLayer.clearSingles();
    }

    function error(err) {
      console.log("something failed: ", err);
    }

    // show cluster extents...
    // never called directly but useful from the console
    window.showExtents = function() {
      var extents = map.getLayer("clusterExtents");
      if (extents) {
        map.removeLayer(extents);
      }
      extents = new GraphicsLayer({ id: "clusterExtents" });
      var sym = new SimpleFillSymbol().setColor(
        new Color([205, 193, 197, 0.5])
      );

      arrayUtils.forEach(
        clusterLayer._clusters,
        function(c, idx) {
          var e = c.attributes.extent;
          extents.add(
            new Graphic(
              new Extent(e[0], e[1], e[2], e[3], map.spatialReference),
              sym
            )
          );
        },
        this
      );
      map.addLayer(extents, 0);
    };
  });
});
