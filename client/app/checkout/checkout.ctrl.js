'use strict';

angular.module('keepballin')
  .controller('CheckoutCtrl', ['$scope', 'points', function ($scope, points) {
    $scope.points = points;
    
    
  }]);
