'use strict';

angular.module('keepballin')
  .controller('IndividualTeam', ['$scope','$timeout' ,'Auth', 'User', 'Team', '$state', 'thisTeam', '$modal', function ($scope, $timeout, Auth, User, Team, $state, thisTeam, $modal) {
  	thisTeam.$promise.then(function(d) {
  		$scope.team = d;
  	});

  	$scope.picPlaceholder = function(index) {
  		var pics = [
  			'/assets/images/bballplayer1.png',
  			'/assets/images/bballplayer2.jpg',
  			'/assets/images/bballplayer3.png',
  			'/assets/images/bballplayer4.svg',
  			'/assets/images/bballplayer5.jpg'
  		];

  		var newIndex = index % pics.length;

  		return pics[newIndex];

  	};
    //Open modal to invite the team to play bball
    $scope.invite = function() {
      $modal.open({
        templateUrl: 'app/team/temp/invite.html',
        controller: 'InviteCtrl',
        size: 'lg',
        scope: $scope
      });
    };


  }]);//IndividualTeam ends