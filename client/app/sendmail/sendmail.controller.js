'use strict';

angular.module('keepballin')
  .controller('SendmailCtrl', ['$scope', 'profile', 'Auth', '$state', 'Conversation', function ($scope, profile, Auth, $state, Conversation) {
    
    $scope.userTo = profile;
    $scope.userFrom = Auth.getCurrentUser();
    $scope.processing = false;
    $scope.message = '';
    $scope.sent = false;
    $scope.sendMessage = function(form) {
        $scope.processing = true;
    	var letter = {
    		from: $scope.userFrom._id,
    		to: $scope.userTo._id,
    		message: $scope.message
    	};

    	Conversation.save(letter, function(data) {
    		$scope.message = '';
            $scope.processing = false;
            $scope.sent = true;
            $state.go('^');
    	});
    };
  }]);
