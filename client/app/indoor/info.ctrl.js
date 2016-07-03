'use strict';

angular.module('keepballin')
  .controller('InfoCtrl', ['$scope', 'Indoor', '$modalInstance', 'uiCalendarConfig', 'Reservation', 'Timeslot', '$compile', 'socket', '$modal', 'Auth', '$state', 'User', function ($scope, Indoor, $modalInstance, uiCalendarConfig, Reservation, Timeslot, $compile, socket, $modal, Auth, $state, User) {
    
    //Close the modal
    $scope.close = function() {
        $modalInstance.close();
    };


  }]);
