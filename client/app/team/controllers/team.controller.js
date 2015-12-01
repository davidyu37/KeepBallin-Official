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
    $scope.invite = function(team) {
      $scope.team = team;
      $modal.open({
        templateUrl: 'app/team/temp/invite.html',
        controller: 'InviteCtrl',
        size: 'lg',
        scope: $scope
      });
    };
    //Default sorting method
    $scope.method = {
      ch: '最近註冊', 
      value: '-date'
    };

    $scope.methods = [
      {ch: '最近註冊', value: '-date'},
      {ch: '隊名-A~Z 英到中', value: 'name'},
      {ch: '隊名-Z~A 中到英', value: '-name'},
      {ch: '創始日-最年輕', value: '-founded'},
      {ch: '創始日-最老', value: 'founded'},
      {ch: '成員數-最多', value: '-members.length'}
    ];

  }]);