'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rent', {
        url: '/rent',
        templateUrl: 'app/rent/rent.html',
        controller: 'RentCtrl'
      });
  });
