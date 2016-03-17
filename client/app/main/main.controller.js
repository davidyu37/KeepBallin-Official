'use strict';

angular.module('keepballin')
  .controller('MainCtrl', ['$scope', 'lobby', 'socket', function ($scope, lobby, socket) {
    if(lobby[0]) {
        $scope.numberOfUsers = lobby[0].userOnline.length;
    }

    //When a user joins the global chat room
    // Object.keys(data.users).length;
    socket.getUsersOnline($scope.usersOnline, function(users) {
        $scope.numberOfUsers = users.length;
    });

  }]);
