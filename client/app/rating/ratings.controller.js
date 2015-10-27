'use strict';

angular.module('keepballin')
	.controller('ratingCtrl', ['$scope', '$timeout', 'Rating', 'Court', 'SweetAlert', 'Auth', '$state', function ($scope, $timeout, Rating, Court, SweetAlert, Auth, $state) {
		$scope.max = 5;
		$scope.isReadonly = false;

		$scope.hoveringOver = function(value) {
			$scope.overStar = value;
		};

		$scope.sendRate = function(rate) {
			if(Auth.getCurrentUser().name) {
				
				var rating = {
					rate: rate,
					court: $scope.$parent.currentcourt._id
				};
				SweetAlert.swal({
					title: '感謝你的評分',
					text: '<p>你給了' + rate + '顆星</p>',
					type: 'success',
					confirmButtonColor: '#DD6B55',   
					confirmButtonText: 'Ok',
					html: true,
					timer: 3000
				});
				Rating.save(rating, function() {
				});
				
			} else {
				$state.go('login');
				return;
			}
		};
	}]);