'use strict';

angular.module('keepballin')
  .controller('MyCourtCtrl', ['$scope', 'User', 'Auth', function ($scope, User, Auth) {
	
  	$scope.ratedCourts = [];
  	$scope.courtCreated = [];

	var userData = User.getMyCourt();
	userData.$promise.then(function(data) {
		if(userData.courtRatings) {
			var sorted = sortRating(userData.courtRatings);
			$scope.ratedCourts= sorted;
		}
		if(userData.courtCreated) {
			$scope.courtCreated = userData.courtCreated;
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