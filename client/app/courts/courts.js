'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, modalStateProvider) {
  
    $stateProvider
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

    // modalStateProvider.state('thiscourt.picture', {
    //   templateUrl: 'app/courts/temp/pictures.html',
    //   size: 'lg',
    //   resolve: {
    //     chosenCourt: ['$stateParams', 'Court', function($stateParams, Court) {
    //       return Court.get({id: $stateParams.id});
    //     }]
    //   }, 
    //   controller: 'ThisCourtCtrl'
    // });

  });//end of config