'use strict';

angular.module('keepballin')
  .controller('NavbarCtrl', ['$scope', '$window', '$location', 'Auth', 'Scroll', function ($scope, $window, $location, Auth, Scroll) {
    Scroll.scrollInit();
    $scope.menu = [{
      'title': '首頁',
      'link': '/',
      'icon': 'glyphicon-home'
    },
    {
      'title': '球場',
      'link': '/courts',
      'icon': 'glyphicon-map-marker'
    }
    // {
    //   'title': '球員',
    //   'link': '/players',
    //   'icon': 'glyphicon-user'
    // },
    // {
    //   'title': '球隊',
    //   'link': '/teams',
    //   'icon': 'glyphicon-flag'
    // },
    // {
    //   'title': '活動',
    //   'link': '/events',
    //   'icon': 'glyphicon-bullhorn'
    // }
    ];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.openLogin = function() {
     
    };

  }]);