'use strict';

angular.module('keepballin')
  .controller('ResetCtrl', ['$scope', 'Auth', 'token', 'tokenUser', 'User', 'SweetAlert', '$state', function ($scope, Auth, token, tokenUser, User, SweetAlert, $state) {
   
    if(tokenUser.expired) {
      $scope.expired = true;
    }

    $scope.user = tokenUser;
    
    $scope.submitted = false;

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if($scope.password !== $scope.confirmPassword) {
        $scope.notSame = true;
        return;
      } else {
        if(form.$valid) {
          $scope.sending = true;
          User.resetPw({ token: token }, { password: $scope.password }, function(data) {
            $scope.sending = false;
            SweetAlert.swal({
              title: '密碼更改成功',
              type: 'success',
              confirmButtonColor: '#DD6B55',   
              confirmButtonText: '好',
              timer: 5000
            });
            $state.go('login');
          });
        } else {
          return;
        }
      }
    };

    
  }]);
