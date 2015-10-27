'use strict';

angular.module('keepballin')
.directive('ngEnter', function() {
    return function(scope, element, attrs) {

        element.bind('keydown', function(e) {
            if(e.which === 13) {
                //When enter is pressed check to see if it's enabled
                if(scope.$eval(attrs.enableEnter) === true) {
                    //Fires the function
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'e': e});
                    });
                } else {
                    return;
                }
                e.preventDefault();
            }
        });
       
    };
})

.directive('enableEnter', function() {
    return function(scope, element, attrs) {

        if(scope.$eval(attrs.enableEnter) === true) {
            return true;
        } else {
            return false;
        }
    };
});