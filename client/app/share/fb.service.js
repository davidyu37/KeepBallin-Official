'use strict';

angular.module('keepballin')
  .factory('FB', ['$resource', function ($resource) {
    return $resource('/api/FB', 
    { id: '@id' }, {});
  }]);