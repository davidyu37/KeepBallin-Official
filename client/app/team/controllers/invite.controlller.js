'use strict';

angular.module('keepballin')
  .controller('InviteCtrl', ['$scope', 'Auth', '$modalInstance', function ($scope, Auth, $modalInstance) {
  	$scope.name = Auth.getCurrentUser().name;
  	$scope.email = Auth.getCurrentUser().email;

  	$scope.close = function() {
  		$modalInstance.close();
  	};
  }]);