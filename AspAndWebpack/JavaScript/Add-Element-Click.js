var base = document.querySelector('#cards');
var selector = '.card';


base.addEventListener('click', function(event) {
  let closest = event.target.closest(selector);
	if (closest && base.contains(closest)) {
  	closest.classList.add('blue');
   }

});


function toggle_Class() {
  var element = document.getElementById("middle-panel");
  //var element = document.getElementsByClassName("middle-panel");
  
  if (element.classList) { 
      element.classList.toggle("resize");
  } else {
      // var classes = element.className.split(" ");
      // var i = classes.indexOf("resize");

      // if (i >= 0) 
      //     classes.splice(i, 1);
      // else 
      //     classes.push("resize");
      //     element.className = classes.join(" "); 
  }
}