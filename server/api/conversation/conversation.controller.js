'use strict';

var _ = require('lodash');
var Conversation = require('./conversation.model');

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
    participants: [req.body.from, req.body.to]
  };
  Conversation.findByParticipants(newThread.participants, function(err, thread) {
    if(thread) {
      //If it already exist, push new message to array and update the date
      thread.messages.push({
        message: req.body.message,
        from: req.body.from,
        to: req.body.to
      });
      // thread.date = Date.now;
      thread.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(thread);
      });
      // console.log(thread);
    } else {
      //Create a new thread if it doesn't exist yet
      Conversation.create(newThread, function(err, conversation) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(conversation);
      });
    }
  });
};

// Updates an existing conversation in the DB.
exports.update = function(req, res) {
  console.log(req.body);
  if(req.body._id) { delete req.body._id; }
  Conversation.findById(req.params.id, function (err, conversation) {
    if (err) { return handleError(res, err); }
    if(!conversation) { return res.status(404).send('Not Found'); }
    // var updated = _.merge(conversation, req.body);
    conversation.messages.push(req.body);
    conversation.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(conversation);
    });
  });
};

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