'use strict';

angular.module('keepballin')
  .controller('ReserveCtrl', ['$scope', 'Indoor', '$modalInstance', 'uiCalendarConfig', function ($scope, Indoor, $modalInstance, uiCalendarConfig) {
    
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
    $scope.$watch('date', function(val) {
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
    $scope.$watchGroup(['timeSlot.selected', 'timeSlot2.selected', 'numOfPeople'], function(vals) {
        if(vals[0] && vals[1]) {
            //vals[0] is start and vals[1] is end
            $scope.estHour = calcTotalHours(vals[0], vals[1]);
            //Calculate total price
            $scope.estPrice = calcTotalPrice($scope.estHour);
            //Convert timeSlot.selected to valid date obj
            $scope.start = timeToDate($scope.timeSlot.selected);
            $scope.end = timeToDate($scope.timeSlot2.selected);
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

    //Sending reservation
    $scope.reserveNow = function(form) {
        $scope.submitted = true;
        //Form validation
        if(form.$valid) {

            var obj = {
                dateReserved: $scope.date,
                beginString: $scope.timeSlot.selected,
                endString: $scope.timeSlot2.selected,
                beginTime: $scope.start,
                endTime: $scope.end,
                numOfPeople: $scope.numOfPeople,
                pricePaid: $scope.estPrice,
                duration: $scope.estHour
            };
            console.log(obj);
        }
        //Add reservation
        //Proceed them to checkout
    };

    //Calendar Stuff Begins

    $scope.eventSources = [];

    /* alert on eventClick */
    $scope.onDayClick = function( date, jsEvent, view){
        //open day view
        uiCalendarConfig.calendars.eventCal.fullCalendar('gotoDate', date);
        uiCalendarConfig.calendars.eventCal.fullCalendar('changeView', 'agendaDay');

    };
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
      var newStuff = {
        start: event.start,
        end: event.end
      };
      $scope.updating = true;
      var update = Event.update({id: event._id}, newStuff).$promise;
      update.then(function(d) {
        $scope.updating = false;
      });
        
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       var newStuff = {
        start: event.start,
        end: event.end
      };
      $scope.updating = true;
      var update = Event.update({id: event._id}, newStuff).$promise;
      update.then(function(d) {
        $scope.updating = false;
      });
    };

    $scope.onEventClick = function(calEvent, jsEvent, view) {
      $scope.events.forEach(function(element, index, array) {
        if(element._id === calEvent._id) {
          element.active = true;
        } else {
          element.active = false;
        }
      });
    };

    $scope.openEventModal = function(id) {
      $scope.events.forEach(function(e) {
        if(e._id === id) {
          $scope.selectedEvent = e;
        }
      });
      $modal.open({
        templateUrl: 'app/team/temp/event.detail.html',
        controller: 'EventDetailCtrl',
        size: 'lg',
        scope: $scope
      });
    };
    //Render tooltip for calednar
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    //Logic for owner and member checking

    $scope.checkUser = function() {
      if($scope.team) {

        if(Auth.isLoggedIn()) {
          if($scope.team.owner._id === $scope.user._id) {
            return true;
          }
          if(isMember()) {
            return true;
          } 
        }
      
        return false; 
      }
    };

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: $scope.checkUser,
        header:{
          left: 'agendaDay agendaWeek month',
          center: 'title',
          right: 'today prev,next'
        },
        timezone: 'local',
        dayClick: $scope.onDayClick,
        eventClick: $scope.onEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };
    //Calendar Stuff Ends


  }]);
