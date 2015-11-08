'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
  
    $stateProvider
      // .state('courts', {
      //   url: '/courts/:id',
      //   resolve: {
      //   	chosenCourt: ['$stateParams', 'Court', function($stateParams, Court) {
      //   		if($stateParams.id) {
	     //    		return Court.getOne({id: $stateParams.id});
      //   		} else {
      //   			return Court.query();
      //   		}
      //   	}]
      //   },
      //   templateUrl: 'app/courts/courts.html',
      //   controller: 'CourtsCtrl'
      // })
      .state('courts', {
        url: '/courts',
        templateUrl: 'app/courts/courts.html',
        controller: 'CourtsCtrl'
      })
      .state('thiscourt', {
        url: '/courts/:id',
        resolve: {
          chosenCourt: ['$stateParams', 'Court', function($stateParams, Court) {
            return Court.get({id: $stateParams.id});
          }]
        },
        templateUrl: 'app/courts/temp/this.court.html',
        controller: 'ThisCourtCtrl'
      })
      .state('thiscourt.comment', {
        templateUrl: 'app/comments/comments.html',
        controller: 'CommentCtrl'
      });

  });//end of config