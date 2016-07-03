'use strict';

angular.module('keepballin')
  .factory('Point', ['$resource', function ($resource) {
    return $resource('/api/points/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
