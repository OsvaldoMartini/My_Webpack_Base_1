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

//values from JS
const style = document.documentElement.style;

/* control elements */
var ranges = {
  translate: document.getElementById('tx'),
  scale: document.getElementById('scale'),
  deg: document.getElementById('deg')
};

//Change the CSS Variable value here
function valueChange(id, value) {
  style.setProperty('--' + id, value);
}

ranges.translate.addEventListener('input', function(e) { 
  valueChange(e.currentTarget.id, e.currentTarget.value + 'vw');
});

ranges.scale.addEventListener('input', function(e) { 
  valueChange(e.currentTarget.id, e.currentTarget.value);
});

ranges.deg.addEventListener('input', function(e) { 
  valueChange(e.currentTarget.id, e.currentTarget.value + 'deg');
});


const middlePanel = document.getElementById('middle-panel');

middlePanel.style['width'] =  '200px';
middlePanel.style['backgroundColor'] = 'blue'
// middlePanel.style.setProperty('backgroundColor','red')
// middlePanel.style.setProperty('--middle-size', '300px');



$(function () {

  $("#a").resizable({
      resize: function () {
          $("#b").width(500 - $(this).width());
      }
  });

  $("#b").resizable({
      resize: function () {
          $("#c").width(500 - $(this).width());
      }
  });

});

