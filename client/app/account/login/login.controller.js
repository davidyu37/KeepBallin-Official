'use strict';

angular.module('keepballin')
  .controller('LoginCtrl', ['$scope', '$state', 'Auth', '$location', '$window', '$modalInstance', 'SweetAlert', 'socket', 'roomId', function ($scope, $state, Auth, $location, $window, $modalInstance, SweetAlert, socket, roomId) {
    $scope.user = {};
    $scope.errors = {};
    // var socket = socket.socket;

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, tell server that user has login
          var userNow = Auth.getCurrentUser().$promise;
          userNow.then(function(user) {
            // socket.reconnect();
            socket.socket.emit('login', {userId: user._id, userName: user.name});
            if(roomId.roomId) {
              // If user previously clicked on chat room, then enter
              $state.go('chat', {id: roomId.roomId});
            }
          });
          $modalInstance.close();
        })
        .catch( function(err) {
          console.log(err);
          $scope.errors.other = err.message;
          $modalInstance.close();
          SweetAlert.swal({
            title: err.message,
            type: 'warning',
            confirmButtonColor: '#DD6B55',   
            confirmButtonText: '再試一次',
            timer: 2000
          });
        });
      }
    };

    $scope.closeModal = function(condition) {
      if(condition == 'toSignUp') {
        if(roomId.roomId) {
          var sendToSignUp = {
            'roomId': roomId.roomId
          };
          $state.go('signup', sendToSignUp);
        } else {
          $state.go('signup')
        }
      }
      $modalInstance.close();
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

    $scope.forgotPw = function() {
      $modalInstance.close();
      $state.go('forgot');
    };

  }]);
