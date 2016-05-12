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
//Stuff for sending notification email
var config = require('../../config/environment'),
sendgrid  = require('sendgrid')(config.sendgrid.apiKey),
hogan = require('hogan.js'),
fs = require('fs'),
qr = require('qr-image'),
template = fs.readFileSync('server/api/reservation/success.hjs', 'utf-8'),
compiledTemplate = hogan.compile(template);
//AWS uploading for QR code
var uuid = require('uuid');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  accessKeyId: config.s3.key,
  secretAccessKey: config.s3.secret
});


function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

//Generate QR code and upload it to S3
var generateQRCode = function(code, callback) {

  var png_string = qr.imageSync(code, { type: 'png' });
  
  var destination = 'pictures/reservation/' + uuid.v4() + '.png';

  var params = {
    Bucket: 'keepballin', /* required */
    Key: destination, /* required */
    ACL: 'public-read',
    Body: png_string,
    ContentType: 'png'
    // Expires: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
  };
  s3.putObject(params, function(err, data) {
    if (err) { console.log(err, err.stack); 
      // an error occurred
      callback(err);
    }
    else { 
      // successful response
      s3.getSignedUrl('putObject', params, function (err, url) {

        var searched = url.search('png');

        searched += 3;

        var sliced = url.slice(0, searched);
        
        callback(null, sliced);
      });
    }          
  });
};

//Send notification
var sendNotice = function(req, reserve, code, dateString, url) {

  sendgrid.send({
      to:       req.user.email,
      from:     config.email.me,
      subject:  '預約成功',
      html: compiledTemplate.render({
        name: req.user.name, 
        confirmationCode: code, 
        dateReserved: dateString,
        startTime: reserve.beginString,
        endTime: reserve.endString,
        numOfPeople: reserve.numOfPeople,
        courtName: req.body.court,
        courtAddress: req.body.address,
        pricePaid: reserve.pricePaid,
        url: url
      })
    }, function(err, json) {
      if (err) { return console.error(err); }
      console.log('email sent');
      //Record that email has been sent
      // return res.status(200);
  });

};

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
  //Create salt
  newReserve.salt = Reservation.makeSalt();

  Reservation.create(newReserve, function(err, reserve) {
    if(err) { return handleError(res, err); }

    if(reserve.active) {
      //The reservation is already active, generate confirmation code and notify
      var confirmationCode = randomValueHex(7);
      console.log('Confirmation Code', confirmationCode);
      //Make salt and hash code
      reserve.hashedConfirmationCode = Reservation.encryptPassword(confirmationCode, reserve.salt);
      reserve.status = 'completed';
      reserve.save(function() {
        var dateReservedString = moment(reserve.dateReserved);
        dateReservedString.format('MM DD YYYY');
        generateQRCode(confirmationCode, function(err, url) {
          if(err) { console.log('error occur while upload qr code'); }
          sendNotice(req, reserve, confirmationCode, dateReservedString, url); 
        });
        //send email and notify this mofo
        // sendgrid.send({
        //     to:       req.user.email,
        //     from:     config.email.me,
        //     subject:  '預約成功',
        //     html: compiledTemplate.render({
        //       name: req.user.name, 
        //       confirmationCode: confirmationCode, 
        //       dateReserved: dateReservedString,
        //       startTime: reserve.beginString,
        //       endTime: reserve.endString,
        //       numOfPeople: reserve.numOfPeople,
        //       courtName: req.body.court,
        //       courtAddress: req.body.address,
        //       pricePaid: reserve.pricePaid
        //     })
        //   }, function(err, json) {
        //     if (err) { return console.error(err); }
        //     //Record that email has been sent
        //     return res.status(200);
        // });

      });
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
        Timeslot.checkActive(slots, function(active) {
          //Success notification
          if(active) {
            console.log('reservation completed');
            var confirmationCode = randomValueHex(7);
            console.log('Confirmation Code', confirmationCode);
            //Make hash code
            reserve.hashedConfirmationCode = Reservation.encryptPassword(confirmationCode, reserve.salt);
            reserve.active = true;
            reserve.status = 'completed';
            reserve.save();
            //Send notification


          } else {
            //Failed reservation notice
            //Return KB points
            console.log('reservation failed');
            //Update individual timeslots
            Timeslot.cancelTimeslots(reserve, function() {
              console.log('timeslot updated', reserve.timeslot);
              reserve.status = 'canceled';
              reserve.save();
            });

          }
        });
      });
      return res.status(201).json(reserve);
    });
    
    
  });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}