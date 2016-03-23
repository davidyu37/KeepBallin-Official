/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/globals              ->  index
 */

'use strict';

var _ = require('lodash'),
    Global = require('./global.model');



//Enter the global room, push user's id to usersOnline array
exports.loadOrCreate = function(req, res) {
	Global.loadInitialRoom(function (global) {
    	// if(err) { return handleError(res, err); }
    	if(!global) { return res.status(404).send('Not Found'); }
        //If there's no err, simply sends it to client
        return res.status(200).json(global);
    });
};

exports.enterRoom = function(req, res) {
	//Find global room by id, req.body.id
	Global.findById(req.body.id, function(err, global) {
		if(err) { return handleError(res, err); }
		//Push user name to user online
		global.usersOnline.push(req.body.name);
		global.save(function(err, saved) {
			if(err) { return handleError(res, err); }
			return res.status(201).json(saved);
		});
	});
};

//Send global message
// exports.sendMessage = function(req, res) {
// 	var message = {
// 		message: req.body.message,
//         by: req.body.by
// 	};
// 	Global.saveMessage(req.body.room, message, function(global) {
// 		return res.status(201).json(global);
// 	});
// };

//Async loading for messages
exports.loadMessage = function(req, res) {
    Global.asyncLoadMessages(req.body.room, function (global) {
        // if(err) { return handleError(res, err); }
        if(!global) { return res.status(404).send('Not Found'); }
        //If there's no err, simply sends it to client
        return res.status(200).json(global);
    });
};

// //only admin can create global room
// exports.createRoom = function(req, res) {
// 	//when global room id doesn't exist
// 	var global = new Global(_.merge(req.body));
// 	// _.merge({ author: req.user._id }, req.body)
// 	global.save(function(err, global) {
// 		if(err) { return handleError(res, err); }
// 		return res.status(201).json(global);
// 	});
// };

// //only admin can delete global room
// exports.destroy = function(req, res) {
// 	Global.findById(req.params.globalRoomId, function (err, global) {
//     if(err) { return handleError(res, err); }
//     if(!global) { return res.status(404).send('Not Found'); }
//     global.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.status(204).send('No Content');
//     });
//   });
// };

// //Get all the global rooms
// exports.getRooms = function(req, res) {
// 	Global.find(function (err, rooms) {
// 		if(err) { return handleError(res, err); }
// 		return res.status(200).json(rooms);
// 	});
// };

// //When user leaves the room
// exports.leaveRoom = function(req, res) {
// 	Global.findById(req.body.globalRoomId, function (err, global) {
//     	if(err) { return handleError(res, err); }
//     	if(!global) { return res.status(404).send('Not Found'); }
//     	//Find the user
//     	var index = global.usersOnline.indexOf(req.body.userId);
//     	global.usersOnline.splice(index, 1);
//     	// global.usersOnline.push(req.user._id);
//     	global.save(function (err) {
// 	      if (err) { return handleError(res, err); }
// 	      return res.status(200).json(global);
// 	    });
//     });
// };

// //Update room
// exports.update = function(req, res) {
//     if(req.body._id) { delete req.body._id; }
//   	Global.findById(req.params.globalRoomId, function (err, global) {
//     if (err) { return handleError(res, err); }
//     if(!global) { return res.status(404).send('Not Found'); }
//     global.usersOnline = req.body.usersOnline;
//     global = _.merge(req.body, global);
//     global.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.status(200).json(global);
//     });
//   });
// };


function handleError(res, err) {
	console.log(err);
  return res.status(500).send(err);
}
