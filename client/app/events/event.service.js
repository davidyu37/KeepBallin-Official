'use strict';

angular.module('keepballin')
  .factory('Event', ['$resource', function ($resource) {
    return $resource('/api/events/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
