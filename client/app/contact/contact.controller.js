'use strict';

angular.module('keepballin')
  .controller('ContactCtrl', ['$scope', '$http', 'SweetAlert', function ($scope, $http, SweetAlert) {
  	$scope.sending = false;
  	$scope.submitted = false;

    $scope.sendMail = function(form) {
    	//submitted lets the forms know that the user has submitted
    	$scope.submitted = true;
		
		if(form.$valid) {
			//Show spinner only when the form is valid
	    	$scope.sending = true;
	    	var mail = {
	    		name: $scope.name,
	    		email: $scope.email,
	    		comment: $scope.comment
	    	};
	    	//Send to backend
	    	$http.post('/api/contacts', mail).then(successCb, errorCb);

		} else {
			return;
		}


    	function successCb() {
    		//Alert the user that their suggestion has been sent
    		SweetAlert.swal({
				title: '感謝您的意見',
				text: '我們會用最短的時間回覆您',
				type: 'success',
				confirmButtonColor: '#DD6B55',   
				confirmButtonText: '瞭解了'
			});
			//Clear all the values and reset
    		$scope.name = '';
    		$scope.email = '';
    		$scope.comment = '';
    		$scope.sending = false;
    		$scope.submitted = false;
    		form.$setPristine();
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
    		$scope.comment = '';
    		$scope.sending = false;
    		$scope.submitted = false;
    		form.$setPristine();
    	}
    };
  }]);
