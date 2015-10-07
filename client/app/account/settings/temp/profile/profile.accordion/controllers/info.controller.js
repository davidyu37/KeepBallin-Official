'use strict';

angular.module('keepballin')
  .controller('InfoCtrl', ['$scope', 'User', 'Auth', function ($scope, User, Auth) {
  	$scope.user = Auth.getCurrentUser();
    
    $scope.status = {
        opened: false
    };
    
    $scope.open = function() {
        $scope.status.opened = true;
    };
   	// Datepicker directive expects a Date object, give it
    $scope.convertedDate = new Date($scope.user.birthday);

    $scope.changeDetail = function(form) {
    	$scope.user.birthday = $scope.convertedDate;
		$scope.submitted = true;
		if(form.$valid) {
			Auth.changeDetail($scope.user)
		.then( function() {
		  $scope.message = '更改成功';
		})
		.catch( function() {
		  $scope.message = '';
		});
		}
	};
    
  }]);//NameCtrl ends 