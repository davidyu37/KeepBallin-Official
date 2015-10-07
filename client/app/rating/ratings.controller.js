'use strict';

angular.module('keepballin')
	.controller('ratingCtrl', ['$scope', '$timeout', 'Rating', 'Court', function ($scope, $timeout, Rating, Court) {
		$scope.max = 5;
		$scope.isReadonly = false;

		//wait for the template to compile
	    $timeout(function() { getRatings($scope.$parent.currentcourt._id); });
	    

		function getRatings(courtID) {
			var ratings = Court.getRatings({id: courtID});
			ratings.$promise.then(function(data) {
	  			var allRates = data[0].ratings;
	  			if(allRates.length === 0) {
	  				return;
	  			} else {
		  			var total = 0;
		  			for(var i=0; i < allRates.length; i++) {
		  				total += allRates[i].rate;
		  			}
		  			var average = total / allRates.length;
		  			$scope.rate = average;
	  			}
	  		});
		}
		

		$scope.hoveringOver = function(value) {
			$scope.overStar = value;
		};

		$scope.sendRate = function(rate) {
			var rating = {
				rate: rate,
				court: $scope.$parent.currentcourt._id
			};
			Rating.save(rating, function(data) {
				console.log(data);
			});
		};
	}]);