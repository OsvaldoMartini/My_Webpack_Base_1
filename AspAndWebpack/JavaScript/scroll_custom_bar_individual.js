//debugger;
// var arrayList = {};
// var lettersArray = ["letter_A", "letter_B", "Letter_C", "Mango"];
// lettersArray.push("Kiwi");
var ul_left = document.createElement("ul");
var ul_main = document.createElement("ul");

 //Left Grid
for (i = 0; i < 26; i++) {
    var li_left = document.createElement("li");
    li_left.style.listStyle = "none";
    
    var h1 = document.createElement("h1");
    h1.setAttribute('class','eight');
    h1.innerText = 'Click';
      
    var span_jump = document.createElement("span");
    span_jump.setAttribute('data-jumpto', "letter_" + (i+10).toString(36));
    span_jump.innerText = "letter_" + (i+10).toString(36);
    span_jump.setAttribute('onclick','jumpIntoView(this); return false')
    span_jump.setAttribute('style','cursor:pointer;')
    h1.innerHTML += span_jump.outerHTML;
    
    li_left.innerHTML += h1.outerHTML;
    li_left.style.display = "inline";
    
    ul_left.appendChild(li_left);
   }
   document.getElementById("letter-left").appendChild(ul_left);


 //Main Grid
for (i = 0; i < 26; i++) {
  var li_main = document.createElement("li");
  li_main.style.listStyle = "none";
  li_main.setAttribute('id', "letter_" + (i+10).toString(36));
  
  var h1 = document.createElement("h1");
  h1.setAttribute('class','eight');
  h1.innerText = 'Break right after this and';
    
  var span = document.createElement("span");
  for (x=0; x<5; x++){
    //span.innerText += "Mama $ Papa"+"</br>";
    var span_h1 = document.createElement("span");
    span_h1.innerText = 'Mama $ Papa';
    h1.innerHTML += span_h1.outerHTML;
  }
  li_main.innerHTML = "letter_" + (i+10).toString(36);
  li_main.innerHTML += h1.outerHTML;
  li_main.style.display = "inline";
  ul_main.appendChild(li_main);
 }

//<h1 class="eight">
//   Break right after this and
//   <span>before this</span>
// </h1>
document.getElementById("letter-main").appendChild(ul_main);

(function($){
$(window).load(function(){


  $("#content-letter").mCustomScrollbar({
    axis:"y",
    scrollButtons:{enable:true},
    theme:"3d",
    scrollbarPosition:"outside",
    setWidth:250
});


   $("#content-7").mCustomScrollbar({
        axis:"y",
        scrollButtons:{enable:true},
        theme:"3d",
        scrollbarPosition:"outside",
        setWidth:350
    });


    $("#content-repeat").mCustomScrollbar({
      axis:"y",
      scrollButtons:{enable:true},
      theme:"3d",
      scrollbarPosition:"outside",
      setWidth:350
  });
 
    $("#mainData").mCustomScrollbar({
      axis:"y",
      scrollButtons:{enable:true},
      theme:"3d",
      scrollbarPosition:"outside",
      setWidth:350
      // advanced:{
      //   updateOnContentResize: true
      // }		   
  });


});
})(jQuery);

function jumpIntoView(getJump){
  if (getJump.dataset.jumpto){
elem = document.getElementById(getJump.dataset.jumpto);    
console.log(getJump.dataset.jumpto);
 
//$("#content-7").mCustomScrollbar("scrollTo","#"+Jump.dataset.jumpto);
    $("#content-7").mCustomScrollbar("scrollTo", '#'+ getJump.dataset.jumpto);
  
    //$('.demo-yx').mCustomScrollbar('scrollTo',['top',null]);
  
  }
}

// $("#letter_j").focus(function() {
//   $(".content-7").mCustomScrollbar("scrollTo",this);
// });