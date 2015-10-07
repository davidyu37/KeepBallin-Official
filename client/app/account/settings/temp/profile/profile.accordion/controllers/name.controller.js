'use strict';

angular.module('keepballin')
  .controller('NameCtrl', ['$scope', 'User', 'Auth', function ($scope, User, Auth) {
  	$scope.user = Auth.getCurrentUser();

    $scope.changeName = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changeName($scope.user.name)
        .then( function() {
          $scope.message = '名稱更新成功';
        })
        .catch( function() {
          $scope.errors.other = '密碼錯誤';
          $scope.message = '';
        });
      }
	};
  }]);//NameCtrl ends 