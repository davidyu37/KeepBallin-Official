/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var User = require('../api/user/user.model');
var Chat = require('../api/chat/chat.model');
var Lobby = require('../api/lobby/lobby.model');
var jwtDecode = require('jwt-decode');

var users = {};

//Login function, execute this on login and when there's token
var onlineManager = function(socket, data) {
  //Attach user ID to socket
  socket.userId = data.userId;
  console.log('%s online', socket.userId);
  //Find if there's already a lobby created
  Lobby.find({}, function(err, found) {
    //If there's no lobby
    if(found.length <= 0) {
      //if it doesn't exist create one
      var lobby = new Lobby();
      lobby.userOnline.push(data.userId);
      lobby.save(function(err, saved) {});
    } else {
      //If the tracker exist, check if the user exist in the array
      if( found[0].userOnline.indexOf(data.userId) < 0 ) {
        //If user doesn't exist, add to list
        found[0].userOnline.push(data.userId);

        found[0].save(function(err, saved) {
          console.log('Number of users online: ', saved.userOnline.length);
          socket.emit('user online', {users: found[0].userOnline});
        });
      }
    }
  });//Lobby tracker ends
};

var offlineManager = function(socket, data, logout) {
  // If the user is in a room, leave room first
  if(socket.roomId) {
    console.log('socket has room id');
    leaveRoom(data, socket);
  }

  Lobby.find({}, function(err, found) {

    if(err) {
      console.error(err);
      return;
    }

    if(found[0]) {
      var userIndex = found[0].userOnline.indexOf(data.userId);
      found[0].userOnline.splice(userIndex, 1);
      found[0].save(function(err, saved) {
        console.log('%s offline', data.userId);
        socket.broadcast.emit('user offline', data);
      });
    }
  });
};

// User disconnects update chat room server side
var leaveRoom = function(data, socket) {
  console.log('leave room');
  socket.leave(socket.roomId);
  Chat.findById(socket.roomId, function(err, chat) {
    if(err) { console.error(err); return;}
    if(!chat) { console.log('chat room not found'); return;}
    //Find the user
    var index = chat.usersOnline.indexOf(data.userId);
    chat.usersOnline.splice(index, 1);
    chat.save(function (err) {
      if (err) { console.error('error occured while trying to save the new chat room', err); return; }
      console.log('user left room: %s', chat.city);
      console.log('%s has %s of users', chat.city, chat.usersOnline.length);
      delete socket['roomId'];
    });
  });
}

// When the user disconnects.. perform this
function onDisconnect(socket) {
  if(socket.userId) {
    User.findById(socket.userId, function (err, user) {
      if(user) {
        var data = {
          userId: user._id,
          userName: user.name
        };
        console.log('%s is offline', user.name);
        offlineManager(socket, data);
      }
      
    });
  } 
}

// When the user connects.. perform this
function onConnect(socket, socketio) {
  if(socket.decoded_token) {
    console.log('got decoded_token');
    //socket.decoded_token._id is the user id
    User.findById(socket.decoded_token._id, function (err, user) {
      // if (err) return next(err);
      // if (!user) return res.status(401).send('Unauthorized');
      if(err) { console.error(err); return; }
      if(!user) { console.log('user not found in token'); return; }
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

    //If there's a token, decode it and attach it to socket
    if(socket.handshake.query.token !== 'undefined') {
      var token = socket.handshake.query.token;
      var decoded = jwtDecode(token);
      //Check token expiration
      var now = (new Date().getTime())/ 1000;
      //If token hasnt expired, decoded.exp should be greater than unix time of now
      if(decoded.exp >= now) {
        socket.decoded_token = decoded;
      } else {
        console.log('token expired, did not attach decoded token');
      }
    }

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