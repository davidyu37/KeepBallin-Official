'use strict';

angular.module('keepballin')
  .controller('ReserveCtrl', ['$scope', 'Indoor', '$modalInstance', 'uiCalendarConfig', function ($scope, Indoor, $modalInstance, uiCalendarConfig) {
    
    //Open datepicker
    $scope.openCal = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.opened = true;
    };

    //Initiate an empty timeSlot
    $scope.timeSlot = [];

    //When $scope.date changes, update hour selection for start and end time based on availabiility
    $scope.$watch('date', function(val) {
        //If there's a new date
        if(val) {
            var thisDay = checkAvailability(val);
            $scope.timeSlot = generateTimeSelect(thisDay.begin, thisDay.end);
            createPeople($scope.currentcourt.maxCapacity);
        }
    });

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
        return $scope.currentcourt.hours[day];
    };

    //Generate array of time selection based on given start to end time
    var generateTimeSelect = function(start, end) {
        var s = moment(start).hours();
        var e = moment(end).hours();
        var count = s;
        var selections = [];
        var string;
        //While the count is smaller than the end hour, continue
        while(count <= e) {
            //Add padding to number
            if(count < 10) {
                string = '0' + count + ':00';
            } else {
                string = count + ':00';
            }
            selections.push(string);
            count++;
        }
        return selections;
    };

    //Define today so user cant reserve date before today
    $scope.today = new Date();

    //Define empty people arr
    $scope.people = [];

    //Provide the selections for number of people
    var createPeople = function(max) {
        var person = 1;
        while(person <= max) {
            $scope.people.push(person);
            person++;
        }
    };

    //Sending reservation
    $scope.reserveNow = function() {
        //Form validation
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
