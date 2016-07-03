'use strict';

angular.module('keepballin')
  .controller('CheckinCtrl', ['$scope', 'populatedIndoor', 'Reservation', 'SweetAlert', '$filter', function ($scope, populatedIndoor, Reservation, SweetAlert, $filter) {
    $scope.reservations = populatedIndoor.reservation;

    //Check in and check out user
    $scope.displayReserve = function(r) {
      if(r._id) {
        $scope.showReservation = true;
        $scope.chosenReserve = Reservation.get({id: r._id});
      }
    };

    $scope.enterCourt = function(code) {
      if(code) {
        Reservation.checkIn({id: $scope.chosenReserve._id, confirmationCode: code}, function(data) {
          if(data.error === 'incorrect') {
            SweetAlert.swal({
              title: '驗證碼錯誤',
              type: 'warning',
              confirmButtonColor: '#DD6B55',   
              confirmButtonText: '好',
              timer: 5000
            });
          } else {
            $scope.chosenReserve = data;
            var checkInTime = $filter('date')(data.checkInTime, 'shortTime');
            SweetAlert.swal({
              title: data.whoReserved + '入場',
              text: checkInTime,
              type: 'success',
              confirmButtonColor: '#DD6B55',   
              confirmButtonText: '好',
              timer: 5000
            });
          }
        });//Reservation.checkIn ends
      } else {
        return;
      }
    };

    $scope.checkOut = function() {
      $scope.sending = true;
      Reservation.checkOut({id: $scope.chosenReserve._id}, function(data) {
        $scope.chosenReserve = data;
        var checkOutTime = $filter('date')(data.checkOutTime, 'shortTime');
        $scope.sending = false;
        SweetAlert.swal({
          title: data.whoReserved + '離場',
          text: checkOutTime,
          type: 'success',
          confirmButtonColor: '#DD6B55',   
          confirmButtonText: '好',
          timer: 5000
        });
      });
    };

  }]);
