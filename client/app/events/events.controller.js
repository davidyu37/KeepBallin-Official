'use strict';

angular.module('keepballin')
  .controller('EventsCtrl', ['$scope', '$state', 'Auth', 'Event', 'socket', 'SweetAlert', '$filter', function ($scope, $state, Auth, Event, socket, SweetAlert, $filter) {

    $scope.createEvent = function() {
  		if(Auth.isLoggedIn()) {
  			$state.go('addevent', {court: $scope.$parent.currentcourt._id});
  		} else {
  			$state.go('login');
  		}
  	};

  	$scope.events = Event.query();

    //socket.io instant updates
    socket.syncUpdates('event', $scope.events);
      $scope.$on('$destroy', function () {
            socket.unsyncUpdates('event');
    });

    $scope.isParticipating = function(index) {
      for(var i=0; i < $scope.events[index].participants.length; i++) {
        if($scope.events[index].participants[i]._id === Auth.getCurrentUser()._id) { 
          return true;
        }
      }
    };
    

    //Join as a participant if user is logged in
    $scope.join = function(index) {

      if(Auth.isLoggedIn()) {
        for(var i=0; i < $scope.events[index].participants.length; i++) {
          if($scope.events[index].participants[i]._id === Auth.getCurrentUser()._id) {
            return;
          }
        }

        var newArr = [];
        //Get id of the current participants
        for(var j=0; j < $scope.events[index].participants.length; j++) {
          //Put them in a new array
          newArr.push($scope.events[index].participants[j]._id);
        }
        //push the current user id to the new array
        newArr.push(Auth.getCurrentUser()._id);

        //Update event model
        Event.update({id: $scope.events[index]._id}, {participants: newArr}, function() {
            
          var formatTime = $filter('date')($scope.events[index].begin, 'short');

          SweetAlert.swal({
            title: $scope.events[index].name + '加入成功',
            text: '<p>開始時間：' + formatTime + '</p><p>地點：' + $scope.events[index].location + '</p>',
            type: 'success',
            html: true,
            confirmButtonColor: '#DD6B55',   
            confirmButtonText: 'Ok'
          });
        });
      } else {
        $state.go('login');
      }
    };

  }]);