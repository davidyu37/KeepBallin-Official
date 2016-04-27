'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
		.state('reservation', {
			url: '/reservation',
			templateUrl: 'app/reservation/reservation.html',
			controller: 'ReservationCtrl',
			resolve: {
				reservations: ['$stateParams', 'Indoor', '$q', 'Auth', function($stateParams, Indoor, $q, Auth) {
					var defer = $q.defer();
					var user = Auth.getCurrentUser();

					Indoor.getPublic({id: $stateParams.id}, function(data) {
						defer.resolve(data);
					});  
					return defer.promise;
				}]
			}
		})
		.state('reservationthis', {
			url: '/reservation/:id',
			templateUrl: 'app/reservation/reservation.this.html',
			controller: 'ReservationThisCtrl',
			resolve: {
				reservation: ['$stateParams', 'Reservation', '$q', function($stateParams, Reservation, $q) {
					var defer = $q.defer();
					
					Reservation.get({id: $stateParams.id}, function(data) {
						defer.resolve(data);
					});  
					return defer.promise;
				}]
			}
		})
  });
