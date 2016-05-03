'use strict';

angular.module('keepballin')
  .controller('MyReservationCtrl', ['$scope', 'Reservation', function ($scope, Reservation) {
	$scope.reserves = Reservation.getByUser();
  }]);