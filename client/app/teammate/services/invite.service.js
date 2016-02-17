'use strict';

angular.module('keepballin')
  .factory('Invite', ['$resource', function ($resource) {
    return $resource('/api/invite/:id:city:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      findByCity: {
      	method: 'GET',
      	isArray: true
      }
	  });
  }]);
