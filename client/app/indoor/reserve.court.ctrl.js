'use strict';

angular.module('keepballin')
  .controller('ReserveCtrl', ['$scope', 'Indoor', '$modalInstance', 'uiCalendarConfig', 'Reservation', 'Timeslot', '$compile', 'socket', '$modal', 'Auth', '$state', function ($scope, Indoor, $modalInstance, uiCalendarConfig, Reservation, Timeslot, $compile, socket, $modal, Auth, $state) {
    
    //Close the modal
    $scope.close = function() {
        $modalInstance.close();
    };

    //Open datepicker
    $scope.openCal = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened = true;
    };

    //Initiate an empty timeSlot(for start) and timeSlot2(for end)
    $scope.timeSlot = [];
    $scope.timeSlot2 = [];

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

    //When $scope.date changes, update hour selection for start and end time based on availabiility
    var watchDate = $scope.$watch('date', function(val) {
        //If there's a new date
        if(val) {
            var d = days[val.getDay()];
            //If that date is not open, set not available to true
            if($scope.currentcourt.hours[d].isOpen) {
                $scope.estHour = 0;
                $scope.estPrice = 0;
                $scope.notAvailable = false;
                $scope.chosenDate = checkAvailability(val);
                $scope.timeSlot = generateTimeSelect($scope.chosenDate.begin, $scope.chosenDate.end);
                $scope.timeSlot.pop(); 
                $scope.timeSlot2 = generateTimeSelect($scope.chosenDate.begin, $scope.chosenDate.end);

                if($scope.timeSlot[0]) {
                    //If there's time slot, set notAvailable to false
                    $scope.notAvailable = false;
                    createPeople($scope.currentcourt.maxCapacity);
                } else {
                    $scope.people = [];
                    $scope.notAvailable = true;
                }
            } else {
                $scope.notAvailable = true;
                $scope.people = [];
                $scope.timeSlot = [];
                $scope.timeSlot2 = [];
            }
        }
    });

    //Watch start time and end time and change estHour and estPrice
    var watchSelections = $scope.$watchGroup(['timeSlot.selected', 'timeSlot2.selected', 'numOfPeople'], function(vals) {
        if(vals[0] && vals[1]) {
            //vals[0] is start and vals[1] is end
            $scope.estHour = calcTotalHours(vals[0], vals[1]);
            //Calculate total price
            $scope.estPrice = calcTotalPrice($scope.estHour);
            //Convert timeSlot.selected to valid date obj
            $scope.start = timeToDate($scope.timeSlot.selected);
            $scope.end = timeToDate($scope.timeSlot2.selected);
            //Reset minDateErr, error that occurs when user selected a time that has already became too late to reserve
            $scope.minDateErr = false;
            //Reset timeslot err and exceed max err
            $scope.timeslotNotAvailable = false;
            $scope.orderExceedMax = false;
        }
    });

    //Change timeSlot2 so user doesnt choose time earlier than start
    $scope.changeEndTimeSlot = function($model) {
        //Reset timeSlot2 to be like timeSlot
        $scope.timeSlot2 = generateTimeSelect($scope.chosenDate.begin, $scope.chosenDate.end);
        //Add one to index so start and end will have at least 30mins gap
        var index = $scope.timeSlot2.indexOf($model) + 1;
        $scope.timeSlot2.splice(0, index);
    };

    //Convert time to date obj
    var timeToDate = function(str) {
        var reservedDate = moment($scope.date);
        var hour = parseInt(str.slice(0, 2));
        var min = parseInt(str.slice((str.length - 2), str.length));
        reservedDate.set({'hour': hour, 'minute': min, 'second': 0, 'millisecond': 0});
        return reservedDate;
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

    //Calculate total price
    var calcTotalPrice = function(hours) {
        if($scope.numOfPeople && hours) {
            var onePersonPrice = hours * $scope.currentcourt.perPersonPrice;
            var total = onePersonPrice * $scope.numOfPeople;
            return total;
        }
    };

    //Check available time with current court's hours
    var checkAvailability = function(val) {
        var day = days[val.getDay()];
        var obj = {};
        //if minDate is the same date as the chosen date, set the start hour correctly
        if(moment(val).date() === $scope.minDate.date()) {
            //If the min date hour is smaller than beginning of hours of operation, set obj begin to hours[day].begin
            if($scope.minDate.hour() < moment($scope.currentcourt.hours[day].begin).hour()) {
                day = days[$scope.minDate.day()];
                obj.begin = $scope.currentcourt.hours[day].begin;
            } else {
                obj.begin = $scope.minDate;
            }
            obj.end = $scope.currentcourt.hours[day].end;
        } else {
            obj.begin = $scope.currentcourt.hours[day].begin;
            obj.end = $scope.currentcourt.hours[day].end;
        }
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

    //Define min date to start reserve

    $scope.minDate = moment().add($scope.currentcourt.hoursBeforeReserve, 'h');

    //Define empty people arr
    $scope.people = [];

    //Provide the selections for number of people
    var createPeople = function(max) {
        //clear people
        $scope.people = [];
        var person = 1;
        while(person <= max) {
            $scope.people.push(person);
            person++;
        }
    };

    //Helper function to check timeslot
    var findTimeslotByKeyValue = function(arraytosearch, key, valuetosearch) {
        var timeslot = valuetosearch.getTime();
        for (var i = 0; i < arraytosearch.length; i++) {
            var date = new Date(arraytosearch[i][key]).getTime();
            if(date === timeslot) {
                return arraytosearch[i];
            }
        }
        return null;
    };

    //Function for tooltip to check if user is login
    $scope.loggedIn = Auth.isLoggedIn;

    console.log($scope.currentcourt);

    //Sending reservation
    $scope.reserveNow = function(form) {

        //Check if user is logged in
        if(!(Auth.isLoggedIn())) {
            $state.go('login');
            return;
        }

        $scope.submitted = true;
        //Form validation
        if(form.$valid) {
            $scope.timeslotNotAvailable = false;
            $scope.orderExceedMax = false;
            //Timeslots checking -------------------------
            var numOfTimeslots = $scope.estHour / 0.5;
            //Array to put the timeslots that are not available
            $scope.nopeTimeslots = [];
            $scope.fewSpotTimeslots = [];

            var initialStarttime = moment($scope.start);

            for(var i = 0; i < numOfTimeslots; i++) {
                var newTime = moment(initialStarttime);

                if(i > 0) {
                    newTime = moment(initialStarttime.add(30, 'm'));
                }
                var matchingTimeslot = findTimeslotByKeyValue($scope.events, 'start', new Date(newTime));
                
                if(matchingTimeslot) {
                    //Check for remaining spots, if numOfPeople exceed the remaing spots, 
                    if($scope.numOfPeople > matchingTimeslot.numOfPeopleTilFull) {
                        $scope.orderExceedMax = true;
                        $scope.fewSpotTimeslots.push(matchingTimeslot);
                    }
                    //Check if the timeslot's notOpen or full is true
                    if(matchingTimeslot.notOpen || matchingTimeslot.full) {
                        $scope.timeslotNotAvailable = true;
                        $scope.nopeTimeslots.push(matchingTimeslot);
                    }
                }
            }
            if($scope.timeslotNotAvailable || $scope.orderExceedMax) {
                return;
            }
            
            //Timeslots checking ends -------------------------

            var hoursBeforeBegin = moment($scope.start).subtract($scope.currentcourt.hoursBeforeReserve, 'h');

            var obj = {
                dateReserved: $scope.date,
                beginString: $scope.timeSlot.selected,
                endString: $scope.timeSlot2.selected,
                beginTime: $scope.start,
                endTime: $scope.end,
                numOfPeople: $scope.numOfPeople,
                minCapacity: $scope.currentcourt.minCapacity, 
                maxCapacity: $scope.currentcourt.maxCapacity,
                pricePaid: $scope.estPrice,
                perPersonPrice: $scope.currentcourt.perPersonPrice,
                duration: $scope.estHour,
                timeForConfirmation: hoursBeforeBegin._d,
                courtReserved: $scope.currentcourt._id
            };

            //If num of people reserved is larger than minCapacity, set to active
            if($scope.numOfPeople >= $scope.currentcourt.minCapacity) {
                obj.active = true;
            }

            //Check if time now is smaller than hoursBeforeBegin
            var now = moment();
            if(now >= hoursBeforeBegin) {
                $scope.minDateErr = true;
                return;
            } else if($scope.timeslotNotAvailable) {
                return;
            } else if($scope.orderExceedMax) {
                return;
            } else {
                $scope.sending = true;
                Reservation.save(obj, function(data) {
                    $scope.sending = false;
                   
                    $state.go('reservationthis', {id : data._id});

                });
            }

        }
        //Add reservation
        //Proceed them to checkout
    };

    //Calendar Stuff Begins

    $scope.eventSources = [];

    Timeslot.getByCourtId({ id: $scope.currentcourt._id }, function(data) {
        if(data[0]) {
            $scope.events = data;
        } else {
            $scope.events = [];    
        }
        $scope.eventSources.push($scope.events);

        //socket.io instant updates 
        socket.syncUpdates('timeslot' + $scope.currentcourt._id, $scope.events);
        
        $scope.$on('$destroy', function () {
            socket.unsyncUpdates('timeslot');
        });
    });

    //Cancel the watches when user leaves page
    $scope.$on('$destroy', function () {
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
            templateUrl: 'app/indoor/temp/timeslot.info.html',
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

    //Render tooltip for calendar
    $scope.eventRender = function( event, element, view ) { 

        var start = moment(event.start).format('h:mma');
        var end =  moment(event.end).format('h:mma');
        var message;

        var text = start + '~' + end;

        if(event.numOfPeople < event.minCapacity) {
            var lacking = event.minCapacity - event.numOfPeople;
            message = '還缺' + lacking + '人才開放';
            text += ' ' + message;
            element.css({'background-color': '#ffc019', 'color': 'black'});
        } else if (event.numOfPeople >= event.minCapacity && event.numOfPeople < event.maxCapacity) {
            var spotsLeft = event.maxCapacity - event.numOfPeople;
            message = '還剩' + spotsLeft + '人就客滿';
            text += ' ' + message;
            element.css({'background-color': '#E6471C'});
        } else {
            message = '已客滿';
            text += ' ' + message;
            element.css({'background-color': '#502d17'});
        }

        element.text(text);
        
        element.attr({'tooltip': message,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
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
    $scope.uiConfig.calendar.dayNamesShort = ['日', '一', '二', '三', '四', '五', '六'];
    $scope.uiConfig.calendar.monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    $scope.uiConfig.calendar.buttonText = {
        today:    '今天',
        month:    '月',
        week:     '週',
        day:      '日'
    };


    //Calendar Stuff Ends

  }]);
