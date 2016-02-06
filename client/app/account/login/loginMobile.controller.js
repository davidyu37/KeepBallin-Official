'use strict';

angular.module('keepballin')
  .controller('LoginMobileCtrl', ['$scope', '$state', 'Auth', '$location', '$window', 'SweetAlert', 'roomId', function ($scope, $state, Auth, $location, $window, SweetAlert, roomId) {
    $scope.user = {};
    $scope.errors = {};

    console.log(typeof roomId);

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

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);
