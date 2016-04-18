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
			thisIndoor: ['$stateParams', 'Indoor', function($stateParams, Indoor) {
					return Indoor.getPublic({id: $stateParams.id}, function(data) {
						return data;
					});  
				}]
			},
			templateUrl: 'app/indoor/temp/individual.rental.html',
			controller: 'IndividualIndoor'
		})
  });
