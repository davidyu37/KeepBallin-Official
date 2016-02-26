'use strict';

angular.module('keepballin')
  .factory('Invite', ['$resource', function ($resource) {
    return $resource('/api/invite/:id:city/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      findByCity: {
      	method: 'GET',
      	isArray: true
      },
      findAll: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'findAll'
        }
      },
      addParticipant: {
        method: 'POST',
        params: {
          controller: 'addOne'
        }
      },
      minusParticipant: {
        method: 'POST',
        params: {
          controller: 'minusOne'
        }
      }
	  });
  }]);
