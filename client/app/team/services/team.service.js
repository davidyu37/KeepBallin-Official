'use strict';

angular.module('keepballin')
  .factory('Team', ['$resource', function ($resource) {
    return $resource('/api/teams/:id', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
