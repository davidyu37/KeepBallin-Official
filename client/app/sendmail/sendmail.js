'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, modalStateProvider) {
    $stateProvider
      .state('sendmail', {
        url: '/sendmail',
        templateUrl: 'app/sendmail/sendmail.html',
        controller: 'SendmailCtrl'
      });
  });