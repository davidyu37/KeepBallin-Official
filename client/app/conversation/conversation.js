'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('conversation', {
        url: '/conversation',
        templateUrl: 'app/conversation/conversation.html',
        controller: 'ConversationCtrl'
      });
  });