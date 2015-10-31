'use strict';

angular.module('keepballin')
  .config(function ($stateProvider, modalStateProvider) {
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
      modalStateProvider.state('thisevent.upload', {
        url: '/upload',
        templateUrl: 'app/uploads/upload.temp.html',
        resolve: {
          thisEvent: ['$stateParams', 'Event', function($stateParams, Event) {
            return Event.get({id: $stateParams.event});  
          }]
        },
        controller: 'EventUploadCtrl'
      });
  });