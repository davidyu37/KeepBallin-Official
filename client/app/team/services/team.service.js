'use strict';

angular.module('keepballin')
  .factory('Team', ['$resource', function ($resource) {
    return $resource('/api/teams/:id/:controller/:memberId/:name', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      nameExist: {
      	method: 'GET',
      	params: {
      		controller: 'search'
      	}
      }
	  });
  }]);
