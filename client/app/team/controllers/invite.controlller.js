'use strict';

angular.module('keepballin')
  .controller('InviteCtrl', ['$scope', 'Auth', '$modalInstance', '$http', 'SweetAlert', function ($scope, Auth, $modalInstance, $http, SweetAlert) {
  	$scope.name = Auth.getCurrentUser().name;
  	$scope.email = Auth.getCurrentUser().email;

  	$scope.close = function() {
  		$modalInstance.close();
  	};

  	$scope.sendMail = function(form) {
    	//submitted lets the forms know that the user has submitted
    	$scope.submitted = true;
		
		if(form.$valid) {
			//Show spinner only when the form is valid
	    	$scope.sending = true;
	    	var mail = {
	    		name: $scope.name,
	    		from: $scope.email,
	    		to: $scope.team.contactperson.email,
	    		message: $scope.message
	    	};

	    	// Send to backend
	    	$http.post('/api/contacts/invite', mail).then(successCb, errorCb);

		} else {
			return;
		}


    	function successCb() {
    		//Alert the user that their suggestion has been sent
    		SweetAlert.swal({
				title: '已寄出',
				text: '請等待'+ $scope.team.name + '回覆',
				type: 'success',
				confirmButtonColor: '#DD6B55',   
				confirmButtonText: '瞭解了'
			});
			//Clear all the values and reset
    		$scope.name = '';
    		$scope.email = '';
    		$scope.message = '';
    		$scope.sending = false;
    		$scope.submitted = false;
    		form.$setPristine();

    		$modalInstance.close();
    	}

    	function errorCb() {
    		SweetAlert.swal({
				title: '喔NO~',
				text: '網路上出了些問題，請麻煩再試一次',
				type: 'warning',
				confirmButtonColor: '#DD6B55',   
				confirmButtonText: '瞭解了'
			});
			$scope.name = '';
    		$scope.email = '';
    		$scope.message = '';
    		$scope.sending = false;
    		$scope.submitted = false;
    		form.$setPristine();

    		$modalInstance.close();
    	}
    };
  }]);