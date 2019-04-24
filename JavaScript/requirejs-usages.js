require.config({
    paths: {
      "jquery": "../js/jquery.v1.7.2/jquery.min", //"https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
       "slick":	"../js/slick/slick.min"//"https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min",
    }
  });
  
  require(['jquery'], function() {
    $('div').text('jQuery is loaded.');
  });
  
  
  require(['slick'], function() {
    $('.slick').slick();
  });