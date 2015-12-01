'use strict';

angular.module('keepballin')
  .controller('EventDetailCtrl', ['$scope', 'Auth', '$modalInstance', '$http', 'SweetAlert', function ($scope, Auth, $modalInstance, $http, SweetAlert) {
  	$scope.close = function() {
  		$modalInstance.close();
  	};


  }]);