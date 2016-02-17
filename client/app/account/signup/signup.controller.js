'use strict';

angular.module('keepballin')
  .controller('SignupCtrl', ['$scope', '$state', 'Auth', '$location', '$window', '$modalInstance', function ($scope, $state, Auth, $location, $window, $modalInstance) {
    $scope.user = {};
    $scope.errors = {};
    // $scope.user.toVip = false;

    // var policy = '球場管理員擁有增加，編輯球場資訊的權利．';
    // policy += '<h4>使用須知與條款</h4><hr>';
    // policy += '<div class="policyPop"><ol><li>為了維護資訊的正確性，KeepBallin保有編輯或刪除之權利．</li>';
    // policy += '<li>如有任何惡意行為，KeepBallin保有暫時停止球場管理員之權利．</li>';
    // policy += '<li>成為球場管理員同時，您同意提供正確並妥當的球場資訊，</li>';
    // policy += '<li>其他球場管理員擁有同樣權利能編輯您創造的球場地點</li>';
    // policy += '<li>球場管理員並無任何法律上定義上的土地或不動產擁有權</li>';
    // policy += '</ol></div>';

    // $scope.explain = function() {

    //   SweetAlert.swal({
    //     title: '何謂球場管理員',
    //     text: policy,
    //     confirmButtonText: '瞭解了',
    //     confirmButtonColor: '#E6471C',
    //     html: 'true'

    //   });
    
    // };

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Account created, redirect to home
          // $location.path('/');
          $modalInstance.close();
          $state.go($state.current, {}, {reload: true});
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

    $scope.closeModal = function() {
      $modalInstance.close();
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);
