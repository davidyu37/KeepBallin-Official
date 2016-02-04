'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('teammate', {
        url: '/teammate',
        templateUrl: 'app/teammate/teammate.html',
        controller: 'TeammateCtrl',
        resolve: {
         rooms: ['Chat', function(Chat) {
           return Chat.query();
         }]
        }
      })
      .state('chat', {
      	url: '/chat/:id',
      	templateUrl: 'app/teammate/chatGroup.html',
        controller: 'ChatCtrl',
      	resolve: {
        	room: ['$stateParams', 'Chat', '$q', function($stateParams, Chat, $q) {
            var deferred = $q.defer();
            Chat.enter({chatRoomId: $stateParams.id}, function(r) {
              deferred.resolve(r);
            });
            return deferred.promise;
        	}]
        }
      });
  });
