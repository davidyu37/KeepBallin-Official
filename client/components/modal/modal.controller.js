'use strict';

angular.module('keepballin')
	.controller('ModalCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
		$scope.close = function() {
			$modalInstance.close();
		};
	}]);