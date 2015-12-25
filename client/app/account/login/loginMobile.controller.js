'use strict';

angular.module('keepballin')
  .controller('LoginMobileCtrl', ['$scope', '$state', 'Auth', '$location', '$window', 'SweetAlert', function ($scope, $state, Auth, $location, $window, SweetAlert) {
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
          // Logged in, redirect to home
          $state.go('main');
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
