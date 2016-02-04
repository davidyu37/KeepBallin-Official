/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var User = require('../api/user/user.model');
var Chat = require('../api/chat/chat.model');

var users = {};

//Login function, execute this on login and when there's token
var onlineManager = function(socket, data) {
  //Attach user ID to socket
  socket.userId = data.userId;
  console.log('%s online', socket.userId);
  //When the same user open multiple tabs
  if (data.userId in users) {
    users[data.userId].socketId.push(socket.id);
  } else {
    //When user does not exist in the list of online users
    users[data.userId] = {socketId: [socket.id], name: data.userName};
  }
  
  console.log('users', users);
  console.log('Number of user online: %s', Object.keys(users).length);
  socket.broadcast.emit('user connects', {users: users});
};

var offlineManager = function(socket, data, logout) {
  //If logout is true, remove the user from online users
  if(logout) {
    console.log('logout offline', data);
    delete users[data.userId];
    //If the user is in a chat room
    if(socket.roomId) {
      console.log('socket has room id');
      leaveRoom(data, socket);
    }
    socket.broadcast.emit('user offline', data);
  } else {

    //If user is in a room
    if(socket.roomId) {
      console.log('socket has room id');
      leaveRoom(data, socket);
    }

    if(users[data.userId]) {
      //If there's more than one socket for the user, remove that socket
      var numberOfSockets = users[data.userId].socketId.length;
      if (numberOfSockets > 1) {
        var index = users[data.userId].socketId.indexOf(socket.id);
        users[data.userId].socketId.splice(index, 1);
      } else {
        //Else remove the user from online users
        console.log('offline', data);
        delete users[data.userId];
        socket.broadcast.emit('user offline', data);
      }
    }
  }
};

// User disconnects update chat room server side
var leaveRoom = function(data, socket) {
  console.log('leave room');
  delete socket['roomId'];
  socket.leave(data.roomId);
  Chat.findById(data.roomId, function(err, chat) {
    if(err) { console.error(err); return;}
    if(!chat) { console.log('chat room not found'); return;}
    //Find the user
    var index = chat.usersOnline.indexOf(data.userId);
    chat.usersOnline.splice(index, 1);
    // chat.usersOnline.push(req.user._id);
    chat.save(function (err) {
      if (err) { console.error('error occured while trying to save the new chat room', err); return; }
      console.log('user left room: %s', chat.city);
    });
  });
}

// When the user disconnects.. perform this
function onDisconnect(socket) {
  console.log('user id', socket.userId);
  if(socket.userId) {
    User.findById(socket.userId, function (err, user) {
      if(user) {
        var data = {
          userId: user._id,
          userName: user.name
        };
        offlineManager(socket, data);
      }
      
    });
  } 
}

// When the user connects.. perform this
function onConnect(socket, socketio) {

  if(socket.decoded_token) {
    //socket.decoded_token._id is the user id
    User.findById(socket.decoded_token._id, function (err, user) {
      // if (err) return next(err);
      // if (!user) return res.status(401).send('Unauthorized');
      console.log('user id from token', user._id);
      if(user) {
        var data = {
          userId: user._id,
          userName: user.name
        };
        onlineManager(socket, data);
      }
    });
  }

  // When user login, do this
  socket.on('login', function (data) {
    onlineManager(socket, data);
  });

  socket.on('logout', function (data) {
    var logout = true;
    offlineManager(socket, data, logout);
  });

  // Join individual room
  socket.on('enter room', function(data) {
    //if there's no user id, attach it
    if(!socket.userId) {
      socket.userId = data.userId;
    }
    socket.roomId = data.roomId;
    socket.join(data.roomId);
  });

  socket.on('send message', function(data) {
    // console.log('server got message');
    //Save to server
    Chat.saveMessage(data.room, data.message, function(room) {
      console.log( data.user.name + ' said ' + data.message.message + ' in ' + data.room.city );
      socketio.in(data.room._id).emit('new message', room);
    });
    //Let other users in the chat know about the new message
  });

  // Leave individual room - client side
  socket.on('leave room', function(data) {
    console.log('leave room');
    delete socket['roomId'];
    socket.leave(data.roomId);
    Chat.findById(data.roomId, function(err, chat) {
      if(err) { console.error(err); return;}
      if(!chat) { console.log('chat room not found'); return;}
      //Find the user
      var index = chat.usersOnline.indexOf(data.userId);
      chat.usersOnline.splice(index, 1);
      // chat.usersOnline.push(req.user._id);
      chat.save(function (err) {
        if (err) { console.error('error occured while trying to save the new chat room', err); return;}
        console.log('user left room: %s', chat.city);
      });
    });
  });

  // Insert sockets below
  require('../api/chat/chat.socket').register(socket);
  require('../api/event/event.socket').register(socket);
  require('../api/conversation/conversation.socket').register(socket);
  require('../api/rating/rating.socket').register(socket);
  require('../api/team/team.socket').register(socket);
  require('../api/comment/comment.socket').register(socket);
  require('../api/upload/upload.socket').register(socket);
  require('../api/court/court.socket').register(socket);
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {

    socket.address = socket.handshake.address !== null ?
            socket.handshake.address :
            process.env.DOMAIN;

    socket.connectedAt = new Date();


    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket, socketio);
    console.info('[%s] CONNECTED', socket.address);
  });
};