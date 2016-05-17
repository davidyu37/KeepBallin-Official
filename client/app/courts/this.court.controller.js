'use strict';

angular.module('keepballin')
	.controller('ThisCourtCtrl', ['$scope', '$animate', '$timeout', 'socket', 'Court', 'Auth', 'Lightbox', '$modal', 'chosenCourt', 'modalState', '$state', 'SweetAlert', 'Download',
		function ($scope, $animate, $timeout, socket, Court, Auth, Lightbox, $modal, chosenCourt, modalState, $state, SweetAlert, Download) {
			
			$scope.isAdmin = Auth.isAdmin();
	    	$scope.isManager = Auth.isManager();
			$scope.isLoggedIn = Auth.isLoggedIn;
			// $scope.readonly = true;
			chosenCourt.$promise.then(function(data){
				$scope.currentcourt = data;
				
				//Show google map for the court
			  	$scope.courtMap = new google.maps.Map(document.getElementById('courtMap'), {
			  		//map options
			  		center: new google.maps.LatLng(data.lat, data.long),
					zoom: 15,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					disableDefaultUI: true,
					scrollwheel: false
			  	});

			  	//custom marker image
			  	var image = {
					url: '../assets/images/basket.png',
					size: new google.maps.Size(35, 60),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(17, 60),
					scaledSize: new google.maps.Size(35, 60)
				};

				new google.maps.Marker({
					map: $scope.courtMap,
					position: new google.maps.LatLng(data.lat, data.long),
					icon: image, 
					animation: google.maps.Animation.DROP
				});

			});
			
			//Change text of fb share to chinese
	    	var fbBtn = document.getElementsByClassName('pluginButtonLabel');
	    	for(var i=0; i < fbBtn.length; i ++) {
		    	fbBtn[i].innerHTML = '分享';
	    	}

			$scope.$on('ratingSaved', function() {
				Court.get({id: $scope.currentcourt._id}, function(data) {
					$scope.currentcourt = data;
				});
			});
			//Show all the rates to the court
			$scope.openRates = function() {
				$modal.open({
					animation: true,
					templateUrl: 'app/rating/rating.show.html',
					scope: $scope,
					size: 'lg',
					controller: 'ratingShowCtrl'
				});	
			};

			$animate.enabled(false);
	    	$timeout(function () {
	        	$animate.enabled(true);
	    	}, 1000);

			//Open edit page
			$scope.editmode = function(court) {
				if(Auth.getCurrentUser().name) {
					$scope.edit = !($scope.edit);
		    		if(court) {
		    			console.log(court);
		    			Court.update({ id: court._id }, court);
		    		}
				} else {
					$state.go('login');
					return;
				}	
	    	};
	    	//For the x button inside of edit page
	    	$scope.exitEdit = function() {
	    		$scope.edit = !($scope.edit);
	    	};

	    	//Prevent click event propagate
	    	$scope.stopPropagate = function(event) {
    			event.stopPropagation();
    		};

    		//Open upload picture page
	    	$scope.uploadmode = function() {
	    		if(Auth.getCurrentUser().name) {
					$scope.upload = !($scope.upload);
				} else {
					$state.go('login');
					return;
				}
	    	};

	    	//Lightbox
		    $scope.openLightboxModal = function (index) {
		        Lightbox.openModal($scope.currentcourt.pictures, index);
		    };
		    //Update courts when pictures uploaded
		    $scope.$on('courtPicUploaded', function() {
		    	var getAgain = Court.get({id: $scope.currentcourt._id}).$promise;
		    	getAgain.then(function(data) {
		    		$scope.currentcourt = data;
		    	});
		    });

			$scope.openGallery = function() {
				$modal.open({
					animation: true,
					templateUrl: 'app/courts/temp/pictures.html',
					scope: $scope,
					size: 'lg',
					controller: 'GalleryCtrl'
				});	
			};

			//isUploader check if the user is the person who uploaded the picture
			$scope.isUploader = function(index) {
				if(Auth.getCurrentUser()._id === $scope.currentcourt.pictures[index].user._id) {
					return true;
				} else {
					return false;
				}
			};

		    //Delete picture
		    $scope.removePic = function(pic) {
		    	SweetAlert.swal({   
    			title: '你確定要刪除?',   
    			text: '按下確定後，就無法走回頭路囉',   
    			type: 'warning',   
    			showCancelButton: true,   
    			confirmButtonColor: '#DD6B55',   
    			confirmButtonText: '確定',
    			cancelButtonText: '取消',
    			showLoaderOnConfirm: true,   
    			closeOnConfirm: false }, function(confirmed){
    				if(confirmed) {
	    				Download.delete({ id: pic._id }, function(){
	    					
		 					var getAgain = Court.get({id: $scope.currentcourt._id}).$promise;
					    	getAgain.then(function(data) {
					    		$scope.currentcourt = data;
					    		SweetAlert.swal('已刪除!', 
		    					'乾淨溜溜', 
		    					'success');
						    });
		            	});   
	    				
    				} else {
    					return;
    				}
    			});    
		    };//removePic func ends

	    	
	}]);