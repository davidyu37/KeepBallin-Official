'use strict';

angular.module('keepballin')
  .controller('TeamCtrl', ['$scope','$timeout' ,'Auth', 'User', 'Team', '$state', 'socket', '$modal', '$filter', function ($scope, $timeout, Auth, User, Team, $state, socket, $modal, $filter) {
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
      $scope.originalTeams = d;
      //socket.io instant updates
      socket.syncUpdates('team', $scope.teams, function() {

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

    $scope.orderTeam = function() {
      if($scope.method === null) {
        return;
      }
      // $scope.currentOrder = value.method;
      var filteredData = $filter('orderBy')($scope.originalTeams, $scope.method.value, false);
      $scope.teams = filteredData;
    };

    $scope.methods = [
      {ch: '最近註冊', value: '-date'},
      {ch: '隊名-A~Z 英到中', value: 'name'},
      {ch: '隊名-Z~A 中到英', value: '-name'},
      {ch: '創始日-最年輕', value: '-founded'},
      {ch: '創始日-最老', value: 'founded'},
      {ch: '成員數-最多', value: '-members.length'}
    ];

    $scope.districts = [
      '北部',
      '中部',
      '南部',
      '東部',
      '外島',
      '顯示全部'
    ];

    $scope.getCities = function(district) {
        switch(district) {
            case '北部':
                $scope.cities = [
                    '台北市',
                    '新北市',
                    '基隆市',
                    '桃園縣',
                    '新竹縣',
                    '新竹市',
                    '宜蘭縣'
                ];
                break;
            case '中部':
                $scope.cities = [
                    '台中市',
                    '台中縣',
                    '苗栗縣',
                    '彰化縣',
                    '雲林縣',
                    '南投縣'
                ];
                break;
            case '南部':
                $scope.cities = [
                    '嘉義市',
                    '嘉義縣',
                    '台南市',
                    '台南縣',
                    '高雄市',
                    '高雄縣',
                    '屏東縣'
                ];
                break;
            case '東部':
                $scope.cities = [
                    '花蓮市',
                    '花蓮縣',
                    '台東縣',
                    '台東市'
                ];
                break;
            case '外島':
                $scope.cities = [
                    '金門',
                    '小金門',
                    '澎湖',
                    '馬祖',
                    '蘭嶼',
                    '琉球',
                    '綠島',
                    '外傘頂洲',
                    '太平島'
                ];
                break;
            case '顯示全部':
                $scope.cities = [];
                $scope.search = {};
                break;

            default:
                $scope.cities = [];
                return;

        }

    };

  }]);