'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('indoor', {
        url: '/indoor',
        templateUrl: 'app/indoor/indoor.html',
        controller: 'IndoorCtrl'
      });
  });
