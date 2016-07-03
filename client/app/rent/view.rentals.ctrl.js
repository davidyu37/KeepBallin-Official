'use strict';

angular.module('keepballin')
  .controller('ViewRentalsCtrl', ['$scope', 'Auth', 'Indoor', '$state', 'usersCourts', '$modal', '$q', function ($scope, Auth, Indoor, $state, usersCourts, $modal, $q) {
  	$scope.courts = usersCourts;

  	//Open modal for check in and out
  	$scope.openCheckinModal = function(c) {
  		$modal.open({
            templateUrl: 'app/rent/checkinModal/checkin.modal.html',
            scope: $scope,
            size: 'md',
            controller: 'CheckinCtrl',
            resolve: {
                populatedIndoor: function() {
                    var defer = $q.defer();
		            Indoor.getPopulated({id: c._id}, function(data) {
		              defer.resolve(data);
		            });  
		            return defer.promise;
                }
            }
        });
  	};

  }]);
