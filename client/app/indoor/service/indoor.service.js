'use strict';

angular.module('keepballin')
  .factory('Indoor', ['$resource', function ($resource) {
    return $resource('/api/indoors/:id/:controller', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      },
      changeCreator: {
        method: 'PUT',
        params: {
          controller: 'changeCreator'
        }
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
      },
      //Get for manager
      getPopulated: {
        method: 'GET',
        params: {
          controller: 'getPopulated'
        }
      },
      deletePic: {
        method: 'POST',
        params: {
          controller: 'deletePicture'
        }
      },
      setCover: {
        method: 'POST',
        params: {
          controller: 'setCover'
        }
      },
      closeTimeslot: {
        method: 'POST',
        isArray: true, 
        params: {
          controller: 'closeTimeslot'
        }
      },
      getRating: {
        method: 'GET',
        params: {
          controller: 'getRating'
        }
      }
	  });
  }]);
