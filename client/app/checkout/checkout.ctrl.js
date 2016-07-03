'use strict';

angular.module('keepballin')
  .controller('CheckoutCtrl', ['$scope', 'points', 'Checkout', '$timeout', function ($scope, points, Checkout, $timeout) {
    $scope.points = points;
    $timeout(function() {
	    Checkout.save({points: points}, function(data) {
	      $scope.allPay = data.html;
	    });
    });
  }]);
