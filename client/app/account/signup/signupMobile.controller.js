'use strict';

angular.module('keepballin')
  .controller('SignupMobileCtrl', ['$scope', '$state', 'Auth', '$location', '$window', 'socket', 'roomId', function ($scope, $state, Auth, $location, $window, socket, roomId) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, tell server that user has login
          var userNow = Auth.getCurrentUser().$promise;
          userNow.then(function(user) {
            socket.socket.emit('login', {userId: user._id, userName: user.name});
            if(roomId) {
              // If user previously clicked on chat room, then enter
              $state.go('chat', {id: roomId});
            } else {
              $state.go('main');
            }
          });
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);
