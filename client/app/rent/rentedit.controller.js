'use strict';

angular.module('keepballin')
  .controller('RentEditCtrl', ['$scope', 'Auth', '$timeout', 'Indoor', 'thisCourt', '$animate', 'Upload', 'SweetAlert', 'timeslots', 'socket', '$compile', 'uiCalendarConfig', '$modal', function ($scope, Auth, $timeout, Indoor, thisCourt, $animate, Upload, SweetAlert, timeslots, socket, $compile, uiCalendarConfig, $modal) {

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

	function upload(file) {
        Upload.upload({
            url: 'api/indoors/pictures',
            fields: {
                'IndoorCourtId': $scope.currentcourt._id
            },
            file: file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.log = progressPercentage;
        }).success(function (data) {
        	var newPic = data.pictures[data.pictures.length - 1];
        	$scope.currentcourt.pictures.push(newPic);
            $scope.log = 0;
            $scope.uploading = false;
        });
    }

	$scope.upload = function(files) {
        if (files && files.length) {
			$scope.uploading = true;
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                upload(file);     
              }
            }
        }
	};

	$scope.deletePic = function(url) {
		SweetAlert.swal({   
			title: '你確定要刪除?',   
			text: '按下確定後，就無法走回頭路囉',   
			type: 'warning',   
			showCancelButton: true,   
			confirmButtonColor: '#DD6B55',   
			confirmButtonText: '確定',
			cancelButtonText: '取消',
			showLoaderOnConfirm: true,   
			closeOnConfirm: false }, 
			function(confirmed){
				if(confirmed) {
					Indoor.deletePic({id: $scope.currentcourt._id, url: url}, function(data) {
			    		$scope.currentcourt = data;
			    		SweetAlert.swal('已刪除!', '乾淨溜溜', 'success');
					});
				} else {
					return;
				}
			});//callback after confirm  
	};//deletePic ends

	//Put this pic as cover
	$scope.setCover = function(url) {
		Indoor.setCover({id: $scope.currentcourt._id, url: url}, function(data) {
    		$scope.currentcourt = data;
		});
	};

	//Calendar stuff

	//Open datepicker
    $scope.openCal = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened = true;
    };

    $scope.minDate = moment();

   //When $scope.date changes, update hour selection for start and end time based on availabiility
    var watchDate = $scope.$watch('date', function(val) {
        //If there's a new date
        if(val) {
            var d = days[val.getDay()];
            $scope.chosenDate = checkAvailability(val);
            $scope.timeSlot = generateTimeSelect($scope.chosenDate.begin, $scope.chosenDate.end);
            $scope.timeSlot.pop(); 
            $scope.timeSlot2 = generateTimeSelect($scope.chosenDate.begin, $scope.chosenDate.end);
            if($scope.timeSlot[0]) {
                //If there's time slot, set notAvailable to false
                $scope.notAvailable = false;
            } else {
                $scope.notAvailable = true;
            }
        }
    });
    //When there's no time chosen
    $scope.invalidTime = true;

    //Watch start time and end time and change estHour and estPrice
    var watchSelections = $scope.$watchGroup(['timeSlot.selected', 'timeSlot2.selected', 'numOfPeople'], function(vals) {
        if(vals[0] && vals[1]) { 
        	$scope.invalidTime = false;
        	$scope.estHour = calcTotalHours(vals[0], vals[1]);
            $scope.start = timeToDate($scope.timeSlot.selected);
            $scope.end = timeToDate($scope.timeSlot2.selected);
        }
    });

    //Convert time to date obj
    var timeToDate = function(str) {
        var reservedDate = moment($scope.date);
        var hour = parseInt(str.slice(0, 2));
        var min = parseInt(str.slice((str.length - 2), str.length));
        reservedDate.set({'hour': hour, 'minute': min, 'second': 0, 'millisecond': 0});
        return reservedDate;
    };

    var days = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
    ];

    //Check available time with current court's hours
    var checkAvailability = function(val) {
        var day = days[val.getDay()];
        var obj = {};

        obj.begin = $scope.currentcourt.hours[day].begin;
        obj.end = $scope.currentcourt.hours[day].end;
        
        return obj;
    };

    //Generate array of time selection based on given start to end time
    var generateTimeSelect = function(start, end) {
        //Start hours and minutes
        var s = moment(start).hours();
        var sMinute = moment(start).minute();
        //End hours and minutes
        var e = moment(end).hours();
        var eMinute = moment(end).minute();

        var count = s;

        var selections = [];
        var stringH, stringM;
        //If it starts at 
        if(sMinute === 30) {
            //Push the 30 min and skip the first hour 
            if(count < 10) {
                stringM = '0' + count + ':30';
            } else {
                stringM = count + ':30';
            }
            selections.push(stringM);
            count += 1;
        } else if(sMinute > 30) {
            //Skip the first hour
            count += 1;
        }
        
        //While the count is smaller than the end hour, continue
        while(count <= e) {
            //Add padding to number
            if(count < 10) {
                stringH = '0' + count + ':00';
                stringM = '0' + count + ':30';
            } else {
                stringH = count + ':00';
                stringM = count + ':30';
            }
            selections.push(stringH);
            if(!(count === e && eMinute < 30)) {
                selections.push(stringM);
            }
            count++;
        }
        return selections;
    };

    //Filter timeslots that is notOpen
    var filterTimeslots = function(slots) {
    	var arr = [];
    	slots.forEach(function(slot) {
    		if(slot.notOpen) {
    			arr.push(slot);
    		}
    	});
    	return arr;
    };

	$scope.eventSources = [];

	$scope.timeslots = filterTimeslots(timeslots);
	

	$scope.reservations = $scope.currentcourt.reservation;

	$scope.eventSources.push($scope.timeslots);
	
	$scope.eventSources.push($scope.reservations);

	//socket.io instant updates 
    socket.syncUpdates('reservation' + $scope.currentcourt._id, $scope.reservations);
    
    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('indoor' + $scope.currentcourt._id);
        watchDate();
        watchSelections();
    });

    /* alert on eventClick */
    $scope.onDayClick = function( date, jsEvent, view){
        //open day view
        uiCalendarConfig.calendars.reserveCal.fullCalendar('gotoDate', date);
        uiCalendarConfig.calendars.reserveCal.fullCalendar('changeView', 'agendaDay');

    };

    $scope.onEventClick = function(calEvent, jsEvent, view) {
        $modal.open({
            templateUrl: 'app/rent/rent.info.html',
            scope: $scope,
            size: 'md',
            controller: 'TimeslotCtrl',
            resolve: {
                theEvent: function() {
                    return calEvent;
                }
            }
        });
    };

    //Change timeSlot2 so user doesnt choose time earlier than start
    $scope.changeEndTimeSlot = function($model) {
        //Reset timeSlot2 to be like timeSlot
        $scope.timeSlot2 = generateTimeSelect($scope.chosenDate.begin, $scope.chosenDate.end);
        //Add one to index so start and end will have at least 30mins gap
        var index = $scope.timeSlot2.indexOf($model) + 1;
        $scope.timeSlot2.splice(0, index);
    };

    //Render tooltip for calendar
    $scope.eventRender = function( event, element, view ) { 

        var start = moment(event.start).format('h:mma');
        var end =  moment(event.end).format('h:mma');
        var message;

        var text = start + '~' + end;

        if(event.status == 'waiting') {
            message = '等待確認';
            text += ' ' + message;
            element.css({'background-color': '#ffc019', 'color': 'black'});
        } else if (event.status == 'completed') {
            message = '已確認';
            text += ' ' + message;
            element.css({'background-color': '#E6471C'});
        } else if (event.notOpen) {
        	message = '不開放'
        	text += ' ' + message;
            element.css({'background-color': '#502d17'});
        } else {
            message = '已取消';
            text += ' ' + message;
            element.css({'background-color': '#e6e6e6', 'color': 'black'});
        }

        element.text(text);
        if(event.numOfPeople) {
	        element.attr({'tooltip': event.numOfPeople + '人',
	                     'tooltip-append-to-body': true});
	        $compile(element)($scope);
        }
        if(event.notOpen) {

        }
    };

    $scope.extraEventSignature = function(event) {
       return "" + event.numOfPeople;
    };

	$scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        header:{
          left: 'agendaDay agendaWeek month',
          center: 'title',
          right: 'today prev,next'
        },
        allDaySlot: false,
        timezone: 'local',
        dayClick: $scope.onDayClick,
        eventClick: $scope.onEventClick,
        eventRender: $scope.eventRender
      }
    };

    //Change language of calendar
    $scope.uiConfig.calendar.dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    $scope.uiConfig.calendar.dayNamesShort = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    $scope.uiConfig.calendar.monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    $scope.uiConfig.calendar.buttonText = {
        today:    '今天',
        month:    '月',
        week:     '週',
        day:      '日'
    };
	//Calendar stuff ends

	//Check if this timeframe already has reservations

	var checkTime = function(start, end) {

		var result = true;
		
		$scope.currentcourt.reservation.forEach(function(res) {
			var resStart = moment(res.start);
			var resEnd = moment(res.end);
			
			if(start.isSame(resStart) || start.isBetween(resStart, resEnd) || end.isBetween(resStart, resEnd) || end.isSame(resEnd)) {
				result = false;
			}
		});
		
		return result;
	};

	//Calculate total hours help func
    var calcTotalHours = function(start, end) {
        var newStartString = start.replace(':', '');
        var newEndString = end.replace(':', '');
        //Before we convert string to number
        var testEnd = newEndString.slice((newEndString.length - 2), (newEndString.length));
        var testStart = newStartString.slice((newStartString.length - 2), (newStartString.length));
        //If the string end with 30, create new string with 50
        if(testEnd === '30') {
            newEndString = newEndString.slice(0, 2) + '50';
        }
        if(testStart === '30') {
            newStartString = newStartString.slice(0, 2) + '50';
        }
        //Convert to number
        var newEndNumber = parseInt(newEndString);
        var newStartNumber = parseInt(newStartString);
        var totalHours;
        //Check if start time is smaller than end time
        if(newStartNumber < newEndNumber) {
            $scope.invalidTime = false;
            var diff = newEndNumber - newStartNumber;
            totalHours = Math.round(diff) / 100;
        } else {
            $scope.invalidTime = true;
            totalHours = 0;
        }

        return totalHours;
    };

	//Mark as unavailable
	$scope.confirm = function(form) {
		//Check if this timeframe already has reservations
		if(checkTime($scope.start, $scope.end)) {
			console.log('no overlap');
			$scope.overlap = false;
			var numOfTimeslot = $scope.estHour / 0.5;
			var obj = {
				id: $scope.currentcourt._id, 
				start: $scope.start, 
				end: $scope.end,
				minCapacity: $scope.currentcourt.minCapacity,
				maxCapacity: $scope.currentcourt.maxCapacity,
				courtReserved: $scope.currentcourt._id,
				notOpen: true,
				numOfTimeslot: numOfTimeslot
			};

			Indoor.closeTimeslot(obj, function(data) {
				var slots = data;
				data.forEach(function(d) {
					$scope.timeslots.push(d);
				});
			});			
		} else {
			$scope.overlap = true;
		}
	};	


  }]);
