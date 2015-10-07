'use strict';

angular.module('keepballin')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      changeName: {
        method: 'PUT',
        params: {
          controller: 'name'
        }
      },
      changeEmail: {
        method: 'PUT',
        params: {
          controller: 'email'
        }
      },
      changeAvatar: {
        method: 'PUT',
        params: {
          controller: 'avatar'
        }
      },
      changeDetail: {
        method: 'PUT',
      },
      changeRole: {
        method: 'PUT',
        params: {
          controller: 'changerole'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getUser: {
        method: 'GET'
      },
      searchParams: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'search'
        }
      }
	  });
  });
