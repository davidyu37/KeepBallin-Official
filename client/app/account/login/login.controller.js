'use strict';

angular.module('keepballin')
  .controller('LoginCtrl', ['$scope', '$state', 'Auth', '$location', '$window', '$modalInstance', function ($scope, $state, Auth, $location, $window, $modalInstance) {
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
          $modalInstance.close();
          //Reload the whole page in order for google map to show the correct icon
          $window.location.reload();
        })
        .catch( function(err) {
          console.log(err);
          $scope.errors.other = err.message;
          $modalInstance.close();
          $window.alert(err.message);
        });
      }
    };

    $scope.closeModal = function() {
      $modalInstance.close();
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);
