'use strict';

angular.module('keepballin')
  .factory('Reservation', ['$resource', function ($resource) {
    return $resource('/api/reservations/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      getByUser: {
      	method: 'GET',
      	isArray: true,
      	params: {
      		id: 'getByUser'
      	}
      },
      checkIn: {
        method: 'POST',
        params: {
          controller: 'checkIn'
        }
      },
      checkOut: {
        method: 'POST',
        params: {
          controller: 'checkOut'
        }
      }
	  });
  }]);
