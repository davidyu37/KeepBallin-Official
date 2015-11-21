'use strict';

angular.module('keepballin')
  .controller('TeamCtrl', ['$scope','$timeout' ,'Auth', 'User', 'Team', '$state', function ($scope, $timeout, Auth, User, Team, $state) {
  	$scope.createTeam = function() {
      if(Auth.isLoggedIn()) {
        $state.go('teamsignup.info');
      } else {
        $state.go('login');
      }
    };

    var allTeams = Team.query().$promise;
    allTeams.then(function(d) {
      console.log(d);
      $scope.teams = d;
    });

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