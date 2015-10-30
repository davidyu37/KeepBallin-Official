'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('events', {
        url: '/events',
        templateUrl: 'app/events/events.html',
        controller: 'EventsCtrl'
      })
      .state('addevent', {
      	url:'/addevent/:court',
      	resolve: {
        	thisCourt: ['$stateParams', 'Court', function($stateParams, Court) {
        	
	        	return Court.get({id: $stateParams.court});
        		
        	}]
        },
      	templateUrl: 'app/events/events.add.html',
      	controller: 'AddEventsCtrl'
      })
      .state('thisevent', {
        url:'/thisevent/:event',
        resolve: {
          thisEvent: ['$stateParams', 'Event', function($stateParams, Event) {
            return Event.get({id: $stateParams.event});  
          }]
        },
        templateUrl: 'app/events/events.this.html',
        controller: 'IndividualEvent'
      });
  });