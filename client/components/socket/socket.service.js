/* global io */
'use strict';

angular.module('keepballin')
  .factory('socket', function(socketFactory, Auth, $state) {

    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io.connect('', {
      // Send auth token on connection, you will need to DI the Auth service above
      query: 'token=' + Auth.getToken(),
      path: '/socket.io-client'
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      },

      //Get updates only for the reservation's timeslots
      updateTimeslots: function(modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } 

          cb(event, item, array);
        });
      },

      stopUpdateTimeslots: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
      },

      //Get number of users online
      getUsersOnline: function (users, cb) {
        socket.on('lobby:save', function(data) {
          users = data.userOnline;
          cb(users);
        });
      },
      //Remove Listener to lobby update
      stopGetUsersOnline: function(cb) {
        socket.removeAllListeners('lobby:save');
        cb();
      },
      //User login
      login: function(data, cb) {
        cb = cb || angular.noop;
        socket.emit('login', data);
        cb(data);
      },
      //Let the server know when the user logout
      logout: function(user, cb) {
        cb = cb || angular.noop;
        socket.emit('logout', {userId: user._id, userName: user.name});
        cb(user);
      },
      //If token expire or login to other user, logout the user
      checkLogout: function(cb) {
        cb = cb || angular.noop;
        var user = Auth.getCurrentUser();
        socket.on('user offline' + user._id, function(users) {
          Auth.logout();
          $state.go('main');
          cb(users);
        });
      },
      //Emitting leave room to server
      leaveRoom: function(roomId, cb) {
        cb = cb || angular.noop;
        var user = Auth.getCurrentUser();
        socket.emit('leave room', {roomId: roomId, userId: user._id});
      },
      enterRoom: function(roomId, cb) {
        cb = cb || angular.noop;
        var user = Auth.getCurrentUser();
        socket.emit('enter room', {roomId: roomId, userId: user._id});
        cb();
      },
      roomManager: function(room, cb) {
        cb = cb || angular.noop;
        //Update users online when user enter room
        socket.on('user enter room', function(data) {
          room.usersOnline.push(data.userId);
        });
        //Update users online when user leave room
        socket.on('user left room', function(data) {
          var index = room.usersOnline.indexOf(data.userId);
          room.usersOnline.splice(index, 1);
        });
      },
      stopManaging: function(cb) {
        cb = cb || angular.noop;
        socket.removeAllListeners('user enter room');
        socket.removeAllListeners('user left room');
      },
      sendMessage: function(room, message, cb) {
        cb = cb || angular.noop;
        var user = Auth.getCurrentUser();
        var thingsSendToServer = {
          room: room, 
          user: user, 
          message: message
        };
        socket.emit('send message', thingsSendToServer);
        cb();
      },
      //Listen for new message
      onNewMessage: function(room, cb) {
        cb = cb || angular.noop;
        socket.on('new message', function(data) {
          room.messages.unshift(data.messages[0]);
          cb(room);
        });
      },
      //When user joins the global chat room
      joinGlobal: function(username, cb) {
        cb = cb || angular.noop;
        socket.emit('user join', username);
      },
      //leave global
      leaveGlobal: function(username, cb) {
        cb = cb || angular.noop;
        socket.emit('user leave', username);
      },
      //Send message
      globalMessage: function(message, cb) {
        cb = cb || angular.noop;
        socket.emit('send global message', message);
        cb();
      },
      //On global message
      onGlobalMessage: function(global, cb) {
        cb = cb || angular.noop;
        socket.on('global message received', function(data) {
          global.messages.unshift(data.messages[0]);
          cb(global);
        });
      },
      //Update ui as user get online and offline
      globalManager: function(global, cb) {
        cb = cb || angular.noop;
        socket.on('user joined', function(data) {
          global.usersOnline.push(data.username);
          global.messages.push({
            by: data.username,
            message: '上線',
            date: (new Date()).toISOString()
          });
          cb(global);
        });
        socket.on('user left', function(data) {
          var index =  global.usersOnline.indexOf(data.username);
          global.usersOnline.splice(index, 1);
          global.messages.push({
            by: data.username,
            message: '下線',
            date: (new Date()).toISOString()
          });
          cb(global);
        });
      },

      checkForUsername: function(cb) {
        cb = cb || angular.noop;
        socket.emit('check username');
        socket.on('got username', function(data) {
          cb(data);
        });
      }

    };
  });
