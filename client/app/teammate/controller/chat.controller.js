'use strict';

angular.module('keepballin')
  .controller('ChatCtrl', ['$scope', 'socket', 'Chat', 'room', 'Auth', '$timeout', 'Court', 'Invite', '$interval', 'SweetAlert', '$filter', '$modal', function ($scope, socket, Chat, room, Auth, $timeout, Court, Invite, $interval, SweetAlert, $filter, $modal) {
  	
    //Focus on the input box when entering the chat
    var chatBox = angular.element(document.getElementById('chatBox'));
    chatBox.focus();

  	$scope.room = room;

  	$scope.user = Auth.getCurrentUser();

  	socket.enterRoom(room._id);

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

    //empty arrays for current and future invites
    $scope.currentInvites = [];
    $scope.futureInvites = [];

    Invite.findByCity({city: $scope.room.city}, function(data) {
      getCurrentEvent(data);
      $scope.invites = data;
      socket.syncUpdates('invite', $scope.invites, function(event, item , arr) {
        //Determine if the new item belongs to current invites or future invites
        justOneNewItem(item, event);
        $scope.invites = arr;
      });
      $scope.$on('$destroy', function () {
          socket.unsyncUpdates('invite');
          socket.leaveRoom(room._id);
      });
    });
    //Function that gets the events occuring now
    var getCurrentEvent = function(arr) {
      if(arr[0]) {
        arr.forEach(function(invite) {
          var start = moment(invite.startTime);
          var end = moment(invite.endTime);
          //If the time now is in between start and finish
          if(start < $scope.now && $scope.now < end) {
            $scope.currentInvites.push(invite);
          } else {
            //When is not in between these time, 
            //is future event because the events thats already over is filtered at server level
            $scope.futureInvites.push(invite);
          }
        });
      }
    }
    //Logic to determine is a item belongs to current or future invites
    var justOneNewItem = function(item, event) {
      if(item) {
        var start = moment(item.startTime);
        var end = moment(item.endTime);
        if(start < $scope.now && $scope.now < end) {
          //If it's a new item is created, just push
          if(event == 'created') {
            $scope.currentInvites.push(item);
          } 
          //When it's not created, it should be updated, replace the old item
          if(event == 'updated') {
            //Check if the item is in the future, if it is, remove it.
            var futureItem = _.find($scope.futureInvites, {_id: item._id}); 
            var futureIndex = $scope.futureInvites.indexOf(futureItem);
            if(futureIndex >= 0) {
              $scope.futureInvites.splice(futureIndex, 1);
            }
            var oldItem = _.find($scope.currentInvites, {_id: item._id});
            var index = $scope.currentInvites.indexOf(oldItem);
            $scope.currentInvites.splice(index, 1, item);
          }
          if(event == 'deleted') {
            var oldItem = _.find($scope.currentInvites, {_id: item._id});
            var index = $scope.currentInvites.indexOf(oldItem);
            $scope.currentInvites.splice(index, 1);
          }
        } else {
          //If it's a new item is created, just push
          if(event == 'created') {
            $scope.futureInvites.push(item);
          } 
          //When it's not created, it should be updated, replace the old item
          if(event == 'updated') {
            //Check if the item is in the current, if it is, remove it.
            var currentItem = _.find($scope.currentInvites, {_id: item._id}); 
            var currentIndex = $scope.currentInvites.indexOf(currentItem);
            if(currentIndex >= 0) {
              $scope.currentInvites.splice(currentIndex, 1);
            }
            var oldItem = _.find($scope.futureInvites, {_id: item._id});
            var index = $scope.futureInvites.indexOf(oldItem);
            $scope.futureInvites.splice(index, 1, item);
          }
          if(event == 'deleted') {
            var oldItem = _.find($scope.futureInvites, {_id: item._id});
            var index = $scope.futureInvites.indexOf(oldItem);
            $scope.futureInvites.splice(index, 1);
          }
        }
      }
    }

    //Check if events ended
    var removeInviteEnded = function(arr) {
      if(arr[0]) {
        arr.forEach(function(invite) {
          var end = moment(invite.endTime);
          //If the end smaller then time now remove from current
          if(end < $scope.now) {
            var index = $scope.currentInvites.indexOf(invite);
            $scope.currentInvites.splice(index, 1);
          } else {
            return;
          }
        });
      } else {
        return;
      }
    }
    //Check if event started
    var moveStartedToCurrent = function(arr) {
      if(arr[0]) {
        arr.forEach(function(invite) {
          var start = moment(invite.startTime);
          //If start is smaller then time now, remove from future to current events
          if(start <= $scope.now) {
            var index = $scope.futureInvites.indexOf(invite);
            $scope.currentInvites.push(invite);
            var spliced = $scope.futureInvites.splice(index, 1);
            
          } else {
            return;
          }
        });
      } else {
        return;
      }
    }


    //Defining today, NOW
    $scope.now = moment();
    $scope.tomorrow = moment($scope.now).add(1, 'days');
    $scope.dayAfterTomorrow = moment($scope.now).add(2, 'days');
    //Update now every second
    $interval(function() {
      $scope.now = moment();
    }, 1000);

    //Watch change of time now
    $scope.$watch('now', function(newVal, oldVal) {
      //Update UI for current and future invites
      removeInviteEnded($scope.currentInvites);
      moveStartedToCurrent($scope.futureInvites);
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
      switch(newVal) {
        case 'Today':
          $scope.dt = undefined;
          //Should calculate the duration of start to end
          var monthNow = moment().month();
          var dateNow = moment().date();
          var duration = moment.duration($scope.end.diff($scope.start));
          $scope.start.set({'month': monthNow, 'date': dateNow});
          $scope.end = moment($scope.start).add(duration);
          // $scope.end.set({'month': monthNow, 'date': dateNow});
          break;
        case 'Tomorrow':
          $scope.dt = undefined;
          var monthTmrw = $scope.tomorrow.month();
          var dateTmrw = $scope.tomorrow.date();
          var duration = moment.duration($scope.end.diff($scope.start));
          $scope.start.set({'month': monthTmrw, 'date': dateTmrw});
          $scope.end = moment($scope.start).add(duration);
          // $scope.end.set({'month': monthTmrw, 'date': dateTmrw});
          break;
        case 'dayAfterTomorrow':
          $scope.dt = undefined;
          var monthDAfterTmrw = $scope.dayAfterTomorrow.month();
          var dateDAfterTmrw = $scope.dayAfterTomorrow.date();
          var duration = moment.duration($scope.end.diff($scope.start));
          $scope.start.set({'month': monthDAfterTmrw, 'date': dateDAfterTmrw});
          $scope.end = moment($scope.start).add(duration);
          // $scope.end.set({'month': monthDAfterTmrw, 'date': dateDAfterTmrw});
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

    //default people number
    $scope.people = 5;

    //Open invite form
    $scope.openInviter = function(open) {
      $scope.openInvite = !open;
      return;
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

      //Also check if the end time is larger than now
      if($scope.end.unix() > $scope.now.unix()) {
        if(invite.$valid && !($scope.dateNotChosen) && !($scope.sending)) {
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
          $scope.sending = true;
          Invite.save(objSendToServer, function(data) {
            $scope.submitted = false;
            $scope.sending = false;
            $scope.openInvite = false;

            var startTime = $filter('date')(data.startTime, 'MM/dd hh:mm a');
            var endTime = $filter('date')(data.endTime, 'hh:mm a');

            SweetAlert.swal({
              title: data.location,
              text: startTime + ' ~ ' + endTime,
              type: 'success',
              confirmButtonColor: '#DD6B55',   
              confirmButtonText: '好',
              timer: 2000
            });
          });
        }//If valid ends
      } else {
        var endTime = $filter('date')($scope.end._d, 'MM/dd hh:mm a');
        var nowTime = $filter('date')($scope.now._d, 'MM/dd hh:mm a');
        SweetAlert.swal({
          title: '無法建立過去的活動',
          text: '現在是' + nowTime + '\n已經過 ' + endTime,
          type: 'warning',
          confirmButtonColor: '#DD6B55',   
          confirmButtonText: '好'
        });
      }
    };//Send invites ends

    //Default to show current invites
    $scope.nowOrFuture = 'now';

    //Watch nowOrFuture
    $scope.$watch('nowOrFuture', function(newVal, oldVal) {
      if(newVal) {
        switch(newVal) {
          case 'now':
            $scope.showCurrent = true;
            $scope.showFuture = false;
            break;
          case 'future':
            $scope.showCurrent = false;
            $scope.showFuture = true;
            break;
        }
      }
    });

    //Adding participants
    $scope.joinInvite = function(invite) {
      Invite.addParticipant({id: invite._id}, function(data) {
        $scope.switchMinus = true;
      });
    };

    //Removing participants
    $scope.leaveInvite = function(invite) {
      Invite.minusParticipant({id: invite._id}, function(data) {
        $scope.switchMinus = false;
      });
    };

    //Checking if user is already a participant
    $scope.isParticipant = function(invite) {
      if(invite && $scope.user._id) {
        var alreadyExist = invite.participants.indexOf($scope.user._id);
        if(alreadyExist >= 0) {
          return true;
        } else {
          return false;
        } 
      }
    };

    //Edit invite
    $scope.editInvite = function(invite) {
      //Open modal for edit
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'app/teammate/editInvite.html',
        controller: 'EditInviteCtrl',
        size: 'lg',
        resolve: {
          invite: function () {
            return invite;
          },
          court: function() {
            return $scope.courts;
          }
        }
      });

      // modalInstance.result.then(function () {
      //   $scope.test = true;
      //   console.log($scope.test);
      // });
    };
    

    //Delete invite
    $scope.deleteInvite = function(invite) {
      SweetAlert.swal({   
        title: "你確定要刪除?",   
        text: "刪除後沒有備份喔",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "對, 刪除!",
        cancelButtonText: "取消",   
        closeOnConfirm: false }, 
        function() {
          Invite.delete({id: invite._id}, function() {
            swal({
              title: "已經刪除", 
              text: invite.location + ' 的活動', 
              type: "success",
              timer: 2000
            }); 
          });   
      });      
    };

    
  }]);//ChatCtrl ends
