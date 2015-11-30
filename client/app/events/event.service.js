'use strict';

angular.module('keepballin')
  .factory('Event', ['$resource', function ($resource) {
    return $resource('/api/events/:id/:controller/:team', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      getByTeam: {
      	method: 'GET',
      	params: {
      		controller: 'byTeam'
      	},
      	isArray: true
      }
	  });
  }]);
