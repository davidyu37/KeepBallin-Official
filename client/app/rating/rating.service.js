'use strict';

angular.module('keepballin')
  .factory('Rating', ['$resource', function ($resource) {
    return $resource('/api/ratings/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      saveIndoor: {
      	method: 'POST',
      	params: {
      		controller: 'saveIndoor'
      	}
      }
	  });
  }]);