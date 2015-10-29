'use strict';

angular.module('keepballin')
  .factory('Court', ['$resource', function ($resource) {
    return $resource('/api/courts/:id/:controller', 
    { id: '@id' }, {
      //Method to get one court is the array for the marker to render
      getOne: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'chosenCourt'
        }
      },  
      update: {
        method: 'PUT'
      },
      getRatings: {
        method: 'GET',
        params: {
          controller: 'ratings'
        }
      },
      search: {
        method: 'GET',
        params: {
          controller: 'search'
        },
        isArray: true
      }
	  });
  }]);
