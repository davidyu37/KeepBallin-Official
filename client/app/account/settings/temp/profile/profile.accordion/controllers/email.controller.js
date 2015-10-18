'use strict';

angular.module('keepballin')
  .controller('EmailCtrl', ['$scope', 'User', 'Auth', '$timeout', function ($scope, User, Auth, $timeout) {
  	$scope.user = Auth.getCurrentUser();
    $scope.changeEmail = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changeDetail($scope.user)
        .then( function() {
          $scope.message = '密碼更新成功';
          $timeout(function() {
            $scope.message = '';
          }, 2000);
          $scope.submitted = false;
        })
        .catch( function() {
          $scope.errors.other = '密碼錯誤';
          $scope.message = '';
        });
      }
	};
  }]);//NameCtrl ends 