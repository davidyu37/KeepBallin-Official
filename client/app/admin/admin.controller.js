'use strict';

angular.module('keepballin')
  .controller('AdminCtrl', ['$scope', '$window', '$http', 'Auth', 'User', '$modal', function ($scope, $window, $http, Auth, User, $modal) {

    // Use the User $resource to fetch all users
    $scope.users = User.adminGet();
    $scope.open = false;

    $scope.delete = function(user) {
      var check = $window.confirm('確定要刪嗎？');
      if (check) {   
        User.remove({ id: user._id });
        angular.forEach($scope.users, function(u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      } else {
        return;
      }
    };

    $scope.edit = function(user) {
      console.log(user);
      user.open = !(user.open);
    };
    
    $scope.send = function(user) {
      user.open = !(user.open);
      User.changeRole({id: user._id}, {role: user.role});
    };

    $scope.showCourts = function(index) {
      $scope.userNow = $scope.users[index];
      $modal.open({
        templateUrl: 'app/admin/court.created.html',
        scope: $scope
      });
    };

    $scope.getEmail = function() {
      $modal.open({
        templateUrl: 'app/admin/email.html',
        scope: $scope
      });
    }

  }]);
