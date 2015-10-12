'use strict';

angular.module('keepballin')
.directive('mobileslide', function () {
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
                    'overflow': 'hidden',
                    'height': '0px',
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing
                });
            };
        }
    };
})
.directive('mobileSlide', function() {
    return {
        restrict: 'A',
        scope: {
            mobileExpanded: '=mobileExpanded'
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
                
                if($scope.mobileExpanded) {
                    
                    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

                    target.style.height = h + 'px';
                    button.style.bottom = (h - 50) + 'px'; 
                    
                } else {
                    target.style.height = '0px';
                    button.style.bottom = '0px';
                }
                
            }
            
            element.bind('click', function() {
                scroll(true);
            });

            // $scope.$watch('expanded', function(newVal){
            //     if(newVal) {
                    
            //         scroll();
            //     }
            // });

            //Close the detail when drag start
            // $scope.map.addListener('dragstart', function(){
                
            //     if($scope.expanded === true) {
            //         $scope.expanded = false;
            //         scroll();
            //         $scope.$apply();    
            //     }
            // });

            

        }
    };
});