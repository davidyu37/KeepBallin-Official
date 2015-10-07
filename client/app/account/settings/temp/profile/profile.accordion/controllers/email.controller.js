'use strict';

angular.module('keepballin')
  .controller('EmailCtrl', ['$scope', 'User', 'Auth', function ($scope, User, Auth) {
  	$scope.user = Auth.getCurrentUser();
    $scope.changeEmail = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changeEmail($scope.user.email)
        .then( function() {
          $scope.message = '密碼更新成功';
        })
        .catch( function() {
          $scope.errors.other = '密碼錯誤';
          $scope.message = '';
        });
      }
	};
  }]);//NameCtrl ends 