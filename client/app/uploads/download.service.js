'use strict';

angular.module('keepballin')
  .factory('Download', ['$resource', function ($resource) {
    return $resource('/api/uploads/pictures/:court:id', 
    { id: '@id' }, {
      update: {
        method: 'PUT'
      }
	  });
  }]);
