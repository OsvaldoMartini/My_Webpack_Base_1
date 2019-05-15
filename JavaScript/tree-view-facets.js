var toggler = document.getElementsByClassName("caretFacets");
var i;

for (i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nestedFacets").classList.toggle("active");
    this.classList.toggle("caretFacets-down");
  });
}


function showTooltip(evt, text) {
  let tooltip = document.getElementById("tooltipFacets");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = evt.pageX + 10 + 'px';
  tooltip.style.top = evt.pageY + 10 + 'px';
}

function hideTooltip() {
  var tooltip = document.getElementById("tooltipFacets");
  tooltip.style.display = "none";
}