'use strict';

angular.module('keepballin')
  .factory('Team', ['$resource', function ($resource) {
    return $resource('/api/teams/:id/:memberId', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
