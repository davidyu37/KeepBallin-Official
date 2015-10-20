'use strict';

angular.module('keepballin')
  .controller('InfoCtrl', ['$scope', 'User', 'Auth', '$timeout', function ($scope, User, Auth, $timeout) {
  	$scope.user = Auth.getCurrentUser();
    
    $scope.opened = false;
    
    $scope.open = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

   	// Datepicker directive expects a Date object, give it
    if($scope.user.birthday) {
      $scope.convertedDate = new Date($scope.user.birthday);
    } else {
      $scope.convertedDate = new Date();
    }

    $scope.changeDetail = function(form) {
    	$scope.user.birthday = $scope.convertedDate;
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