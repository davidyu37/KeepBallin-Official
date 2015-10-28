'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, modalStateProvider) {
  	var emptyArr = [];
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
 //      modalStateProvider.state('courts.share', {
	// 	url: '/share/:id',
	// 	templateUrl: 'app/share/share.html',
	// 	resolve: {
	//         court: ['$stateParams', 'Court', function($stateParams, Court) {
 //            console.log($stateParams);
	//           return Court.get({id: $stateParams.id});
	//         }]
 //      },
 //      controller: 'ShareCtrl'
	// });
  });