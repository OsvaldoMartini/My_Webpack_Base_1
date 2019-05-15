var s = Snap(512,512);
var scale = 10;

// draw the path
var path = s.path("M24.485,2c0,8-18,4-18,20c0,6,2,8,2,8h2c0,0-3-2-3-8c0-4,9-8,9-8s-7.981,4.328-7.981,8.436C21.239,24.431,28.288,9.606,24.485,2z")
						.transform('scale('+scale+')')
						.attr({fill:'none', stroke:'#fff', 'stroke-width':0.2, 'stroke-linecap':'square'});

// draw the arrow
var arrow =  s.path("M-1 0 L0 -2 L1 0 z")
              .attr({fill:'#FFF', stroke:'none'});


/*
The trick is to make your path with a dashed line. 

1) Have the size of each dash (and the space between each dash) be the total length of the path, then
2) Offset the dash position over time to gradually introduce the appearance of the line drawing itself in.
3) As the line draws, place and rotate an arrow at the current end position of the path using getPointAtLength()

*/

// get the length of the path
var len = Math.ceil(path.getTotalLength());

// set the length of strokeDasharray + strokeDashoffset to that length
path.attr({strokeDasharray:len, strokeDashoffset:len});

// create an object we can tween; initialize it with the path length
var tweenTarget = { value:len };

// tween that object's value to 0
TweenLite.to (tweenTarget, 8, { value: 0, ease: Quart.easeInOut, onUpdate: onUpdate, onComplete: onComplete });

// called on every tick of TweenLite.to()
// - simulate live drawing by adjusting the offset of the dash
// - position/rotate the arrow
function onUpdate() {
	var pos = tweenTarget.value;
  var point = path.getPointAtLength(len - pos);
  var rot = ((point.alpha < 360) ? 180+point.alpha : point.alpha) + 90;
  
  path.attr ({strokeDashoffset:pos}) ;
  arrow.transform('scale('+scale+') translate('+point.x+','+point.y+') rotate('+rot+',0,0)');
}

// tween completed
function onComplete() {
	arrow.remove();  
  path.attr({fill:'#365D35'})
}