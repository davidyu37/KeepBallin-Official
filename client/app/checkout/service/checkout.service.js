'use strict';

angular.module('keepballin')
  .factory('Checkout', ['$resource', function ($resource) {
    return $resource('/api/checkouts/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
