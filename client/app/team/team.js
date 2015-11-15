'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, $urlRouterProvider) {
    
    $stateProvider
      .state('team', {
        url: '/team',
        templateUrl: 'app/team/team.html',
        controller: 'TeamCtrl'
      });
});//config ends
