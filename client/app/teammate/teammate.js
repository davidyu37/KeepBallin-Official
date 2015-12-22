'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teammate', {
        url: '/teammate',
        templateUrl: 'app/teammate/teammate.html',
        controller: 'TeammateCtrl'
      });
  });
