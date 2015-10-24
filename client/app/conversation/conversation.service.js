'use strict';

angular.module('keepballin')
  .factory('Conversation', ['$resource', function ($resource) {
    return $resource('/api/conversations/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      getMails: {
      	method: 'GET',
      	isArray: true,
        params: {
          controller: 'get_mail'
        }
      }
	  });
  }]);
