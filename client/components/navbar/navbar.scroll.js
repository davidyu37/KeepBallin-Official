'use strict';

angular.module('keepballin')
	.factory('Scroll', function Scroll(){
		return {
			scrollInit: function() {
				//header hides when user scrolls up
				var didScroll;
				var lastScrollTop = 0;
				var delta = 5;
				
				$(window).scroll(function() {
					didScroll = true;
				});

				//run hasScrolled() and reset didScroll status
				setInterval(function() {
				  if (didScroll) {
				    hasScrolled();
				    didScroll = false;
				  }
				}, 250);
				function hasScrolled() {
					//scrollTop is the number that represents the position of the scroll
					//the very top is 0
					var st = $(window).scrollTop();
					
					if(Math.abs(lastScrollTop - st) <= delta)
				        {return;}
				  	// If current position > last position AND scrolled past navbar...
					
					if (st > lastScrollTop && st > 50){
					  // Scroll Down
					  $('.header').addClass('header-up');
					  $('.navbar-collapse').removeClass('in');
					} else {
				      // Scroll Up  
				      $('.header').removeClass('header-up'); 
				    }
					lastScrollTop = st;
				}

			}
		};
	});//scroll factory ends here