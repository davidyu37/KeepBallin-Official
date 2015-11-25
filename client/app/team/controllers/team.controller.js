'use strict';

angular.module('keepballin')
  .controller('TeamCtrl', ['$scope','$timeout' ,'Auth', 'User', 'Team', '$state', 'socket', '$modal', function ($scope, $timeout, Auth, User, Team, $state, socket, $modal) {
  	$scope.createTeam = function() {
      if(Auth.isLoggedIn()) {
        $state.go('teamsignup.info');
      } else {
        $state.go('login');
      }
    };

    var allTeams = Team.query().$promise;
    allTeams.then(function(d) {
      $scope.teams = d;
      console.log(d);
      //socket.io instant updates
      socket.syncUpdates('team', $scope.teams, function(event, item , arr) {

      });
      $scope.$on('$destroy', function () {
            socket.unsyncUpdates('team');
        });
    });

    //Open modal to invite the team to play bball
    $scope.invite = function(index) {
      $scope.team = $scope.teams[index];
      $modal.open({
        templateUrl: 'app/team/temp/invite.html',
        controller: 'InviteCtrl',
        size: 'lg',
        scope: $scope
      });
    };

    // $scope.hasTeam = false;
  	// $scope.team = [];
  	// if(Auth.hasTeam()) {
  	// 	$scope.hasTeam = true;
  	// 	var teamId = Auth.hasTeam();
  	// 	var team = Team.get({id: teamId});
  	// 	team.$promise.then(function(data) {
  	// 		console.log(data);
  	// 		$scope.team = data;
  	// 	});
  	// }

  }]);