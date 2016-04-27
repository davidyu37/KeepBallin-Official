'use strict';

var _ = require('lodash');
var Timeslot = require('./timeslot.model');

// Gets a list of timeslots
exports.index = function(req, res) {
  Timeslot.find(function (err, timeslots) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(timeslots);
  });
};

// Gets a list of timeslots by court id
exports.getByCourtId = function(req, res) {
  console.log(req.params.id);
  Timeslot.findByCourt(req.params.id, function (err, timeslots) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(timeslots);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}