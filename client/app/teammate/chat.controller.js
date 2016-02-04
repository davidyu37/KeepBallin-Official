'use strict';

angular.module('keepballin')
  .controller('ChatCtrl', ['$scope', 'socket', 'Chat', 'room', 'Auth', '$timeout', function ($scope, socket, Chat, room, Auth, $timeout) {
  	
  	$scope.room = room;

  	console.log(room);

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

    chatThread.on('scroll', function() {
      $scope.loading = true;
      //When user scroll to the top load more messages
      if(chatThread.scrollTop() === 0) {
        //If it's still loading don't load more
        if($scope.loading) {
          Chat.loadMessage({ room: $scope.room }, function(data) {
            //Add messages loaded
            $scope.room.messages = $scope.room.messages.concat(data.messages);
            $scope.loading = false;
          });
        }
      }
    });
    

    
  }]);//ChatCtrl ends
