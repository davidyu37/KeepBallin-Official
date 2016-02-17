'use strict';

angular.module('keepballin')
  .controller('ChatCtrl', ['$scope', 'socket', 'Chat', 'room', 'Auth', '$timeout', 'Court', 'Invite', '$interval', function ($scope, socket, Chat, room, Auth, $timeout, Court, Invite, $interval) {
  	
    //Focus on the input box when entering the chat
    var chatBox = angular.element(document.getElementById('chatBox'));
    chatBox.focus();

  	$scope.room = room;

  	$scope.user = Auth.getCurrentUser();

  	socket.enterRoom(room._id);

    $scope.$on('$destroy', function () {
      socket.leaveRoom(room._id);
    });

    $scope.sendMessage = function() {
      var message = {
        message: $scope.message,
        by: $scope.user._id
      };
      socket.sendMessage($scope.room, message);
      $scope.message = '';
    };
    //Get the element for chat thread container and its height
    var chatThread = angular.element(document.getElementById('chatThread'));
    var chatContent = angular.element(document.getElementById('chatContent'));

    //Scroll to the newest message on load
    $timeout(function() {
      chatThread.scrollTo(0, (chatContent[0].clientHeight));
    });

    socket.onNewMessage($scope.room, function(data) {
      //Wait for angular digest cycle, then scroll to the newest message
      $timeout(function() {
        chatThread.scrollTo(0, (chatContent[0].clientHeight));
      });
    });

    $scope.noMoreMessages = false;

    chatThread.on('scroll', function() {
      //When user scroll to the top load more messages
      if(chatThread.scrollTop() === 0) {
        //If there's no more messages, return
        if($scope.noMoreMessages) {
          return;
        }
        $scope.loading = true;
        //If it's still loading don't load more
        if($scope.loading) {
          Chat.loadMessage({ room: $scope.room }, function(data) {
            //Count the current number of message
            var numberOfMessages = $scope.room.messages.length;
            //Add messages loaded
            $scope.room.messages = $scope.room.messages.concat(data.messages);
            $scope.loading = false;
            //If the number of messages doesn't increase, prevent the next load
            if(numberOfMessages === $scope.room.messages.length) {
              $scope.noMoreMessages = true;
            }
          });
        }
      }
    });
    //Things for quick invite starts from here

    var findThis = {
      query: $scope.room.city
    };
    //Find the courts for the city of the chat room
    Court.search(findThis, function(data) {
      $scope.courts = data;
    });

    Invite.findByCity({city: $scope.room.city}, function(data) {
      $scope.invites = data;
      socket.syncUpdates('invite', $scope.invites, function(event, item , arr) {
        $scope.invites = arr;
      });
      $scope.$on('$destroy', function () {
          socket.unsyncUpdates('invite');
      });
    });

    //Search and set court id if it exists
    $scope.findCourtId = function() {
      //Search for the court if there's something
      if($scope.court) {
        $scope.courtId = undefined;
        Court.search({query: $scope.court}, function(data) {
          if(data[0]) {
            $scope.courtId = data[0]._id;
          }
        });
        
      }
    };

    //Defining today, NOW
    $scope.now = moment();
    $scope.tomorrow = moment($scope.now).add(1, 'days');
    $scope.dayAfterTomorrow = moment($scope.now).add(2, 'days');


    //The start time is equal to time now when load
    $scope.start = $scope.now;
    $scope.end = moment($scope.start).add(2, 'hour');

    $scope.timeFormat = 'M/dd h:mm:ss a';
    $scope.chosenDate = 'Today';

    //Convert date obj of timepicker to moment js
    $scope.convertToMoment = function(condition) {
      if(condition === 'start') {
        $scope.start = moment($scope.start);
        if($scope.start > $scope.end) {
          $scope.end = $scope.start;
        }
      }
      if(condition === 'end') {
        $scope.end = moment($scope.end);
      }
      return;
    };

    $scope.$watch('chosenDate', function(newVal, oldVal) {
      console.log('chosenDate changed', newVal);
      switch(newVal) {
        case 'Today':
          $scope.dt = undefined;
          var monthNow = moment().month();
          var dateNow = moment().date();
          console.log(monthNow, dateNow);
          $scope.start.set({'month': monthNow, 'date': dateNow});
          $scope.end.set({'month': monthNow, 'date': dateNow});
          break;
        case 'Tomorrow':
          $scope.dt = undefined;
          var monthTmrw = $scope.tomorrow.month();
          var dateTmrw = $scope.tomorrow.date();
          console.log(monthTmrw, dateTmrw);
          $scope.start.set({'month': monthTmrw, 'date': dateTmrw});
          $scope.end.set({'month': monthTmrw, 'date': dateTmrw});
          break;
        case 'dayAfterTomorrow':
          $scope.dt = undefined;
          var monthDAfterTmrw = $scope.dayAfterTomorrow.month();
          var dateDAfterTmrw = $scope.dayAfterTomorrow.date();
          console.log(monthDAfterTmrw, dateDAfterTmrw);
          $scope.start.set({'month': monthDAfterTmrw, 'date': dateDAfterTmrw});
          $scope.end.set({'month': monthDAfterTmrw, 'date': dateDAfterTmrw});
          break;
      }
    });

    $scope.$watch('dt', function(newVal, oldVal) {
      if(newVal) {
        $scope.dateNotChosen = false;
      }
    });

    //For date picker popup
    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.choseCustom = true;
      $scope.chosenDate = 'custom';

      $scope.opened = true;
    };

    //Sending invite to server
    $scope.sendInvite = function(invite) {

      $scope.submitted = true;
      //If user chose custom date, change the start time and end time
      if($scope.chosenDate == 'custom') {
        if($scope.dt) {
          $scope.dateNotChosen = false;
          $scope.dt = moment($scope.dt);
          var customMonth = $scope.dt.month();
          var customDate = $scope.dt.date();
          var customYear = $scope.dt.year();
          $scope.start.set({'year': customYear, 'month': customMonth, 'date': customDate});
          $scope.end.set({'year': customYear, 'month': customMonth, 'date': customDate});
        } else {
          $scope.dateNotChosen = true;
        }
      }

      if(invite.$valid && !($scope.dateNotChosen)) {
        console.log('valid');
        //start date for list grouping
        var startDate = ($scope.start.month() + 1) + '/' + $scope.start.date();
        
        var objSendToServer = {
          location: $scope.court,
          court: $scope.courtId,
          peopleNeed: $scope.people,
          startTime: $scope.start,
          endTime: $scope.end,
          city: $scope.room.city,
          startDate: startDate
        };
        console.log('obj', objSendToServer);
        Invite.save(objSendToServer, function(data) {
          $scope.submitted = false;
          console.log('invite saved', data);
        });
      }//If valid ends


    };


    
  }]);//ChatCtrl ends
