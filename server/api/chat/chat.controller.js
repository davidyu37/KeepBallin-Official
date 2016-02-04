/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/chats              ->  index
 */

'use strict';

var _ = require('lodash'),
    Chat = require('./chat.model');

//only admin can create chat room
exports.createRoom = function(req, res) {
	//when chat room id doesn't exist
	var chat = new Chat(_.merge(req.body));
	// _.merge({ author: req.user._id }, req.body)
	chat.save(function(err, chat) {
		if(err) { return handleError(res, err); }
		return res.status(201).json(chat);
	});
};

//only admin can delete chat room
exports.destroy = function(req, res) {
	Chat.findById(req.params.chatRoomId, function (err, chat) {
    if(err) { return handleError(res, err); }
    if(!chat) { return res.status(404).send('Not Found'); }
    chat.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

//Get all the chat rooms
exports.getRooms = function(req, res) {
	Chat.find(function (err, rooms) {
		if(err) { return handleError(res, err); }
		return res.status(200).json(rooms);
	});
};

//Enter the chat room, push user's id to usersOnline array
exports.enterRoom = function(req, res) {
	Chat.loadInitialRoom(req.params.chatRoomId, req.user._id, function (chat) {
    	// if(err) { return handleError(res, err); }
    	if(!chat) { return res.status(404).send('Not Found'); }
        //If there's no err, simply sends it to client
        return res.status(200).json(chat);
    });
};
//Async loading for messages
exports.loadMessage = function(req, res) {
    Chat.asyncLoadMessages(req.body.room, function (chat) {
        // if(err) { return handleError(res, err); }
        if(!chat) { return res.status(404).send('Not Found'); }
        //If there's no err, simply sends it to client
        return res.status(200).json(chat);
    });
};

//When user leaves the room
exports.leaveRoom = function(req, res) {
	Chat.findById(req.body.chatRoomId, function (err, chat) {
    	if(err) { return handleError(res, err); }
    	if(!chat) { return res.status(404).send('Not Found'); }
    	//Find the user
    	var index = chat.usersOnline.indexOf(req.body.userId);
    	chat.usersOnline.splice(index, 1);
    	// chat.usersOnline.push(req.user._id);
    	chat.save(function (err) {
	      if (err) { return handleError(res, err); }
	      return res.status(200).json(chat);
	    });
    });
};

//Send message
// exports.saveMessage = function(req, res) {
// 	console.log('req of save message', req);
// 	Chat.findById(req.body.chatRoomId, function (err, chat) {
//     	if(err) { return handleError(res, err); }
//     	if(!chat) { return res.status(404).send('Not Found'); }
//     	// Push message object into array
 
//     	// chat.usersOnline.push(req.user._id);
//     	chat.save(function (err) {
// 	      if (err) { return handleError(res, err); }
// 	    	console.log('chat info', chat);
// 	      return res.status(200).json(chat);
// 	    });
//     });
// };

function handleError(res, err) {
  return res.status(500).send(err);
}
