'use strict';

angular.module('keepballin')
  .controller('PointsCtrl', ['$scope', 'Auth', '$modal', 'Checkout', '$http', function ($scope, Auth, $modal, Checkout, $http) {
    
    $scope.changeClass = function(val) {
      $scope.isVeteran = false;
      $scope.isMVP = false;
      $scope.isRookie = false;

      $scope[val] = true;

      switch(val) {
        case 'isRookie':
          $scope.points = 500;
          break;
        case 'isMVP':
          $scope.points = 1000;
          break;
        case 'isVeteran':
          $scope.points = 5000;
          break;
        default:
          $scope.points = 0;
          break;
      }
    };

    $scope.points = 0;

    $scope.sendOrder = function() {
      if($scope.points > 0) {
        Checkout.save({points: $scope.points}, function(data) {
          console.log('points saved', data);
          $scope.allPay = data.html;
        });
      } else {
        $scope.noPoint = true;
      }
    };

    $scope.$watch('points', function(val) {
      if(val) {
        $scope.noPoint = false;
      }
    });
   
    
  }]);
