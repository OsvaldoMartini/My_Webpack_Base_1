//Use the input ranges to modify the individual transform properties on the fly, and see that they can be smooth even if you change a different property mid transition. There's no need to remember what the other properties are when you set the new individual value.

//We'll use this to change the CSS Variable values from JS
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