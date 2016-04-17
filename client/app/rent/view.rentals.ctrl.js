'use strict';

angular.module('keepballin')
  .controller('ViewRentalsCtrl', ['$scope', 'Auth', 'Indoor', '$state', 'usersCourts', function ($scope, Auth, Indoor, $state, usersCourts) {
  	$scope.courts = usersCourts;

  }]);
