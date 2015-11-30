'use strict';

var _ = require('lodash');
var Team = require('./team.model');

// Get list of teams
exports.index = function(req, res) {
  Team.findAndPopulate(function (err, teams) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(teams);
  });
};

// Get a single team
exports.show = function(req, res) {
  Team.findByIdAndPopulate(req.params.id, function (err, team) {
    if(err) { return handleError(res, err); }
    if(!team) { return res.status(404).send('Not Found'); }
    return res.status(201).json(team);
  });
};

//Check if the team name already exist, if exist return true, else false
exports.checkName = function(req, res) {
  var send = {};
  Team.findOne({'name': req.params.name}, function (err, team) {
    if(err) { return handleError(res, err); }
    if(!team) { 
      send.exist = false;
      return res.status(201).json(send); 
    }
    send.exist = true;
    return res.status(201).json(send);
  });
};

// Creates a new team in the DB.
exports.create = function(req, res) {
  var team = new Team(_.merge({ owner: req.user._id }, req.body));
  team.save(function(err, team) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(team);
  });
};

// Updates an existing team in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Team.findById(req.params.id, function (err, team) {
    if (err) { return handleError(res, err); }
    if(!team) { return res.status(404).send('Not Found'); }
    var updated = _.merge(team, req.body);
    updated.members = req.body.members;
    
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(team);
    });
  });
};

//Update subdoc
// findOneAndUpdate(conditions, update, options, callback)
exports.updateInside = function(req, res) {
  Team.findOneAndUpdate(
    {'_id': req.params.id, 'members._id': req.params.memberId},
    {
      '$set': {
        'members.$.account': req.body.account,
        'members.$.confirmed': req.body.confirmed
      }
    },
    //Options for findOneAndUpdate
    {
      'new': true
    }, function (err, team) {
      if (err) { return handleError(res, err); }
      if(!team) { return res.status(404).send('Not Found'); }
      team.save(function (err) {
      if (err) { return handleError(res, err); }
        return res.status(200).json(team);
      });
  });
};

// Deletes a team from the DB.
exports.destroy = function(req, res) {
  Team.findById(req.params.id, function (err, team) {
    if(err) { return handleError(res, err); }
    if(!team) { return res.status(404).send('Not Found'); }
    team.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}