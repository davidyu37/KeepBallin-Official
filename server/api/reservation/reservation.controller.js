/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/reservations              ->  index
 */

'use strict';

var _ = require('lodash'),
Reservation = require('./reservation.model'),
Timeslot = require('../timeslot/timeslot.model'),
schedule = require('node-schedule'),
moment = require('moment'),
async = require('async'),
crypto = require('crypto');

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}


// Gets a list of Reservations
exports.index = function(req, res) {
  Reservation.find(function (err, reservations) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(reservations);
  });
};

// Get a single Reservation
exports.show = function(req, res) {
  Reservation.getReservation(req.params.id, req.user._id, function (err, reservation) {
    if(err) { return handleError(res, err); }
    if(!reservation) { return res.status(404).send('Not Found'); }
    return res.json(reservation);
  });
};

// Get a single Reservation for the user
exports.getByUser = function(req, res) {
  Reservation.getByUser( req.user._id, function (err, reservations) {
    if(err) { return handleError(res, err); }
    if(!reservations) { return res.status(404).send('Not Found'); }
    return res.json(reservations);
  });
};

// Creates a new invite in the DB.
exports.create = function(req, res) {
  //Attach user's id to invite's info
  var userId = { reserveBy: req.user._id };
  var newReserve = _.merge(req.body, userId);
  Reservation.create(newReserve, function(err, reserve) {
    if(err) { return handleError(res, err); }

    if(reserve.active) {
      //The reservation is already active, generate confirmation code and notify
      var confirmationCode = randomValueHex(7);
      console.log('Confirmation Code', confirmationCode);
      reserve.confirmationCode = confirmationCode;
      reserve.save();
    }
 	
 	  //Calculate individual timeslot rev
 	  var revenueOfSingleTimeslot = reserve.perPersonPrice / 2;
    
    //Prepare timeslot obj
    var singleTimeslot = {
    	start: reserve.beginTime,
  		end: reserve.endTime,
  		numOfPeople: reserve.numOfPeople,
  		minCapacity: reserve.minCapacity, 
  		maxCapacity: reserve.maxCapacity,
  		revenue: revenueOfSingleTimeslot,
  		timeForConfirmation: reserve.timeForConfirmation,
  		reservation: reserve._id,
  		reserveBy: reserve.reserveBy,
      courtReserved: reserve.courtReserved
    };

    if(reserve.active) {
    	singleTimeslot.active = true;
    }

    //Calculate number of timeslots
    var numOfTimeSlot = reserve.duration / 0.5;


    //Create individual time slot
    Timeslot.generateTimeslot(singleTimeslot, numOfTimeSlot, function(slots, reservationsNeedChecking) {
      reserve.timeslot = slots;
      //Save the timeslots to reservation if the timeslots already exist
      reserve.save();
      console.log('reservations that need checking', reservationsNeedChecking);
      if(reservationsNeedChecking) {
        async.each(reservationsNeedChecking, function(id, callback) {
          Reservation.findById(id, function(err, eachReserve) {
            if(err) { console.log(err); }
            Timeslot.checkActive(eachReserve.timeslot, function(active) {
              if(active) {
                //Only Do the following if it's not active
                if(!eachReserve.active) {
                  //If all the timeslots reserved are active, change reservation to active
                  eachReserve.active = true;
                  //Generate confirmation code
                  console.log('This reservation became active', eachReserve._id);
                  
                }
              } 
              eachReserve.save();
            })
          });
        }, function(err) {
          if(err) { console.log(err); }
        });
      }
  
      //Schedule reservation check
      //The scheduled time should be timeForConfirmation
      //For testing purpose the task will execute after two minute
      var date = moment();
      date = date.add(1, 'm').toDate();
      var j = schedule.scheduleJob(date, function(y){
        //Check if all timeslots are active
        // Reservation.getTimeslots(reserve._id, function(err, reservation) {
        //   if(err) { return handleError(res, err); }
          Timeslot.checkActive(slots, function(active) {
            //Success notification
            if(active) {
              console.log('reservation completed');
              var confirmationCode = randomValueHex(7);
              console.log('Confirmation Code', confirmationCode);
              reserve.confirmationCode = confirmationCode;
              reserve.save();
            } else {
              //Failed reservation notice
              //Return KB points
              //Update individual timeslots
              console.log('reservation failed');
            }
          });

        // });
      });
      return res.status(201).json(reserve);
    });
    
    
  });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}