'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('sendmail', {
        url: '/sendmail',
        templateUrl: 'app/sendmail/sendmail.html',
        controller: 'SendmailCtrl'
      });
  });