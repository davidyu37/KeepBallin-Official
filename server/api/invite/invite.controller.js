'use strict';

var _ = require('lodash');
var Invite = require('./invite.model');

// Creates a new invite in the DB.
exports.create = function(req, res) {
  //Attach user's id to invite's info
  var userId = { creator: req.user._id };
  var newinvite = _.merge(req.body, userId);
  Invite.create(newinvite, function(err, invite) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(invite);
  });
};

// Get invites by city name
exports.show = function(req, res) {
  Invite.findByCity(req.params.city, function (err, invite) {
    if(err) { return handleError(res, err); }
    if(!invite) { return res.status(404).send('Not Found'); }
    return res.status(201).json(invite);
  });
};

// Add participant
exports.add = function(req, res) {
  Invite.findById(req.params.id, function(err, invite) {
    if(err) { return handleError(res, err); }
    if(!invite) { return res.status(404).send('Not Found'); }
    var indexOfUser = invite.participants.indexOf(req.user._id);
    if(indexOfUser >= 0) {
      //User already exist, don't do shit
      return res.status(200).json(invite);
    } else {
      invite.participants.push(req.user._id);
      invite.peopleNeed = invite.peopleNeed - 1;
      invite.save(function(err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(invite);
      });
    }
  });
};

// Remove participant

exports.minus = function(req, res) {
  Invite.findById(req.params.id, function(err, invite) {
    if(err) { return handleError(res, err); }
    if(!invite) { return res.status(404).send('Not Found'); }
    var indexOfUser = invite.participants.indexOf(req.user._id);
    if(indexOfUser >= 0) {
      // User already exist, remove it
      invite.participants.splice(indexOfUser, 1);
      invite.peopleNeed = invite.peopleNeed + 1;
      invite.save(function(err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(invite);
      });
    } else {
      // If user doesn't exist, don't do shit
      return res.status(200).json(invite);
    }
  });
};

// Updates an existing invite in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Invite.findById(req.params.id, function (err, invite) {
    if (err) { return handleError(res, err); }
    if(!invite) { return res.status(404).send('Not Found'); }
    var updated = _.merge(invite, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(invite);
    });
  });
};

// Deletes a invite from the DB.
exports.destroy = function(req, res) {
  Invite.findById(req.params.id, function (err, invite) {
    if(err) { return handleError(res, err); }
    if(!invite) { return res.status(404).send('Not Found'); }
    invite.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};


function handleError(res, err) {
  console.error(err);
  return res.status(500).send(err);
}