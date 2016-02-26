'use strict';

angular.module('keepballin')
  .controller('LoginMobileCtrl', ['$scope', '$state', 'Auth', '$location', '$window', 'SweetAlert', 'roomId', function ($scope, $state, Auth, $location, $window, SweetAlert, roomId) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          if(roomId) {
            // If user previously clicked on chat room, then enter
            $state.go('chat', {id: roomId});
          } else {
            // Logged in, redirect to home
            $state.go('main');
          }
        })
        .catch( function(err) {
          console.log(err);
          $scope.errors.other = err.message;
        });
      }
    };

    //Mobile doesnt close modal, but change state to sign up
    $scope.closeModal = function(condition) {
      if(condition == 'toSignUp') {
        if(roomId) {
          var sendToSignUp = {
            roomId: roomId
          };
          $state.go('signup', sendToSignUp);
        } else {
          $state.go('signup')
        }
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

    $scope.forgotPw = function() {
      $state.go('forgot');
    };
    
  }]);
