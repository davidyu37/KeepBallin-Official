'use strict';

angular.module('keepballin')
  .controller('EventsCtrl', ['$scope', '$state', 'Auth', 'Event', function ($scope, $state, Auth, Event) {
  	$scope.createEvent = function() {
  		if(Auth.isLoggedIn()) {
  			$state.go('addevent', {court: $scope.$parent.currentcourt._id});
  		} else {
  			$state.go('login');
  		}
  	};

  	$scope.events = Event.query();

  	console.log($scope.events);
   	
  }]);