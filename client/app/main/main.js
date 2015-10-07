'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, $urlRouterProvider) {
    
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
    $urlRouterProvider.otherwise('/');
});//config ends
