'use strict';

angular.module('keepballin')
  .controller('ForgotCtrl', ['$scope', '$state', 'Auth', 'SweetAlert', 'User', function ($scope, $state, Auth, SweetAlert, User) {
   
    angular.element('#pwEmail').focus();

    $scope.sendMail = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        $scope.sending = true;
        User.forgot({email: $scope.email}, function(data) {
          if(data.nonExist) {
            SweetAlert.swal({
              title: '還沒有這個Email',
              text: $scope.email,
              type: 'warning',
              confirmButtonColor: '#DD6B55',   
              confirmButtonText: '再試一次',
              timer: 3000
            });
            $scope.sending = false;
            return;
          } else if(data.name) {
            SweetAlert.swal({
              title: data.name + ', 請看您的Email',
              text: '已寄信至: ' + $scope.email + '\n快去看吧',
              type: 'success',   
              confirmButtonText: '好喔'
            });
            $scope.sending = false;
            return;
          } else {
            $scope.sending = false;
            return;
          }
        });
      }
    };
    

  }]);