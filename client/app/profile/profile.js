'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profile', {
        url: '/profile/:id',
        resolve: {
        	profile: ['$stateParams', 'User', function($stateParams, User) {
        		return User.getUser({id: $stateParams.id});
        	}]
        },
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileCtrl'
      });
  });