var animatePoints = function() {
 
    
    
/* reveal the  points on landing page */
  var revealPoint = function() {
      $(this).css({
          opacity:1,
          transform : 'scaleX(1) translateY(0)'
      });
      
  };
    /* make each point a j query object */
  $.each( $('.point'), revealPoint );
    
  };

 /* run function when page loads */
/* if screen height is greater than 950px show points on landing page */
$(window).load(function() {
    if ( $(window).height() > 950) {
      animatePoints();
     }
var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;

  $(window).scroll(function(event) {
    if ($(window).scrollTop() >= scrollDistance) {
    animatePoints();
    }
  });
});

