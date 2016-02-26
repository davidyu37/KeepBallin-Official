/* global io */
'use strict';

angular.module('keepballin')
  .factory('socket', function(socketFactory, Auth) {

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

      //Get number of users online
      getUsersOnline: function (users, cb) {
        socket.on('user online', function(data) {
          users = data.users;
          cb(users);
        });
      },

      //Let the server know when the user logout
      logout: function(user, cb) {
        cb = cb || angular.noop;
        socket.emit('logout', {userId: user._id, userName: user.name});
        cb(user);
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
      sendMessage: function(room, message, cb) {
        cb = cb || angular.noop;
        var user = Auth.getCurrentUser();
        var userPic;
        if(user.avatar || user.fbprofilepic) {
          userPic = user.avatar.url || user.fbprofilepic;
        }
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
      }

    };
  });
