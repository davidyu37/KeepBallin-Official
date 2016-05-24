'use strict';

angular.module('keepballin')
  .controller('PointsCtrl', ['$scope', 'Auth', '$modal', function ($scope, Auth, $modal) {
    
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

    $scope.openModal = function() {
      $modal.open({
          templateUrl: 'app/checkout/checkout.modal.html',
          size: 'md',
          controller: 'CheckoutCtrl',
          resolve: {
              points: function() {
                  return $scope.points;
              }
          }
      });
    };
    
  }]);
