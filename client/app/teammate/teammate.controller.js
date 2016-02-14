'use strict';

angular.module('keepballin')
  .controller('TeammateCtrl', ['$scope', 'socket', 'Auth', 'Chat', 'rooms', '$state', 'lobby', function ($scope, socket, Auth, Chat, rooms, $state, lobby) {

    if(lobby[0]) {
        $scope.numberOfUsers = lobby[0].userOnline.length;
    }

    //When a user joins the global chat room
    // Object.keys(data.users).length;
    socket.getUsersOnline($scope.usersOnline, function(users) {
        $scope.numberOfUsers = users.length;
    });

    //Get current user
    var user = Auth.getCurrentUser;

    $scope.rooms = rooms;

    socket.syncUpdates('chat', $scope.rooms, function(event, item , arr) {
        $scope.rooms = arr;
        console.log('room change', $scope.rooms);
    });
    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('chat');
    });

    //Users' function
    $scope.enterRoom = function(room) {
        //If there's a user, go ahead and go in
        if(user()._id) {
            $state.go('chat', {id: room._id});
        } else {
            var sendToLogin = {
                'roomId': room._id
            };
            $state.go('login', sendToLogin);
        }
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

    $scope.editRoom = function(room) {
        console.log('edit room', room);
        $scope.roomBeingEdited = JSON.stringify(room);
    };

    $scope.saveRoom = function(room) {
        var sendToServer = JSON.parse(room);
        console.log('should be sent to server', sendToServer)
        Chat.update({chatRoomId: sendToServer._id}, sendToServer);
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
