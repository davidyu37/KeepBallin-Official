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

      changeAvatar: {
        method: 'PUT',
        params: {
          controller: 'avatar'
        }
      },

      changeDetail: {
        method: 'PUT',
      },

      changePro: {
        method: 'PUT',
        params: {
          controller: 'pro'
        }
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

      getMyCourt: {
        method: 'GET',
        params: {
          id: 'mycourt'
        }
      },

      getUser: {
        method: 'GET',
        params: {
          controller: 'who'
        }
      },
      // Manager get only vip and users
      managerGet: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'search'
        }
      }
	  });
  });
