'use strict';

angular.module('keepballin')
	.controller('ratingSubmitCtrl', ['$scope', '$timeout', 'Rating', 'Court', 'SweetAlert', 'Auth', '$state', '$modal', '$modalInstance', function ($scope, $timeout, Rating, Court, SweetAlert, Auth, $state, $modal, $modalInstance) {
		
		$scope.hoveringOver = function(value) {
			$scope.overStar = value;
		};

		$scope.sendRate = function() {
			$scope.submit = true;
			if($scope.rate && $scope.reason) {
				$scope.sending = true;
				var rating = {
					rate: $scope.rate,
					reason: $scope.reason,
					court: $scope.currentcourt._id
				};
				console.log(rating);
				Rating.save(rating, function() {
					$scope.$emit('ratingSaved');
					$scope.submit = false;
					$scope.sending = false;
					$modalInstance.close();
				});	
			} else {
				return;
			}
		};
	}]);