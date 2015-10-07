'use strict';

angular.module('keepballin')
.directive('slideable', function () {
    return {
        restrict:'C',
        compile: function (element) {
            // wrap tag
            var contents = element.html();

            element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

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
.directive('slideToggle', function() {
    return {
        restrict: 'A',
        scope: {
            expanded: '=expanded',
            map: '=map'
        },
        link: function($scope, element, attrs) {
            var button, target, content;
            
            //Scrolling function to be reuse
            function scroll(toggle) {
                if (!button) {button = document.querySelector('.slideBtn');}
                if (!target) {target = document.querySelector(attrs.slideToggle);}
                if (!content) {content = target.querySelector('.slideable_content');}
                if(toggle) {
                    $scope.expanded = !$scope.expanded;
                    $scope.$apply();    
                }
                
                if($scope.expanded) {
                    
                    var defaultHeight = 200;
                    target.style.height = defaultHeight + 'px';
                    button.style.bottom = (defaultHeight - 50) + 'px'; 
                    
                } else {
                    target.style.height = '0px';
                    button.style.bottom = '0px';
                }
                
            }
            
            element.bind('click', function() {
                scroll(true);
            });

            $scope.$watch('expanded', function(newVal){
                if(newVal) {
                    
                    scroll();
                }
            });

            //Close the detail when drag start
            $scope.map.addListener('dragstart', function(){
                
                if($scope.expanded === true) {
                    $scope.expanded = false;
                    scroll();
                    $scope.$apply();    
                }
            });

            

        }
    };
});