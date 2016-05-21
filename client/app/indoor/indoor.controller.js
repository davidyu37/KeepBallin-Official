'use strict';

angular.module('keepballin')
  .controller('IndoorCtrl', ['$scope', 'Indoor', '$modal', function ($scope, Indoor, $modal) {
    Indoor.queryPublic(function(data) {
    	//Filter out courts that's not public or approved
    	$scope.courts = data;
    });

    $scope.openReserve = function(id) {
    	$scope.loading = true;
    	Indoor.getPublic({id: id}, function(data) {
			$scope.currentcourt = data;
			$scope.loading = false;
	    	$modal.open({
	    		templateUrl: 'app/indoor/temp/reserve.court.html',
				scope: $scope,
				size: 'lg',
				controller: 'ReserveCtrl'
	    	});	
		});  
    };

  }]);
