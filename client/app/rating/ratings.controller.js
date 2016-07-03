'use strict';

angular.module('keepballin')
	.controller('ratingCtrl', ['$scope', 'Rating', 'SweetAlert', 'Auth', '$state', '$modal', function ($scope, Rating, SweetAlert, Auth, $state, $modal) {
		
		//Open rating form
		$scope.openRate = function() {
			if(Auth.getCurrentUser().name) {
				$modal.open({
					animation: true,
					templateUrl: 'app/rating/rating.html',
					scope: $scope,
					size: 'lg',
					controller: 'ratingSubmitCtrl'
				});	
			} else {
				$state.go('login');
				return;
			}
		};

		//Show indoor court's rating
		$scope.openIndoorRate = function() {
			if(Auth.getCurrentUser().name) {
				$modal.open({
					animation: true,
					templateUrl: 'app/rating/indoor.show.html',
					scope: $scope,
					size: 'lg',
					controller: 'indoorRatingSubmitCtrl'
				});	
			} else {
				$state.go('login');
				return;
			}
		};
 
		//Show all the rates to the court
		$scope.openRates = function() {
			$modal.open({
				animation: true,
				templateUrl: 'app/rating/rating.show.html',
				scope: $scope,
				size: 'lg',
				controller: 'ratingShowCtrl'
			});	
		};
	}]);