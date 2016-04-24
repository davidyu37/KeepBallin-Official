'use strict';

angular.module('keepballin')
  .factory('Timeslot', ['$resource', function ($resource) {
    return $resource('/api/timeslots/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      getByCourtId: {
      	method: 'GET',
      	isArray: true,
      	params: {
      		controller: 'getByCourtId'
      	}
      }
	});
  }]);
