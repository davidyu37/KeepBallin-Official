'use strict';

var _ = require('lodash');
var Conversation = require('./conversation.model');
var async = require('async');

// Get list of conversations
exports.index = function(req, res) {
  Conversation.find(function (err, conversations) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(conversations);
  });
};

// Get user's conversation
exports.getMails = function(req, res) {
  Conversation.findConvoByUser(req.user._id, function (err, conversation) {
    if(err) { return handleError(res, err); }
    if(!conversation) { return res.status(404).send('Not Found'); }
    return res.json(conversation);
  });
};

// Creates a new conversation in the DB.
exports.create = function(req, res) {
  //req.body is a single message
  var newThread = {
    messages:[req.body],
    participants: [req.body.from, req.body.to],
    status: [{user: req.body.from}, {user: req.body.to}]
  };
  Conversation.findByParticipants(newThread.participants, function(err, thread) {
    if(thread) {
      //If it already exist, push new message to array and update the date
      thread.messages.push({
        message: req.body.message,
        from: req.body.from,
        to: req.body.to
      });
      thread.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(thread);
      });
    } else {
      //Create a new thread if it doesn't exist yet
      Conversation.create(newThread, function(err, conversation) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(conversation);
      });
    }
  });
};

// Add new message to the thread of messages
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Conversation.findById(req.params.id, function (err, conversation) {
    if (err) { return handleError(res, err); }
    if(!conversation) { return res.status(404).send('Not Found'); }
    // var updated = _.merge(conversation, req.body);
    conversation.messages.push(req.body);
    // conversation.read = false;
    //Change all read status to false
    async.each(conversation.status,
      // 2nd param is the function that each item is passed to
      function(status, callback){
        status.read = false;
        //This callback is the third params below
        callback();
      },
      // 3rd param is the function to call when everything's done
      function(err){
        conversation.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.status(200).json(conversation);
        });
      }
    );//async ends


    // conversation.save(function (err) {
    //   if (err) { return handleError(res, err); }
    //   return res.status(200).json(conversation);
    // });
  });
};

exports.changeToRead = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Conversation.findById(req.params.id, function (err, conversation) {
    if (err) { return handleError(res, err); }
    if(!conversation) { return res.status(404).send('Not Found'); }
    //Check through each status, if user is there, change read to true
    async.each(conversation.status,
      // 2nd param is the function that each item is passed to
      function(status, callback){
        
        var userID = String(req.user._id);
        var userStatus = String(status.user);
      
        if(userID === userStatus) {
          status.read = true;
        }
        //This callback is the third params below
        callback();
      },
      // 3rd param is the function to call when everything's done
      function(err){
        conversation.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.status(200).json(conversation);
        });
      }
    );//async ends
  });
}

// Deletes a conversation from the DB.
exports.destroy = function(req, res) {
  Conversation.findById(req.params.id, function (err, conversation) {
    if(err) { return handleError(res, err); }
    if(!conversation) { return res.status(404).send('Not Found'); }
    conversation.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}