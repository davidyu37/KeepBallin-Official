'use strict';

angular.module('keepballin')
  .controller('ProfileCtrl', ['$scope', '$http', 'profile', function ($scope, $http, profile) {
  	$scope.profile = profile;
   	console.log(profile);

  }]);