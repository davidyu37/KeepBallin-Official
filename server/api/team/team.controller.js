'use strict';

var _ = require('lodash');
var Team = require('./team.model');

// Get list of teams
exports.index = function(req, res) {
  Team.find(function (err, teams) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(teams);
  });
};

// Get a single team
exports.show = function(req, res) {
  Team.loadAll(req.params.id, function (err, team) {
    if(err) { return handleError(res, err); }
    if(!team) { return res.status(404).send('Not Found'); }
    return res.status(201).json(team[0]);
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
    updated.save(function (err) {
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