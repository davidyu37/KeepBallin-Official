'use strict';

angular.module('keepballin')
  .controller('SendmailCtrl', ['$scope', 'profile', 'Auth', '$state', 'Conversation', function ($scope, profile, Auth, $state, Conversation) {
    
    $scope.userTo = profile;
    $scope.userFrom = Auth.getCurrentUser();
    $scope.processing = false;
    $scope.message = '';

    $scope.sendMessage = function(form) {
    	console.log('sent');
    	var letter = {
    		from: $scope.userFrom._id,
    		to: $scope.userTo._id,
    		message: $scope.message
    	};

    	Conversation.save(letter, function(data) {
    		console.log(data);
    	});
    };
  }]);
