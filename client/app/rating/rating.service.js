'use strict';

angular.module('keepballin')
  .factory('Rating', ['$resource', function ($resource) {
    return $resource('/api/ratings/:id', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);