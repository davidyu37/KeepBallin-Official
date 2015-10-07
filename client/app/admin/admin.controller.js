'use strict';

angular.module('keepballin')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.open = false;

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.edit = function(user) {
      console.log(user);
      user.open = !(user.open);
    };
    
    $scope.send = function(user) {
      user.open = !(user.open);
      User.changeRole({id: user._id}, {role: user.role});
    };

  });
