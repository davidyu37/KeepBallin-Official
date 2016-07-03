'use strict';

angular.module('keepballin')
  .controller('PaymentCtrl', ['$scope', 'User', function ($scope, User) {
  	User.get(function(user) {
  		$scope.user = user;
  	});
    
  }]);
