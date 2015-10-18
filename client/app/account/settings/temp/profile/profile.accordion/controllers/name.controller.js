'use strict';

angular.module('keepballin')
  .controller('NameCtrl', ['$scope', 'User', 'Auth', '$timeout', function ($scope, User, Auth, $timeout) {
  	$scope.user = Auth.getCurrentUser();

    $scope.changeName = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changeDetail($scope.user)
        .then( function() {
          $scope.message = '名稱更新成功';
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