'use strict';

angular.module('keepballin')
	.controller('ThisCourtCtrl', ['$scope', '$animate', '$timeout', 'socket', 'Court', 'Auth', 'Lightbox', '$modal', 'chosenCourt',  
		function ($scope, $animate, $timeout, socket, Court, Auth, Lightbox, $modal, chosenCourt) {
			
			$scope.isLoggedIn = Auth.isLoggedIn;

			chosenCourt.$promise.then(function(data){
				$scope.currentcourt = data;
				//Show google map for the court
			  	$scope.courtMap = new google.maps.Map(document.getElementById('courtMap'), {
			  		//map options
			  		center: new google.maps.LatLng(data.lat, data.long),
					zoom: 15,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					disableDefaultUI: true
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

			$animate.enabled(false);
	    	$timeout(function () {
	        	$animate.enabled(true);
	    	}, 1000);

			//Open edit page
			$scope.editmode = function(court) {
	    		$scope.edit = !($scope.edit);
	    		if(court) {
	    			// console.log(court);
	    			Court.update({ id: court._id }, court);
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
	    		$scope.upload = !($scope.upload);
	    	};

	}]);