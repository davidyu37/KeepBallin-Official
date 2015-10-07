'use strict';

angular.module('keepballin')
  .controller('ProfileCtrl', ['$scope', '$http', 'Modal', 'profile', function ($scope, $http, Modal, profile) {
  	$scope.profile = profile;
   	console.log(profile);
  }]);