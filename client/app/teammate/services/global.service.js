'use strict';

angular.module('keepballin')
  .factory('Global', ['$resource', function ($resource) {
    return $resource('/api/globals/:controller', 
    { id: '@id' }, {
      load: {
        method: 'GET'
      },
      enter: {
        method: 'POST',
        params: {
          controller: 'enter'
        }
      },
      leave: {
        method: 'POST',
        params: {
          controller: 'leave'
        }
      },
      loadMessage: {
        method: 'POST',
        params: {
          controller: 'load'
        }
      },
      send: {
        method: 'POST',
        params: {
          controller: 'send'
        }
      }, 
      update: {
        method: 'PUT'
      },
      deleteMessage: {
        method: 'POST',
        params: {
          controller: 'delete'
        }
      }
	  });
  }]);
