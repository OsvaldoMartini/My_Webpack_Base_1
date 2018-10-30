var base = document.querySelector('#cards');
var selector = '.card';


base.addEventListener('click', function(event) {
  let closest = event.target.closest(selector);
	if (closest && base.contains(closest)) {
  	closest.classList.add('blue');
  }
});