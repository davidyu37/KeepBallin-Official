'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
  
    $stateProvider
      .state('courts', {
        url: '/courts/:id',
        resolve: {
        	chosenCourt: ['$stateParams', 'Court', function($stateParams, Court) {
        		if($stateParams.id) {
	        		return [Court.get({id: $stateParams.id})];
        		} else {
        			return Court.query();
        		}
        	}]
        },
        templateUrl: 'app/courts/courts.html',
        controller: 'CourtsCtrl'
      });
  });