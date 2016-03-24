'use strict';

angular.module('keepballin')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller/:token', {
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
      },
      adminGet: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'admin'
        }
      },
      //Send email for forgot pw
      forgot: {
        method: 'POST',
        params: {
          controller: 'forgot'
        }
      },
      //Check if token is valid
      checkToken: {
        method: 'GET',
        params: {
          controller: 'token'
        }
      },
      resetPw: {
        method: 'POST',
        params: {
          controller: 'token'
        }
      },
      getUserName: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'getNameOnly'
        }
      }
	  });
  });
