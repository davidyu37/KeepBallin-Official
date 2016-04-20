'use strict';

angular.module('keepballin')
  .controller('RentEditCtrl', ['$scope', 'Auth', '$timeout', 'Indoor', 'thisCourt', '$animate', function ($scope, Auth, $timeout, Indoor, thisCourt, $animate) {

  	$scope.currentcourt = thisCourt;

  	//Prevent the upload overlay appearing in the beginning
  	$animate.enabled(false);
	$timeout(function () {
    	$animate.enabled(true);
	}, 1000);

	//Edit map
	//Initial map
  	var mapOptions = {
  		center: new google.maps.LatLng($scope.currentcourt.lat, $scope.currentcourt.long),
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

  	$scope.map = new google.maps.Map(document.getElementById('courtEditMap'), mapOptions);
  	
  	var geocoder = new google.maps.Geocoder();
	//When there's change in address, change map marker
  	$scope.$watch('currentcourt.address', function(newVal) {
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

			//Set lat and lng
			$scope.currentcourt.lat = results[0].geometry.location.lat();
			$scope.currentcourt.long = results[0].geometry.location.lng();
			$scope.marker = new google.maps.Marker({
				map: resultsMap,
				position: results[0].geometry.location,
				draggable:true
			});

			//Update lat and long of currentcourt when user drag
			google.maps.event.addListener($scope.marker, "dragend", function(event) { 
				var lat = event.latLng.lat(); 
				var lng = event.latLng.lng(); 
				$scope.currentcourt.lat = lat;
				$scope.currentcourt.long = lng;

			});

	    } else {
	      return;
	    }
	  });
	}


	//Showing preview
	$scope.openPreview = function() {
		$scope.showPreview = !($scope.showPreview);
		//Map for preview
		$timeout(function() {
			$scope.previewMap = new google.maps.Map(document.getElementById('previewMap'), mapOptions);
			$scope.previewMarker = new google.maps.Marker({
				map: $scope.previewMap,
				position: {lat: $scope.currentcourt.lat, lng: $scope.currentcourt.long}
			});
			$scope.previewMap.setZoom(16);
		});
	};


	//Set the default time for hours edit
	var hoursbegin = moment(),
	hoursend = moment();

	$timeout(function() {
		$scope.begin = hoursbegin.set({'hour': 9, 'minute': 0});
		$scope.end = hoursend.set({'hour': 20, 'minute': 0});
		//Display progress
		calculateProgress();
	});

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

	$scope.checkModel = {};

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
		$scope.begin = new Date($scope.begin);
		$scope.end = new Date($scope.end);
		days.forEach(function(day) {
			checkDay(day);
		});
	};

	//Calculate progress
	var fields = [
		{ en: 'court', ch: '球場名'},
		{ en: 'city', ch: '城市'},
		{ en: 'address', ch: '地址'},
		{ en: 'contactname', ch: '聯絡人'},
		{ en: 'contactemail', ch: '聯絡Email'},
		{ en: 'contactrelation', ch: '與球場關係'},
		{ en: 'telnumber', ch: '聯絡電話'},
		{ en: 'desc', ch: '簡介'},
		{ en: 'hours', ch: '開放時間'},
		{ en: 'basketnumber', ch: '籃框數'},
		{ en: 'courtnumber', ch: '全場數'},
		{ en: 'floor', ch: '地質'},
		{ en: 'water', ch: '飲水機'},
		{ en: 'toilet', ch: '廁所'},
		{ en: 'lights', ch: '燈'},
		{ en: 'indoor', ch: '室內'},
		{ en: 'bench', ch: '觀眾座位'},
		{ en: 'rentprice', ch: '平均租金'},
		{ en: 'minCapacity', ch: '最少所需人數'},
		{ en: 'maxCapacity', ch: '最多可容納人數'},
		{ en: 'pictures', ch: '照片'},
		{ en: 'rules', ch: '使用條款'}
	];

	$scope.toDos = [];

	var calculateProgress = function() {
		var counter = 0;
		fields.forEach(function(field) {
			if(field.en in $scope.currentcourt) {
				if(field.en == 'pictures') {
					if(!($scope.currentcourt[field.en][0])) {
						//When there's no pictures
						$scope.toDos.push(field);
						return;
					}	
				}

				counter += 1;
			} else {
				$scope.toDos.push(field);
				return;
			}
		});
		//Calculate the progress
		$scope.progress = Math.round((counter / fields.length) * 100);
	};

	//Send edited info to server
	$scope.saveEdit = function() {
		$scope.sending = true;
		Indoor.update({ id: $scope.currentcourt._id }, $scope.currentcourt, function(data) {
			$scope.sending = false;
		});
	};

	//Caculate per person price estimate
	$scope.perPerson = function() {
		if($scope.currentcourt.rentprice && $scope.currentcourt.minCapacity ) {
			$scope.currentcourt.perPersonPrice = Math.round( $scope.currentcourt.rentprice / $scope.currentcourt.minCapacity );
		}
	};
	//Calculate max revenue
	$scope.maxRev = function() {
		if($scope.currentcourt.perPersonPrice && $scope.currentcourt.maxCapacity ) {
			$scope.currentcourt.maxRevenue = $scope.currentcourt.perPersonPrice * $scope.currentcourt.maxCapacity;
		}
	};
	//Watch change in perPersonPrice and update max rev
	$scope.$watch('currentcourt.perPersonPrice', function(newVal) {
		if(newVal) {
			$scope.maxRev();
		}
	});

	//Approve rental court
	$scope.approve = function() {
		$scope.sending = true;
		$scope.currentcourt.approved = true;
		Indoor.update({ id: $scope.currentcourt._id }, $scope.currentcourt, function(data) {
			$scope.sending = false;
		});
	};
	//Check for admin
	$scope.isAdmin = function() {
		return Auth.isAdmin();
	};

	//Go Public
	$scope.goPublic = function() {
		$scope.currentcourt.isPublic = !($scope.currentcourt.isPublic);
		$scope.sending = true;
		Indoor.update({ id: $scope.currentcourt._id }, $scope.currentcourt, function(data) {
			$scope.sending = false;
		});
	};

  }]);
