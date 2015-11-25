'use strict';

angular.module('keepballin')
  .controller('NavbarCtrl', ['$rootScope', '$scope', '$location', '$window', '$state', 'Auth', 'Scroll', 'socket', '$timeout', function ($rootScope, $scope, $location, $window, $state, Auth, Scroll, socket, $timeout) {
    
    // if(screen.width > 480) {
    //   Scroll.scrollInit();
    // }

    $scope.menu = [
    {
      'title': '球場',
      'link': 'courts',
      'icon': 'glyphicon-map-marker'
    },
    {
      'title': '球隊',
      'link': 'team',
      'icon': 'glyphicon-user'
    },
    {
      'title': '聯絡',
      'link': 'contact',
      'icon': 'glyphicon-envelope'
    }
    ];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isManager = Auth.isManager;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.showAlert = false;

    socket.socket.on('conversation:save', function(convo) {
      
      var messages = convo.messages;//array of messages

      //If the new message is from self, don't do anything
      if(messages[messages.length-1].from._id === $scope.getCurrentUser()._id) {
        return;
      } else {
        var message = messages[messages.length-1];
        $scope.from = message.from.name;
        $scope.words = message.message;
        $scope.showAlert = true;
        $timeout(function(){ 
          $scope.showAlert = false;
        }, 3000);
      }
      
    });

    $scope.logout = function() {
      Auth.logout();
      $state.go('main');
    };

    $scope.isActive = function(route) {
      return route === $state.current.name;
    };

    $scope.openLogin = function() {
     
    };

    $scope.close = function() {
      $scope.isCollapsed = true;
    };

  }]);