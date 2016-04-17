'use strict';

angular.module('keepballin')
  .controller('IndividualIndoor', ['$scope', 'Indoor', 'thisIndoor', '$modal', function ($scope, Indoor, thisIndoor, $modal) {
    console.log(thisIndoor);
    $scope.currentcourt = thisIndoor[0];

    //Open modal to reserve
    $scope.reserve = function() {
    	$modal.open({
    		templateUrl: 'app/indoor/temp/reserve.court.html',
			scope: $scope,
			size: 'lg',
			controller: 'ReserveCtrl'
    	});
    };

  }]);
