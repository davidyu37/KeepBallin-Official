'use strict';

angular.module('keepballin')
  .factory('Court', ['$resource', function ($resource) {
    return $resource('/api/courts/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      getRatings: {
        method: 'GET',
        params: {
          controller: 'ratings'
        },
        isArray: true
      },
      search: {
        method: 'GET',
        params: {
          controller: 'search'
          // query: '@query',
          // court: '@court',
          // city: '@city',
          // district: '@district'
        },
        isArray: true
      }
	  });
  }]);
