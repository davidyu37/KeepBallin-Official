'use strict';

angular.module('keepballin')
  .controller('ProCtrl', ['$scope', 'User', 'Auth', function ($scope, User, Auth) {
  	$scope.user = Auth.getCurrentUser();
    $scope.changePro = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePro($scope.user)
        .then( function() {
          $scope.message = '更新成功';
          $scope.user = Auth.getCurrentUser();
        })
        .catch( function() {
          $scope.errors.other = '更新失敗';
          $scope.message = '';
        });
      }
	};
  }]);//NameCtrl ends 