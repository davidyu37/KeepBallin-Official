'use strict';

angular.module('keepballin')
  .controller('TeammateCtrl', ['$scope', 'socket', 'Auth', 'Chat', 'rooms', '$state', function ($scope, socket, Auth, Chat, rooms, $state) {

    //When a user joins the global chat room
    // Object.keys(data.users).length;
    socket.getUsersOnline($scope.usersOnline, function(users) {
        $scope.usersOnline = users;
        $scope.numberOfUsers = Object.keys(users).length;
    });

    //Get current user
    var user = Auth.getCurrentUser;

    $scope.rooms = rooms;

    socket.syncUpdates('chat', $scope.rooms, function(event, item , arr) {
        $scope.rooms = arr;
    });
    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('chat');
    });

    //Users' function
    $scope.enterRoom = function(room) {
        $state.go('chat', {id: room._id});
    };

    //Admin creates the chat room
    $scope.isAdmin = Auth.isAdmin;

    $scope.newInfo = {};

    $scope.addRoom = function() {
        
        $scope.newInfo.country = 'Taiwan';

        var newChatRoom = new Chat($scope.newInfo);
        newChatRoom.$save(function(d){
            console.log(d);
        });
    };

    $scope.removeRoom = function(room) {
        console.log('delete', room);
        Chat.remove({chatRoomId: room._id});
    };
    
    $scope.districts = [
      '北部',
      '中部',
      '南部',
      '東部',
      '外島'
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
    //Things for admin ends here

  }]);
