'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
		.state('indoor', {
			url: '/indoor',
			templateUrl: 'app/indoor/indoor.html',
			controller: 'IndoorCtrl'
		})
		.state('thisindoor', {
			url:'/indoor/:id',
			resolve: {
			thisIndoor: ['$stateParams', 'Indoor', '$q', function($stateParams, Indoor, $q) {
					var defer = $q.defer();
					Indoor.getPublic({id: $stateParams.id}, function(data) {
						defer.resolve(data);
					});  
					return defer.promise;
				}]
			},
			templateUrl: 'app/indoor/temp/individual.rental.html',
			controller: 'IndividualIndoor'
		})
  });
