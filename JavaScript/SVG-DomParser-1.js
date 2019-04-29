function dgebi(id) {
    return document.getElementById(id);
}
// short svg file as string
var svgtext ='https://upload.wikimedia.org/wikipedia/commons/c/c6/%2212_World_fly.svg'
var d;
function init() {
    d = dgebi('id:testdiv');
    //useInnerHTMLToCreateSVG();
    useDOMParser();
}
function useInnerHTMLToCreateSVG() {
    d.innerHTML = svgtext;
}
function useDOMParser() {
// see https://developer.mozilla.org/de/docs/Web/API/DOMParser#Parsing_an_SVG_or_HTML_document
    var parser = new DOMParser();
    var doc = parser.parseFromString(svgtext, "image/svg+xml");
    // returns a SVGDocument, which also is a Document.
    d.appendChild(doc);
}    
function createElementSVG() {
    var se = document.createElement('SVG');
    d.appendChild(se);
    console.log(se);
}


