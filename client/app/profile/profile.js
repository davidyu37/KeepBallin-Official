'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, modalStateProvider) {
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

    modalStateProvider.state('profile.send', {
      url: '/send/:id',
      templateUrl: 'app/sendmail/sendmail.html',
      resolve: {
        profile: ['$stateParams', 'User', function($stateParams, User) {
          return User.getUser({id: $stateParams.id});
        }]
      },
      controller: 'SendmailCtrl'
    });
  });