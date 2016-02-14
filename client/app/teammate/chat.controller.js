'use strict';

angular.module('keepballin')
  .controller('ChatCtrl', ['$scope', 'socket', 'Chat', 'room', 'Auth', '$timeout', 'Court', function ($scope, socket, Chat, room, Auth, $timeout, Court) {
  	
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
            console.log(numberOfMessages);
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
    console.log('room city', $scope.room.city);

    var findThis = {
      query: $scope.room.city
    };

    Court.search(findThis, function(data) {
      $scope.courts = data;
      console.log($scope.courts);
    }); 

    
  }]);//ChatCtrl ends
