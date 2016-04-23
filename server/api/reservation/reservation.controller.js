/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/reservations              ->  index
 */

'use strict';

var _ = require('lodash');
var Reservation = require('./reservation.model');
var Timeslot = require('../timeslot/timeslot.model');

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
 	
 	//Calculate individual timeslot rev
 	var revenueOfSingleTimeslot = reserve.perPersonPrice / 2;
    
    //Prepare timeslot obj
    var singleTimeslot = {
    	beginTime: reserve.beginTime,
		endTime: reserve.endTime,
		numOfPeople: reserve.numOfPeople,
		minCapacity: reserve.minCapacity, 
		maxCapacity: reserve.maxCapacity,
		revenue: revenueOfSingleTimeslot,
		timeForConfirmation: reserve.timeForConfirmation,
		reservation: reserve._id,
		reserveBy: reserve.reserveBy
    };

    if(reserve.active) {
    	singleTimeslot.active = true;
    }

    //Calculate number of timeslots
    var numOfTimeSlot = reserve.duration / 0.5;
    
    //Create individual time slot
    Timeslot.generateTimeslot(singleTimeslot, numOfTimeSlot, function() {

	    return res.status(201).json(reserve);
    });
    
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}