'use strict';

angular.module('keepballin')
  .controller('MyCourtCtrl', ['$scope', 'User', function ($scope, User) {
	
  	$scope.ratedCourts = [];
  	$scope.courtCreated = [];

	var userData = User.getMyCourt();
	userData.$promise.then(function(data) {
		if(data.courtRatings) {
			var sorted = sortRating(data.courtRatings);
			$scope.ratedCourts= sorted;
		}
		if(data.courtCreated) {
			$scope.courtCreated = data.courtCreated;
		}
	});

	function sortRating(arr) {
		for(var i=0; i < arr.length; i++) {
			var done = arr.sort(function(a, b) {
					    return parseFloat(b.rate) - parseFloat(a.rate);
					});
			return done;
		}
	}

  }]);