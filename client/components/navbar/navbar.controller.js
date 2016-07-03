'use strict';

angular.module('keepballin')
  .controller('NavbarCtrl', ['$rootScope', '$scope', '$location', '$window', '$state', 'Auth', 'socket', function ($rootScope, $scope, $location, $window, $state, Auth, socket) {

    $scope.menu = [
    {
      'title': '籃球場',
      'link': 'courts',
      'icon': 'glyphicon-map-marker'
    },
    {
      'title': '球隊',
      'link': 'team',
      'icon': 'glyphicon-user'
    },
    // {
    //   'title': '球友',
    //   'link': 'teammate',
    //   'icon': 'glyphicon-fire'
    // },
    {
      'title': '室內籃球場',
      'link': 'indoor',
      'icon': 'glyphicon-home'
    }
    ];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isManager = Auth.isManager;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.showAlert = false;

    // Check if user is created a rental court
    $scope.hasCourt = Auth.hasCourt;

    $scope.logout = function() {
      var userNow = Auth.getCurrentUser().$promise;
      userNow.then(function(user) {
        socket.logout(user);
        Auth.logout();
        $state.go('main');
      });
    };

    socket.checkLogout();

    $scope.isActive = function(route) {
      return route === $state.current.name;
    };

    //If user is login, go to rent page
    $scope.goToRent = function() {
      if(Auth.isLoggedIn()) {
        $state.go('rent');
      } else {
        $state.go('login');
      }
    };

    $scope.goToPoint = function() {
      if(Auth.isLoggedIn()) {
        $state.go('settings',{choice: 1});
      } else {
        $state.go('login');
      }
    };

    //Manage rental court
    $scope.manageCourt = function() {
      $state.go('viewrent');
    };

    $scope.close = function() {
      $scope.isCollapsed = true;
    };

  }]);