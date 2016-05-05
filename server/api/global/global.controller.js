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
        if(global.nonexist) {
            //Create new global
            var newGlobal = new Global();
            newGlobal.country = 'Taiwan';
            newGlobal.save(function(err, saved) {
                if(err) { return handleError(res, err); }
                console.log('new global created');
            });
        }
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


//Async loading for messages
exports.loadMessage = function(req, res) {
    Global.asyncLoadMessages(req.body.room, function (global) {
        // if(err) { return handleError(res, err); }
        if(!global) { return res.status(404).send('Not Found'); }
        //If there's no err, simply sends it to client
        return res.status(200).json(global);
    });
};


// //only admin can delete global room
exports.destroy = function(req, res) {
    console.log('body', req.body);
    Global.findById(req.body.globalId, function (err, global) {
        if(err) { return handleError(res, err); }
        if(!global) { return res.status(404).send('Not Found'); }
        global.messages.id(req.body.messageId).remove();
        global.save(function(err) {
            if(err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

function handleError(res, err) {
	console.log(err);
  return res.status(500).send(err);
}
