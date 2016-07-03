'use strict';

angular.module('keepballin')
  .controller('SettingsCtrl', ['$scope', 'Auth', 'choice', function ($scope, Auth, choice) {
    $scope.errors = {};
    $scope.settingUrl = '';
    $scope.profile = true;

    $scope.userNow = Auth.getCurrentUser();
    $scope.getTemplate = function(temp) {
      $scope.profile = false;
      $scope.team = false;
      $scope.points = false;
      $scope.court = false;
      $scope.reservation = false;
      var which = 'active' + temp;
      $scope[which] = true;
      switch (temp) {
        case 0: $scope.profile = true;
        break;
        case 1: $scope.points = true;
        break;
        // case 2: $scope.team = true;
        // break;
        case 2: $scope.court = true;
        break;
        case 3: $scope.reservation = true;
        break;
      }
    };

    if(choice) {
      var num = Number(choice);
      $scope.getTemplate(num);
    }

    $scope.showSignup = false;

    $scope.showToggle = function() {
        $scope.showSignup = !($scope.showSignup);    
    };
    
    $scope.stopPropagate = function(event) {
      event.stopPropagation();
    };


    
  }]);
