'use strict';

angular.module('keepballin')
	.controller('GalleryCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
		//Close btn for thiscourt.picture state
		$scope.close = function() {
			$modalInstance.close();
		};

	}]);//GalleryCtrl ends