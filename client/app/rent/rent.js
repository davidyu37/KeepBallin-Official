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
          thisCourt: ['$stateParams', 'Indoor', '$q', function($stateParams, Indoor, $q) {
            var defer = $q.defer();
            Indoor.getPopulated({id: $stateParams.id}, function(data) {
              defer.resolve(data);
            });  
            return defer.promise;
          }],
          timeslots: ['$stateParams', 'Timeslot', '$q', function($stateParams, Timeslot, $q) {
            var defer = $q.defer();
            Timeslot.getByCourtId({ id: $stateParams.id }, function(data) {
              defer.resolve(data);
            }); 
            return defer.promise; 
          }]
        },
      	controller: 'RentEditCtrl'
      })
      .state('viewrent', {
        url: '/viewrent',
        templateUrl: 'app/rent/view.rentals.html',
        //Resolve rental court before entering
        resolve: {
          usersCourts: ['User', function(User) {
            return User.getRentals();  
          }]
        },
        controller: 'ViewRentalsCtrl'
      })
  });
