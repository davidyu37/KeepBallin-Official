'use strict';

angular.module('keepballin')
  .controller('RentCtrl', ['$scope', 'Auth', '$timeout', 'Indoor', function ($scope, Auth, $timeout, Indoor) {
    
  	//Initial map
  	var mapOptions = {
  		center: new google.maps.LatLng(25.043204, 121.537544),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		scrollwheel: false,
	    panControl: true,
	    panControlOptions: {
    		position: google.maps.ControlPosition.LEFT_CENTER
		},
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
            style: google.maps.MapTypeControlStyle.DEFAULT
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
            style: google.maps.ZoomControlStyle.DEFAULT
        }
  	};

  	$scope.map = new google.maps.Map(document.getElementById('courtMap'), mapOptions);
  	
  	var geocoder = new google.maps.Geocoder();

  	//Add city to address
  	$scope.addCity = function() {
  		if($scope.currentcourt && !($scope.editform.address.$dirty)) {
		  	$scope.currentcourt.courtaddress = '';
	  		$scope.currentcourt.courtaddress += $scope.currentcourt.city;
  		}
  	};
  	//Add district to address
  	$scope.addDistrict = function() {
  		if($scope.currentcourt && !($scope.editform.address.$dirty)) {
  			//Only if there's already a city, add district
  			if($scope.currentcourt.city) {
		  		$scope.currentcourt.courtaddress += $scope.currentcourt.district;
  			}
  		}
  	};

	//When there's change in address, change map marker
  	$scope.$watch('currentcourt.courtaddress', function(newVal) {
  		if(newVal) {
  			$scope.searchForPlace = true;
  			geocodeAddress(geocoder, $scope.map, newVal);
  		}
  	});

  	$scope.marker = undefined;

  	$scope.searchForPlace = false;

  	//Converting address to geocode
  	function geocodeAddress(geocoder, resultsMap, address) {
	  geocoder.geocode({'address': address}, function(results, status) {
	    if (status === google.maps.GeocoderStatus.OK) {
			$scope.searchForPlace = false;
			$scope.$apply();
	    	if($scope.marker) {
		    	$scope.marker.setMap(null);
	    	}
			resultsMap.setCenter(results[0].geometry.location);
			resultsMap.setZoom(16);
			$scope.marker = new google.maps.Marker({
				map: resultsMap,
				position: results[0].geometry.location,
				draggable:true
			});
	    } else {
	      return;
	    }
	  });
	}
	$scope.currentcourt = {
		hours: {},
		peaktime: {}
	};
	$scope.currentcourt.contactname = Auth.getCurrentUser().name;
	$scope.currentcourt.contactemail = Auth.getCurrentUser().email;

	var hoursbegin = moment(),
	hoursend = moment();

	$timeout(function() {
		$scope.begin = hoursbegin.set({'hour': 9, 'minute': 0});
		$scope.end = hoursend.set({'hour': 20, 'minute': 0});
	});

	$scope.checkModel = {};

	//Set check model's days to all true
	$scope.everyday = function() {
		$scope.checkModel.monday = true;
		$scope.checkModel.tuesday = true;
		$scope.checkModel.wednesday = true;
		$scope.checkModel.thursday = true;
		$scope.checkModel.friday = true;
		$scope.checkModel.saturday = true;
		$scope.checkModel.sunday = true;
	};
	//Set 
	$scope.everyday();

	$scope.currentcourt.hours = [];

	//Helper function check if the day is selected and update the array
	var checkDay = function(day) {
		if($scope.checkModel[day]) {
			$scope.currentcourt.hours[day] = {
				day: day,
				begin: $scope.begin,
				end: $scope.end,
				isOpen: true
			};
		} else {
			//If the day is not chosen and no info exist for the day, set isOpen to false
			if(!($scope.currentcourt.hours[day])) {
				$scope.currentcourt.hours[day] = {
					day: day,
					begin: null,
					end: null,
					isOpen: false
				};
			}
		}
	};

	var days = [
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday'
	];

	//Close the hours for the day
	$scope.closeDay = function(day) {
		if($scope.currentcourt.hours[day]) {
			$scope.currentcourt.hours[day] = {
				day: day,
				begin: null,
				end: null,
				isOpen: false
			};
		}
	};

	//Add time frame to currentcourt.hours array
	$scope.addNewTime = function() {
		$scope.showPreview = true;
		$scope.begin = new Date($scope.begin);
		$scope.end = new Date($scope.end);
		days.forEach(function(day) {
			checkDay(day);
		});
	};

	//Sending court information to backend
	$scope.createRentCourt = function() {
		Indoor.save($scope.currentcourt, function(data) {
			console.log(data);
		});
	};

  }]);
