'use strict';

angular.module('keepballin')
.directive('mobileslide', ['$drag', function ($drag) {
    return {
        restrict:'C',
        compile: function (element) {
            // wrap tag
            var contents = element.html();

            element.html('<div class="mobileSlideContent" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '0.5s' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;

                element.css({
                    // 'overflow': 'hidden',
                    'height': '0px',
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing
                });
            };
        }
    };
}])
.directive('mobileSlide', ['$drag', function($drag) {
    return {
        restrict: 'A',
        scope: {
            mobileExpanded: '='
        },
        link: function($scope, element, attrs) {
            var button, target, content;
            
            //Scrolling function to be reuse
            function scroll(toggle) {
                if (!button) {button = document.querySelector('.slideBtnMobile');}
                if (!target) {target = document.querySelector(attrs.mobileSlide);}
                if (!content) {content = target.querySelector('.mobileSlideContent');}
                if(toggle) {
                    $scope.mobileExpanded = !$scope.mobileExpanded;
                    $scope.$apply();    
                }
                var htmlTag = document.getElementsByTagName('html')[0];
                var inner = document.getElementById('mobileDetail');
                if($scope.mobileExpanded) {
                    //disable global scroll and allow scorll inside of overlay
                    htmlTag.classList.add('noscroll');
                    inner.classList.add('scroll');
        
                    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

                    target.style.height = h + 'px';
                    button.style.bottom = (h - 50) + 'px'; 
                    
                } else {
                    target.style.height = '0px';
                    button.style.bottom = '0px';
                    //allow global scroll and disable overlay scroll
                    htmlTag.classList.remove('noscroll');
                    inner.classList.remove('scroll');
                }
                
            }
            
            element.bind('click', function() {
                scroll(true);
            });

        }
    };
}]);