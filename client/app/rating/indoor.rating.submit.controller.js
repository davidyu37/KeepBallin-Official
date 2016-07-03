'use strict';

angular.module('keepballin')
	.controller('indoorRatingSubmitCtrl', ['$scope', '$timeout', 'Rating', 'Indoor', 'SweetAlert', 'Auth', '$state', '$modal', '$modalInstance', function ($scope, $timeout, Rating, Indoor, SweetAlert, Auth, $state, $modal, $modalInstance) {
		
		$scope.hoveringOver = function(value) {
			$scope.overStar = value;
		};

		$scope.rates = Indoor.getRating({id: $scope.currentcourt._id});

		$scope.close = function() {
			$modalInstance.close();
		};

		$scope.sendRate = function() {
			$scope.submit = true;
			if($scope.rate && $scope.reason) {
				$scope.sending = true;
				var rating = {
					rate: $scope.rate,
					reason: $scope.reason,
					indoor: $scope.currentcourt._id
				};
				Rating.saveIndoor(rating, function() {
					$scope.submit = false;
					$scope.sending = false;
					// $modalInstance.close();
				});	
			} else {
				return;
			}
		};
	}]);