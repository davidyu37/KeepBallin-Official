'use strict';

angular.module('keepballin')
  .controller('ReservationThisCtrl', ['$scope', 'reservation', '$modal', 'socket', 'Reservation', function ($scope, reservation, $modal, socket, Reservation) {

    $scope.res = reservation;

    var courts = [];
    
    reservation.timeslot.forEach(function(slot) {
        //Prevent duplicated socket for the same court
        if(courts.indexOf(slot.courtReserved) < 0) {
            courts.push(slot.courtReserved);

            socket.updateTimeslots('timeslot' + slot.courtReserved, $scope.res.timeslot, function() {
                Reservation.get({id: $scope.res._id}, function(data) {
                    //update the reservation
                    $scope.res = data;
                });
            });
            
            $scope.$on('$destroy', function () {
                socket.stopUpdateTimeslots('timeslot' + slot.courtReserved);
            });  
        }
    });

    socket.syncUpdates('reservation' + $scope.res._id, [], function(event, item, array) {
        console.log('reservation updated');
        $scope.res = item;
    });
    
    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('reservation' + $scope.res._id);
    });  

    $scope.openTimeslot = function(slot) {
        $modal.open({
            templateUrl: 'app/indoor/temp/timeslot.info.html',
            size: 'md',
            controller: 'TimeslotCtrl',
            resolve: {
                theEvent: function() {
                    return slot;
                }
            }
        });
    };   

  }]);
