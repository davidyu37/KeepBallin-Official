'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, modalStateProvider) {
    $stateProvider
      .state('forgot', {
        url: '/forgot',
        templateUrl: 'app/forgot/forgotpw.html',
        controller: 'ForgotCtrl'
      });
  });