'use strict';

angular.module('keepballin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('payment-done', {
        url: '/payment/complete',
        templateUrl: 'app/checkout/payment.complete.html',
        controller: 'PaymentCtrl'
      })
      .state('checkout', {
        url: '/checkout/:points',
        templateUrl: 'app/checkout/checkout.html',
        controller: 'CheckoutCtrl',
        resolve: {
          points: ['$stateParams', function($stateParams) {
            return $stateParams.points;
          }]
        }
      });
  });