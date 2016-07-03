'use strict';

angular.module('keepballin')
  .controller('PointsCtrl', ['$scope', 'Auth', '$window', '$state', 'User', function ($scope, Auth, $window, $state, User) {
    
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

    $scope.user = User.get();

    var currrentUrl = $window.location.href;

    var index = $window.location.href.indexOf('/settings');

    var checkOutUrl = $window.location.href.slice(0, index) + '/checkout/';

    $scope.sendOrder = function() {
      if($scope.points > 0) {
        $window.open(checkOutUrl + $scope.points);
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
