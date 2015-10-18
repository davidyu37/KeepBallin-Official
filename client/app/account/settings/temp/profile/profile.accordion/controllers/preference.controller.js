'use strict';

angular.module('keepballin')
  .controller('PreferenceCtrl', ['$scope', 'User', 'Auth', '$timeout', function ($scope, User, Auth, $timeout) {
  	$scope.user = Auth.getCurrentUser();

    /* Selections for positions on preference.html */
    $scope.positions = [
      'PG-控球後衛',
      'SG-得分後衛',
      'SF-小前鋒',
      'PF-大前鋒',
      'C-中鋒'
    ];
    
    $scope.changeDetail = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changeDetail($scope.user)
        .then( function() {
          $scope.message = '更改成功';
          $timeout(function() {
            $scope.message = '';
          }, 2000);
          $scope.submitted = false;
        })
        .catch( function() {
          $scope.message = '';
        });
      }
	};
  }]);//NameCtrl ends 