'use strict';

angular.module('keepballin')
  .factory('Indoor', ['$resource', function ($resource) {
    return $resource('/api/indoors/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }, 
      getPublic: {
      	method: 'GET',
      	params: {
          controller: 'getPublic'
        }
      },
      queryPublic: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'all',
          controller: 'queryPublic'
        }
      }
	  });
  }]);
