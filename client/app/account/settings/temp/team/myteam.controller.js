'use strict';

angular.module('keepballin')
  .controller('MyTeamCtrl', ['$scope', 'User', 'Auth', 'Team', function ($scope, User, Auth, Team) {
  	var user = User.get().$promise;
  	$scope.teams = [];
  	user.then(function(d) {
  		$scope.User = d;
  		console.log(d);
  		for(var i=0; i < d.team.length; i++) {
	  		var getTeam = Team.get({id: d.team[i]}).$promise;
	  		getTeam.then(function(t) {
	  			$scope.teams.push(t);
	  		});
  		}
  	});
  		

  }]);