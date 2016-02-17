'use strict';

angular.module('keepballin')
  .factory('Chat', ['$resource', function ($resource) {
    return $resource('/api/chats/:chatRoomId:controller', 
    { chatRoomId: '@id' }, {
      enter: {
        method: 'GET'
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
      update: {
        method: 'PUT'
      }
	  });
  }]);
