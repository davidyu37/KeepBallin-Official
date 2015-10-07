/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /courts              ->  index
 * POST    /courts              ->  create
 * GET     /courts/:id          ->  show
 * PUT     /courts/:id          ->  update
 * DELETE  /courts/:id          ->  destroy
 */

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
  court.create(req.body, function(err, court) {
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
    var updated = _.merge(court, req.body);
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