'use strict';

var _ = require('lodash');
var court = require('./court.model');

// Get list of courts
exports.index = function(req, res) {
  court.find(function (err, courts) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(courts);
  });
};

// Get a single court
exports.show = function(req, res) {
  court.findById(req.params.id, function (err, court) {
    if(err) { return handleError(res, err); }
    if(!court) { return res.status(404).send('Not Found'); }
    return res.json(court);
  });
};

// Get ratings of the court
exports.getRating = function(req, res) {
  court.getRatings(req.params.id, function (err, court) {
    if(err) { return handleError(res, err); }
    if(!court) { return res.status(404).send('Not Found'); }
    return res.json(court);
  });
};

exports.searchResult = function(req, res) {
  court.search(req.query, function (err, courts) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(courts);
  });
}


// Creates a new court in the DB.
exports.create = function(req, res) {
  //Attach user's id to court's info
  var userId = { creator: req.user._id };
  var newCourt = _.merge(req.body, userId);
  court.create(newCourt, function(err, court) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(court);
  });
};

// Updates an existing court in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  court.findById(req.params.id, function (err, court) {
    if (err) { return handleError(res, err); }
    if(!court) { return res.status(404).send('Not Found'); }
     //Attach user's id to court's info
    var userId = { lastEditedBy: req.user._id };
    var newCourt = _.merge(req.body, userId);
    var updated = _.merge(court, newCourt);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(court);
    });
  });
};

// Deletes a court from the DB.
exports.destroy = function(req, res) {
  court.findById(req.params.id, function (err, court) {
    if(err) { return handleError(res, err); }
    if(!court) { return res.status(404).send('Not Found'); }
    court.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}