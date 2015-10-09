'use strict';

angular.module('keepballin')
  .controller('ManagerCtrl', function ($scope, $http, Auth, User) {


    // Use the User $resource to fetch all users
    $scope.users = User.managerGet();

    $scope.open = false;

    $scope.edit = function(user) {
      console.log(user);
      user.open = !(user.open);
    };
    
    $scope.send = function(user) {
      user.open = !(user.open);
      User.changeRole({id: user._id}, {role: user.role});
    };

  });
