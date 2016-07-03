'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, $urlRouterProvider) {
    
    $stateProvider
      .state('main', {
        url: '/brand',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        resolve: {
        	lobby: ['$q', 'Lobby', function($q, Lobby) {
	          var deferred = $q.defer();
	          Lobby.query(function(data){
	            deferred.resolve(data);
	          });
	          return deferred.promise;
	        }]
        }
      });
    $urlRouterProvider.otherwise('/');
});//config ends
