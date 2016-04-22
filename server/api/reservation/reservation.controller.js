/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/reservations              ->  index
 */

'use strict';

var _ = require('lodash');
var Reservation = require('./reservation.model');

// Gets a list of Reservations
exports.index = function(req, res) {
  Reservation.find(function (err, reservations) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(reservations);
  });
};

// Creates a new invite in the DB.
exports.create = function(req, res) {
  //Attach user's id to invite's info
  var userId = { reserveBy: req.user._id };
  var newReserve = _.merge(req.body, userId);
  Reservation.create(newReserve, function(err, reserve) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(reserve);
  });
};