'use strict';

angular.module('keepballin')
	.controller('CourtsCtrl', ['$scope', '$http', '$window', '$animate', '$timeout', '$compile', 'socket', 'Panorama', 'mapOptions', 'Geolocate', 'AddMarker', 'Court', 'Auth',  
		function ($scope, $http, $window, $animate, $timeout, $compile, socket, Panorama, mapOptions, Geolocate, AddMarker, Court, Auth) {
	    
		//Initialize map
	    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	    var map = $scope.map;


	    //Panorama stuff from here
	    var panorama = map.getStreetView();
	    //Create an undefined var in order to check the current existence of the btn
	    var closeBtn;
	    //Declare google street view control
	    var streetViewControl = map.streetView.controls[google.maps.ControlPosition.RIGHT_CENTER];
	    //If user switch into panorama, add customized button, vice versa
	 	Panorama.addEvent(panorama, streetViewControl, closeBtn);
		//Panorama ends here

		//Authentication
		$scope.isLoggedIn = Auth.isLoggedIn();
	    $scope.isAdmin = Auth.isAdmin();
	    $scope.isManager = Auth.isManager();
	    $scope.isVip = Auth.isVip();
	    $scope.getCurrentUser = Auth.getCurrentUser();

		//Is the details of the court expanded?
		$scope.expanded = false;
		$scope.mobileExpaned = false;

		//Broadcast the currentcourt
		$scope.$watch('currentcourt._id', function(newVal) {
	        if(newVal) {
	        	$scope.$broadcast('courtIdChanged', {newId: newVal});
	        }
	    });

	    //Searchbox
	    $scope.availableSearchParams = [
		  { key: 'court', name: '球場名', placeholder: '球場名...' },
		  { key: 'city', name: '城市', placeholder: '城市...' },
		  { key: 'district', name: '區域', placeholder: '區域...' },
		  { key: 'address', name: '住址', placeholder: '住址...' }
		];

		$scope.noResult = false;
		$scope.gotResult = false;
		$scope.emptyField = false;

		$scope.searchCourt = function(params) {
			console.log(params);
			var hasParams = (params.query || params.court || params.city || params.district || params.address);
			if(hasParams === undefined) {
				$scope.emptyField = true;
				$timeout(function() {
					$scope.emptyField = false;
				}, 1000);
				return;
			} else {
				Court.search(params, function(data) {
					if(data.length === 0) {
						$scope.noResult = true;
						$timeout(function() {
							$scope.noResult = false;
						}, 1000);
					} else {
						$scope.courts = data;
						$scope.gotResult = true;
						$timeout(function() {
							$scope.gotResult = false;
						}, 1000);
					}
				});
			}
		};

		$scope.test = function(parent) {
			console.log('inside');
			console.log(parent);
		};

	    //Empty markers
	    $scope.markers = [];
	    //Info window stuff	
	    $scope.infowindow = new google.maps.InfoWindow();
	    //Store courts from api
	    $scope.courts = [];
	    $scope.courts = Court.query(function(){
	    	console.log('Courts loaded');
	    });
	    //socket.io instant updates
	    socket.syncUpdates('court', $scope.courts);
		$scope.$on('$destroy', function () {
      		socket.unsyncUpdates('court');
    	});
	    //Add Marker begins here
	    //Enable add marker mode
	    $scope.enableAddMarker = function(state) {
	    	AddMarker(state, $scope, map);
    	};

    	$scope.deletemarker = function(id) {
    		var check = $window.confirm('確定要刪掉這個球場嗎？');
    		if (check) {	
	    		Court.remove({ id: id });
    		} else {
    			return;
    		}
    	};

    	//Prevent ng animate from firing on refresh
    	$animate.enabled(false);
    	$timeout(function () {
        	$animate.enabled(true);
    	}, 1000);

    	

    	//Logic for court editing page
    	$scope.editmode = function(court) {
    		$scope.edit = !($scope.edit);
    		if(court) {
    			console.log(court);
    			Court.update({ id: court._id }, court);
    		}
    	};
    	//Logic for picture upload
    	$scope.uploadmode = function() {
    		$scope.upload = !($scope.upload);
    	};

    	//Prevent the edit page from closing when clicking one the form
    	$scope.stopPropagate = function(event) {
    		event.stopPropagation();
    	};

    	//Logic for marker editing
    	$scope.finishedit = function(marker) {
    		console.log(marker);	
    		//Grab the court data according to its id
    		if(marker) {
    			var updated = Court.get({ id: marker.id });
    			updated.court = marker.title;
    			updated.desc = marker.content;
    			console.log(updated);
    			Court.update({ id: marker.id }, updated);
    		}
    		
    	};

    	//Options for the hours
		$scope.getHours = function() {
			var hours = [];
			for (var i = 0; i < 24; i++) {
				var hour;
				if(i < 10) {
					hour = '0'+ i + '00'; 
				} else {
					hour = i + '00';
				}
				hours.push(hour);
			}
			return hours;
		};
	    //Add Marker ends here

	    //Add searchBox to map
	    var searchBox = document.getElementById('searchbox');
	    map.controls[google.maps.ControlPosition.TOP].push(searchBox);
	    //Geolocate begins here
	    // Place geolocate button on map
	    var geoBtn = document.getElementById('geolocate');
	    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(geoBtn);
	    // $scope.userLocation = {};
	    // var userLocation = $scope.userLocation;
	    // Geolocating function
	    $scope.userLocation = new google.maps.Marker();
	    $scope.geolocate = function() {
	    	Geolocate($scope, map);
	    };
	    //Geolocate ends here
	    //Add the addMarker button to map
	    var addMarkerBtn = document.getElementById('addMarker');
	    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(addMarkerBtn);

}]);//mapCtrl ends here


