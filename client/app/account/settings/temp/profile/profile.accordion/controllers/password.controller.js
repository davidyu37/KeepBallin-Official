'use strict';

angular.module('keepballin')
  .controller('PasswordCtrl', ['$scope', 'User', 'Auth', function ($scope, User, Auth) {
  	$scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = '密碼更新成功';
          $scope.user = {};
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = '密碼錯誤';
          $scope.message = '';
        });
      }
	};
  }]);//PasswordCtrl ends 