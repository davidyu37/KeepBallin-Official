'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('courts', {
        url: '/courts',
        templateUrl: 'app/courts/courts.html',
        controller: 'CourtsCtrl'
      });
  });