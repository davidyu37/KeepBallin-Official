'use strict';

angular.module('keepballin')
  .controller('ConversationCtrl', ['$scope', 'Auth', 'Conversation', 'socket', '$timeout', function ($scope, Auth, Conversation, socket, $timeout) {
    $scope.userNow = Auth.getCurrentUser();
    $scope.mails = Conversation.getMails();
    $scope.messageNow = {};
    $scope.message = '';
    $scope.to = {};
    $scope.indexNow = 0;
    $scope.sending = false;

    //socket.io instant updates
    socket.syncUpdates('conversation', $scope.mails, function(event, item, array) {
        //Filter out all other message where the user is not part of
        var newList = [];
        for(var i=0; i < array.length; i++) {
            //Go through the participants of each conversation
            for(var j=0; j < array[i].participants.length; j++) {
                if(array[i].participants[j]._id === $scope.userNow._id) {
                    newList.push(array[i]);
                    break;
                }
            }
        }
        //Set the mails to the filtered mail list
        $scope.mails = newList;
    	$scope.display($scope.indexNow);
    });
	$scope.$on('$destroy', function () {
  		socket.unsyncUpdates('conversation');
	});


    $scope.display = function(index) {
    	var convoBox = document.getElementById('conversation'),
    	content;
    	$timeout(function() {
    		//Automatically scroll to the newest message
	    	content = document.getElementById('convoContent');
	    	convoBox.scrollTop = content.clientHeight;
    	});
    	

    	$scope.indexNow = index;
    	
    	$scope.currentMessage = $scope.mails[index];
    	//Get the user who is NOT the user now
    	var people = $scope.currentMessage.participants;
    	// var to = [];
    	
    	for(var i=0; i < people.length; i++) {
    		if(people[i]._id !== $scope.userNow._id ) {
    			$scope.to = people[i];
    		}
    	}
    };

    $scope.updateThread = function() {
    	//Grad the textarea
    	var talkBox = document.getElementById('talkBox');

    	$scope.sending = true;

  		var newMessage = {
			message: $scope.message,
			from: $scope.userNow._id,
			to: $scope.to._id
		};

    	var update = Conversation.update({ id: $scope.currentMessage._id }, newMessage);
    	update.$promise.then(function() {

    		$scope.message = '';
    		$scope.sending = false;
    		//Refocus onto the text area
    		talkBox.focus();
         
    	});
    };

  }]);
