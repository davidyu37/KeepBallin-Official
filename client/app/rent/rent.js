'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rent', {
        url: '/rent',
        templateUrl: 'app/rent/rent.html',
        controller: 'RentCtrl'
      })
      .state('rentedit', {
      	url: '/rentedit/:id',
      	templateUrl: 'app/rent/rentedit.html',
      	//Resolve rental court before entering
      	resolve: {
          thisCourt: ['$stateParams', 'Indoor', function($stateParams, Indoor) {
            return Indoor.get({id: $stateParams.id});  
          }]
        },
      	controller: 'RentEditCtrl'
      })
  });
