'use strict';

angular.module('keepballin')
	.controller('CourtsCtrl', ['$scope', '$http', '$window', '$animate', '$timeout', '$compile', 'socket', 'Panorama', 'mapOptions', 'Geolocate', 'AddMarker', 'Court', 'Auth', 'Lightbox', '$modal', 'SweetAlert', 
		function ($scope, $http, $window, $animate, $timeout, $compile, socket, Panorama, mapOptions, Geolocate, AddMarker, Court, Auth, Lightbox, $modal, SweetAlert) {
	    
		//Initialize map
	    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	    var map = $scope.map;

	    //Info window stuff	
	    $scope.infowindow = new google.maps.InfoWindow();
	    //Store courts from api
	    $scope.courts = [];
	    var allCourts = Court.query();

	    allCourts.$promise.then(function(data) {
	    	//Save the courts for search
			$scope.courtsCached = data;
	    	$scope.courts = data;
	    	$scope.courtList = data;
    		//socket.io instant updates
		    socket.syncUpdates('court', $scope.courts, function(event, item , arr) {

		    });
			$scope.$on('$destroy', function () {
	      		socket.unsyncUpdates('court');
	    	});

			sortOutCities(data);

			google.maps.event.addListener(map, 'bounds_changed', function() {
				//when user uses the search box stop changing the list
				if($scope.searching) {
					return;
				} else {
					var courts = [];
					data.forEach(function(court) {
						var latlng = new google.maps.LatLng(court.lat, court.long);
						//Check if the markers is contained in the map bounds
						if(map.getBounds().contains(latlng)) {
							courts.push(court);
						}
					});	
					$scope.courtList = courts;
					$scope.$apply();
				}
			});
	    });//Court query promise then function ends here

	    function sortOutCities(courts) {

	    	//create empty to store all the city options
	    	$scope.cities = [];
	    	//loop through all the courts
	    	for(var i=0; i<courts.length; i++) {
	    		//if there's no city in the array yet push the first one in
		    	if($scope.cities.length ===0) {
		    		$scope.cities.push(courts[i].city);
		    	} else {
		    		var repeat = false;
		    		for(var j=0; j<$scope.cities.length; j++) {
		    			//if that city already exist in the city array, do nothing
		    			if($scope.cities[j] === courts[i].city) {
		    				repeat = true;
		    				break;
		    			}
		    		}
		    		if(repeat) {
		    			continue;
		    		} else if(courts[i].city === undefined) {
		    			continue;
		    		} else if(courts[i].city === '台灣') {
		    			continue;
		    		} else {
		    			$scope.cities.push(courts[i].city);
		    		}
		    	}
	    	}
	    } 

	    //Mouseover function to open info window
	    $scope.openInfo = function(e, court) {
	    	var marker = $scope.markers[court._id];

	    	var infoContent = '<h5>選我</h5>';
	        // infoContent += 'ng-include="\'app/courts/temp/info.window.html\'">';
				
          	$scope.infowindow.setContent(infoContent);

          	$scope.infowindow.open($scope.map, marker);
        	
	    };
	    var modalInstance;
	    //Q&A for when edit mode is on
	    $scope.QandA = function() {
	    	//Open Q&A through modal or sweet alert
	    	modalInstance = $modal.open({
				animation: true,
				templateUrl: 'app/faq/faq.html',
				size: 'lg',
				controller: 'ModalCtrl'
			});	
	    };

	    

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
		$scope.mobileExpanded = false;

		//Check if user is the creator of the marker
		$scope.isCreator = function() {
			if(Auth.getCurrentUser()._id === $scope.currentcourt.creator._id) {
				return true;
			} else {
				return false;
			}
		};

		//Broadcast the currentcourt
		$scope.$watch('currentcourt._id', function(newVal) {
	        if(newVal) {
	        	$scope.$broadcast('courtIdChanged', {newId: newVal});
	        }
	    });

		var markers = [];

		var mobileInput = document.getElementById('mobileSearch');
		var mobileSearch = new google.maps.places.SearchBox(mobileInput);

		mobileSearch.addListener('places_changed', function() {
			var places1 = mobileSearch.getPlaces();

			if (places1.length == 0) {
				return;
			}

			// Clear out the old markers.
			markers.forEach(function(marker) {
				marker.setMap(null);
			});
			markers = [];

			// For each place, get the icon, name and location.
			var bounds = new google.maps.LatLngBounds();
			
			places1.forEach(function(place) {
				// Create a marker for each place.
				var marker = new google.maps.Marker({
					map: map,
					title: place.name,
					position: place.geometry.location
				});
				var infoWindow = new google.maps.InfoWindow();
			    var me = '<div id="searched"><h1>' + place.name + '</h1><div class="infoWindowContent">';
			    me += '<button class="btn btn-primary" ng-click="addLocationAfterSearch()">建立球場</button></div></div>';
		    
		    	infoWindow.setContent(me);

		    	google.maps.event.addListener(marker, 'click', function(e) {
		    		
		    		$scope.placeSearched = e.latLng;
	              	infoWindow.open(map, marker);
	              	$scope.$apply(function(){
           				$compile(document.getElementById('searched'))($scope);
        			});
		    	});

				markers.push(marker);

				if (place.geometry.viewport) {
				// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			map.fitBounds(bounds);
		});

	    //Add searchBox to map
	    if(screen.width < 480) {
            var searchBox = document.getElementById('searchbox');
		    map.controls[google.maps.ControlPosition.TOP].push(searchBox);
		    
		    var questionBtn = document.getElementById('questionBtn');
		    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(questionBtn);
	    }
	    
		$scope.goToLocation = function(selected) {
			
			if(selected) {
				var params = {
					query: selected
				};
				Court.search(params, function(data) {
					if(data.length === 0) {
						$scope.noResult = true;
						$timeout(function() {
							$scope.noResult = false;
						}, 10000);
					} else {
						$scope.noResult = false;
						$scope.searching = true;
						$scope.courts = data;
						$scope.courtList = data;
						$scope.map.panTo({lat: data[0].lat, lng: data[0].long});
						$scope.map.setZoom(15);
						$scope.gotResult = true;
						$timeout(function() {
							$scope.gotResult = false;
						}, 1000);
					}
				});
				
			}
		};

	    //Empty markers
	    $scope.markers = [];

	    //Share the court url
	    $scope.share = function() {
	    	new Clipboard('.shareBtn');

	    	$modal.open({
		      animation: true,
		      templateUrl: 'app/share/share.html',
		      scope: $scope,
		      controller: 'ShareCtrl'
		    });

	    };
	    //Popover message
	    $scope.popMess = '增加球場';
	    //Add Marker begins here
	    //Enable add marker mode
	    $scope.enableAddMarker = function(state) {
	    	AddMarker.addMode(state, $scope, map, function(newMarker) {
	    		// $scope.courts.push(newMarker);
	    	});
	    	if(state) {
	    		$scope.popMess = '離開編輯';
	    	} else {
	    		$scope.popMess = '增加球場';
	    	}


    	};

    	$scope.deletemarker = function(id) {
    		SweetAlert.swal({   
    			title: "你確定要刪除?",   
    			text: "按下確定後，就無法走回頭路囉",   
    			type: "warning",   
    			showCancelButton: true,   
    			confirmButtonColor: "#DD6B55",   
    			confirmButtonText: "確定",
    			cancelButtonText: "取消",   
    			closeOnConfirm: false }, function(confirmed){
    				if(confirmed) {
	    				Court.remove({ id: id });   
	    				SweetAlert.swal("已刪除!", 
	    					"乾淨溜溜", 
	    					"success");
    				} else {
    					return;
    				}
    			});
    	};

    	//Prevent ng animate from firing on refresh
    	$animate.enabled(false);
    	$timeout(function () {
        	$animate.enabled(true);
    	}, 1000);

    	$scope.exitEdit = function() {
    		$scope.edit = !($scope.edit);
    	};

    	//Logic for court editing page
    	$scope.editmode = function(court) {
    		$scope.edit = !($scope.edit);
    		if(court) {
    			
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

	    //Geolocate begins here
	    // Place geolocate button on map
	    var geoBtn = document.getElementById('geolocate');
	    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(geoBtn);
	    
	    // Geolocating function
	    $scope.personMarker = new google.maps.Marker();
	    $scope.gotErr = false;
	    //True if geolocating is taking time
	    $scope.locating = false;
	    $scope.geolocate = function() {
	    	Geolocate($scope, map, function(err) {
	    		if(err) {
	    			console.log(err);
		    		$scope.geoErr = err;
	    			$scope.gotErr = true;
		    		$timeout(function() {
		    			$scope.gotErr = false;
		    		}, 3000);
	    		}
	    	}, function(pos) {
	    		$scope.userLocation = pos;
	    		$scope.locating = false;
	    		$scope.$apply(function(){
               		$compile(document.getElementById('here'))($scope);
            	});
	    	});
	    };
	    //Geolocate ends here

	    $scope.addLocation = function() {
	    	AddMarker.addOne($scope.userLocation, function(newMarker) {
	    		$scope.courts.push(newMarker);
	    	});
	    };
	    //Function to add marker to place search
	    $scope.addLocationAfterSearch = function() {
	    	AddMarker.addOne($scope.placeSearched, function(newMarker) {
	    		$scope.courts.push(newMarker);
	    	});
	    };

	    //Add the addMarker button to map
	    var addMarkerBtn = document.getElementById('addMarker');
	    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(addMarkerBtn);

	    //Place search ------- Begin
	 //    var input = document.getElementById('placeSearch');
		// var searchBox = new google.maps.places.SearchBox(input);

		// // Bias the SearchBox results towards current map's viewport.
		// // map.addListener('bounds_changed', function() {
		// // 	searchBox.setBounds(map.getBounds());
		// // });

		// var markers = [];
		// // [START region_getplaces]
		// // Listen for the event fired when the user selects a prediction and retrieve
		// // more details for that place.
		// searchBox.addListener('places_changed', function() {
		// 	var places = searchBox.getPlaces();

		// 	if (places.length == 0) {
		// 		return;
		// 	}

		// 	// Clear out the old markers.
		// 	markers.forEach(function(marker) {
		// 		marker.setMap(null);
		// 	});
		// 	markers = [];

		// 	// For each place, get the icon, name and location.
		// 	var bounds = new google.maps.LatLngBounds();
			
		// 	places.forEach(function(place) {
		// 		// Create a marker for each place.
		// 		markers.push(new google.maps.Marker({
		// 			map: map,
		// 			title: place.name,
		// 			position: place.geometry.location
		// 		}));

		// 		if (place.geometry.viewport) {
		// 		// Only geocodes have viewport.
		// 			bounds.union(place.geometry.viewport);
		// 		} else {
		// 			bounds.extend(place.geometry.location);
		// 		}
		// 	});
		// 	map.fitBounds(bounds);
		// });
	    //Searchbox
	 //    $scope.availableSearchParams = [
		//   { key: 'court', name: '球場名', placeholder: '球場名...' },
		//   { key: 'city', name: '城市', placeholder: '城市...' },
		//   { key: 'district', name: '區域', placeholder: '區域...' },
		//   { key: 'address', name: '住址', placeholder: '住址...' }
		// ];

		// $scope.noResult = false;
		// $scope.gotResult = false;

		// $scope.searchCourt = function(params) {
		// 	var hasParams = (params.query || params.court || params.city || params.district || params.address);
		// 	if(hasParams === undefined) {
		// 		$timeout(function() {
		// 			$scope.emptyField = false;
		// 		}, 1000);
		// 		return;
		// 	} else {
		// 		Court.search(params, function(data) {
		// 			if(data.length === 0) {
		// 				$scope.noResult = true;
		// 				$timeout(function() {
		// 					$scope.noResult = false;
		// 				}, 1000);
		// 			} else {
		// 				$scope.courts = data;
		// 				$scope.map.panTo({lat: data[0].lat, lng: data[0].long});
		// 				$scope.map.setZoom(13);
		// 				$scope.gotResult = true;
		// 				$timeout(function() {
		// 					$scope.gotResult = false;
		// 				}, 1000);
		// 			}
		// 		});
		// 	}
		// };

		// $scope.getLocation = function(val) {
			
		// 	var params = {
		// 		query: val
		// 	};
		// 	return Court.search(params).$promise
		// 		.then(function(data) {
		// 			return data.map(function(item) {
		// 				return item.address;
		// 			});
		// 		});	
		// };


}]);//mapCtrl ends here


