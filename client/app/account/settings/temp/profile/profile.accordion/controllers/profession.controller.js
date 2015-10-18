'use strict';

angular.module('keepballin')
  .controller('ProCtrl', ['$scope', 'User', 'Auth', '$timeout', function ($scope, User, Auth, $timeout) {
  	$scope.user = Auth.getCurrentUser();
    $scope.changePro = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePro($scope.user)
        .then( function() {
          $scope.message = '更新成功';
          $scope.user = Auth.getCurrentUser();
          $timeout(function() {
            $scope.message = '';
          }, 2000);
          $scope.submitted = false;
        })
        .catch( function() {
          $scope.errors.other = '更新失敗';
          $scope.message = '';
        });
      }
	};
  }]);//NameCtrl ends 