'use strict';

angular.module('keepballin')
  .controller('ReserveCtrl', ['$scope', 'Indoor', '$modalInstance', 'uiCalendarConfig', function ($scope, Indoor, $modalInstance, uiCalendarConfig) {
    
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
