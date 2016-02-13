'use strict';

angular.module('keepballin')
  .factory('Lobby', ['$resource', function ($resource) {
    return $resource('/api/lobby/:id', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
