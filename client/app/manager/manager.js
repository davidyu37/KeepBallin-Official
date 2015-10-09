'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('manager', {
        url: '/manager',
        templateUrl: 'app/manager/manager.html',
        controller: 'ManagerCtrl'
      });
  });