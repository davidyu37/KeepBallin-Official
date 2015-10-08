'use strict';

var REGEXP = /^[^!@#$%^&*()_+{}\[\]"'?><:-=]+$/;
angular.module('keepballin')
.directive('nameCheck', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.nameCheck = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (REGEXP.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };
    }
  };
});