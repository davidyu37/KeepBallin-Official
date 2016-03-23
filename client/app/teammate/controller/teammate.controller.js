'use strict';

angular.module('keepballin')
  .controller('TeammateCtrl', ['$scope', 'socket', 'Auth', 'Chat', 'Global', 'rooms', '$state', 'Lobby', 'Invite', '$timeout', function ($scope, socket, Auth, Chat, Global, rooms, $state, Lobby, Invite, $timeout) {

    // Lobby.query(function(data) {
    //     if(data[0]) {
    //         $scope.numberOfUsers = data[0].userOnline.length;
    //     }
    // });

    // socket.getUsersOnline($scope.usersOnline, function(users) {
    //     $scope.numberOfUsers = users.length;
    // });

    //Global chat begins


    var userName = angular.element('#userName');
    userName.focus();

    socket.checkForUsername(function(data) {
        if(data.name) {
            $scope.name = data.name;
            $scope.joinGlobal($scope.name);
        }
    });

    //Get the element for chat thread container and its height
    var globalThread = angular.element(document.getElementById('globalThread'));
    var globalContent = angular.element(document.getElementById('globalContent'));

    //Scroll to the newest message on load
    $timeout(function() {
      globalThread.scrollTo(0, globalContent[0].clientHeight);

    });

    Global.load(function(data) {
        $scope.global = data;
        //Handling online and offline users
        socket.globalManager($scope.global, function(data) {
            $timeout(function() {
                globalThread.scrollTo(0, globalContent[0].clientHeight);
            });
        });
        //Listen for new messages
        socket.onGlobalMessage($scope.global, function() {
            console.log('got new message');
            $timeout(function() {
                globalThread.scrollTo(0, globalContent[0].clientHeight);
            });
        });
    });

    var messageBox = angular.element('#messageBox');

    //Enter global chat room
    $scope.joinGlobal = function(name) {
        //Show message box
        $scope.hasName = true;
        //Append welcome message to the end of current messages
        $scope.global.messages.push({
            by: 'Keepballin',
            message: name + ', 歡迎來到屬於籃球人的空間',
            date: (new Date()).toISOString()
        });
        //Focus on message box
        $timeout(function() {
            messageBox.focus();
            //Scroll to the welcome message
            globalThread.scrollTo(0, globalContent[0].clientHeight);
        });
        //Emit socket that user joined
        socket.joinGlobal(name);

        //Update backend
        Global.enter({
            id: $scope.global._id,
            name: name
        });
    };


    //Send message
    $scope.sendMessage = function() {
        $scope.timeNow = new Date();
      var message = {
        room: $scope.global,
        message: $scope.message,
        by: $scope.name
      };
      socket.globalMessage(message);
      // Global.send(message, function(data) {
      //   $scope.global = data;
      //   $timeout(function() {
      //       globalThread.scrollTo(0, globalContent[0].clientHeight);
      //   });
      //   socket.globalMessage(data.messages[0]);
      // });
      $scope.message = '';
    };

    $scope.noMoreMessages = false;

    globalThread.on('scroll', function() {
      //When user scroll to the top load more messages
      if(globalThread.scrollTop() === 0) {
        //If there's no more messages, return
        if($scope.noMoreMessages) {
          return;
        }
        $scope.loading = true;
        //If it's still loading don't load more
        if($scope.loading) {
          Global.loadMessage({ room: $scope.global }, function(data) {
            //Count the current number of message
            var numberOfMessages = $scope.global.messages.length;
            //Add messages loaded
            $scope.global.messages = $scope.global.messages.concat(data.messages);
            $scope.loading = false;
            //If the number of messages doesn't increase, prevent the next load
            if(numberOfMessages === $scope.global.messages.length) {
              $scope.noMoreMessages = true;
            }
          });
        }
      }
    });


    //Global chat ends


    //Get current user
    var user = Auth.getCurrentUser;

    $scope.rooms = rooms;

    //Group and count by city
    var groupAndCount = function() {
        Invite.findAll(function(data) {
            $scope.invites = data;
            var count = 0;
            $scope.invites.forEach(function(invite) {
                count += invite.count;
            });

            $scope.totalInvites = count;
        });
    };  

    groupAndCount();

    //Get all invite and sync
    
    Invite.query(function(data) {
        $scope.cachedInvites = data;
        socket.syncUpdates('invite', $scope.cachedInvites, function(event, item , arr) { 
            if(event === 'created') {
                groupAndCount();
            } else if (event === 'deleted') {
                groupAndCount();
            } else {
                return;
            }
        });

        $scope.$on('$destroy', function () {
            socket.unsyncUpdates('invite');
        });

    });  
    


    socket.syncUpdates('chat', $scope.rooms, function(event, item , arr) {
        $scope.rooms = arr;
    });
    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('chat');
        socket.leaveGlobal($scope.name);
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
        newChatRoom.$save();
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
