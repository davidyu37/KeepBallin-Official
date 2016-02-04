

angular.module('keepballin')
  .controller('LoginCtrl', ['$scope', '$state', 'Auth', '$location', '$window', '$modalInstance', 'SweetAlert', 'socket', function ($scope, $state, Auth, $location, $window, $modalInstance, SweetAlert, socket) {
    $scope.user = {};
    $scope.errors = {};
    var socket = socket.socket;

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function(data) {
          // Logged in, tell server that user has login
          var userNow = Auth.getCurrentUser().$promise;
          userNow.then(function(user) {
            socket.emit('login', {userId: user._id, userName: user.name});
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

    $scope.closeModal = function() {
      $modalInstance.close();
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);
