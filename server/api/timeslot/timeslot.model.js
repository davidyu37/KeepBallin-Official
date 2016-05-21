'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship'),
    moment = require('moment'),
    async = require('async'),
    _ = require('lodash'),
    schedule = require('node-schedule'),
    crypto = require('crypto');
var Reservation = require('../reservation/reservation.model');
//Stuff for sending notification email
var config = require('../../config/environment'),
    sendgrid  = require('sendgrid')(config.sendgrid.apiKey),
    hogan = require('hogan.js'),
    fs = require('fs'),
    qr = require('qr-image'),
    template = fs.readFileSync('server/api/reservation/success.hjs', 'utf-8'),
    failTemplate = fs.readFileSync('server/api/reservation/failure.hjs', 'utf-8'),
    compiledTemplate = hogan.compile(template),
    compiledFailTemplate = hogan.compile(failTemplate);
var QR = require('../../components/qrcode.service');
var SG = require('../../components/sendgrid.service');

var TimeslotSchema = new Schema({
  start: Date,
  end: Date,
  numOfPeople: Number,
  minCapacity: Number, 
  maxCapacity: Number,
  numOfPeopleTilFull: Number,
  numOfPeopleTilActive: Number,
  revenue: Number,
  timeForConfirmation: Date,
  active: {
    type: Boolean,
    default: false
  },
  full: {
    type: Boolean,
    default: false
  },
  notOpen: {
    type: Boolean,
    default: false
  },
  isFirstTimeslot: {
    type: Boolean,
    default: false
  },
  reservation: [{
    type: Schema.ObjectId,
    ref: 'Reservation',
    childPath: 'timeslot'
  }],
  courtReserved: {
    type: Schema.ObjectId,
    ref: 'Indoor',
    childPath: 'timeslot'
  },
  reserveBy: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  dateCreated: {
    type: Date,
    default: Date.now
  },
  scheduled: {
    type: Boolean,
    default: false
  }
});

TimeslotSchema.plugin(relationship, { relationshipPathName: ['reservation', 'courtReserved'] });

//Generate confirmation code
var randomValueHex = function(len) {
  return crypto.randomBytes(Math.ceil(len/2))
      .toString('hex') // convert to hexadecimal format
      .slice(0,len);   // return required number of characters
};

var scheduledChecking = function(timeslot, Model) {
  /* 
  1. Find the newest version of this timeslot
  2. Create two array of fixed and flexible reservation
  3. Sort individual array by length of duration
  4. Check the timeslots of each reservation by order
  5. Send notification based on the result of checking
  */
  var fixed = [],
  flexible = [];

  Model.findById(timeslot._id, function(err, t) {
    if(err) { console.log(err); }
    console.log('checking reservations', t.reservation);
    async.waterfall([
      function(callback) {
          //Loop through the reservation and create two array of fixed and flexible time
          async.each(t.reservation, function(id, cbForEach) {
            Reservation.findById(id, function(err, res) {
              //Organize to flexible and fixed array
              if(res.flexible) {
                flexible.push(res);
              } else {
                fixed.push(res);
              }
              cbForEach(err);
            });

          }, function(err){
              if( err ) {
                console.log('Error occur while arranging reservations');
                callback(err);
              } else {
                //Sort items in the fixed array by duration
                async.sortBy(fixed, function(res, sortByCb) {
                  sortByCb(null, res.duration*-1);
                }, function(err, finalFixed) {
                  callback(null, finalFixed, flexible);
                });
              }
          });
      },
      function(fixed, flexible, fixCB) {
        if(fixed[0]) {
          //Define recursive function
          console.log('number of fixed reservation', fixed.length);
          var startCheck = function(queue, i) {
            Model.checkActive(queue[i].timeslot, function(active) {
              if(active) {
                //Success notification
                if(!queue[i].hashedConfirmationCode) {
                  var confirmationCode = randomValueHex(7);
                  console.log('Confirmation Code', confirmationCode);
                  //Make hash code
                  queue[i].hashedConfirmationCode = Reservation.encryptPassword(confirmationCode, queue[i].salt);
                  queue[i].active = true;
                  queue[i].status = 'completed';
                  queue[i].save(function() {
                    console.log('reservation success', queue[i].beginString, queue[i].endString);
                    //Send notification
                    // QR.generateQRCode(confirmationCode, function(err, url) {
                    //   if(err) { console.log('error occur while upload qr code'); }
                    //   SG.sendNotice(queue[i], confirmationCode, url, 'success', function() {

                    //   }); 
                    // });
                    //Continue to next loop
                    if(i < queue.length - 1) {
                      startCheck(queue, i + 1);
                    }
                    if(i == queue.length - 1) {
                      //callback for the next function in waterfall
                      fixCB(null, flexible);
                    }
                  });
                }

              } else {
                //Fail notification
                //Return KB points
                //If the status is not canceled already, cancel the timeslot of the reservation
                if(!(queue[i].status == 'canceled')) {
                  console.log('reservation failed', queue[i].beginString, queue[i].endString);
                  //Update individual timeslots
                  Model.cancelTimeslots(queue[i], function() {
                    queue[i].status = 'canceled';
                    queue[i].save(function() {
                      // SG.sendNotice(queue[i], null, null, 'fail', function() {

                      // });
                      //Continue to next loop
                      if(i < queue.length - 1) {
                        startCheck(queue, i + 1);
                      }
                      if(i == queue.length - 1) {
                        //callback for the next function in waterfall
                        fixCB(null, flexible);
                      }
                    });
                  });
                }
              }//else ends
              
            });//checkActive ends
          };//startCheck recursive function ends

          startCheck(fixed, 0);
          
        } else {
          fixCB(null, flexible);
        }
      },
      function(flexible, flexCb) {
          console.log('number of flexible reservations', flexible.length);
          async.each(flexible, function(res, AeCb) {
            Model.checkAnyActive(res.timeslot, function(actives, inactives) {
              if(actives.length > 0) {
                //If there's at least one active timeslot, it's success
                var confirmationCode = randomValueHex(7);
                console.log('Confirmation Code', confirmationCode);
                //Make hash code
                res.hashedConfirmationCode = Reservation.encryptPassword(confirmationCode, res.salt);
                res.active = true;
                res.status = 'completed';
                res.save(function(err) {
                  if(err) { console.log('err while saving flexible success reservation', err ); }
                  //Send notification
                  QR.generateQRCode(confirmationCode, function(err, url) {
                    if(err) { console.log('error occur while upload qr code'); }
                    if(res.timeslot == actives.length) {
                    //If all successful, send normal success email
                      console.log('all timeslots successful', res.beginString, res.endString);
                      SG.sendNotice(res, confirmationCode, url, 'success', function() {}); 
                    } else {
                      //Send partial success email
                      console.log('partially successful', res.beginString, res.endString);
                      //save the new price and return partial kb point

                    }
                  });
                  AeCb();
                });
              } else {
                //If there's no active, it fails
                console.log('reservation failed', res.beginString, res.endString);
                // SG.sendNotice(res, null, null, 'fail', function() {});
                res.status = 'canceled';
                res.save(function() {
                  AeCb();
                });
              }
              
            });
          }, function(err) {
            //Final callback of the async waterfall
            flexCb(null, 'done');
          });//async each ends
      }
    ], function (err, result) {
        // result now equals 'done'
    }); 
  });
};

TimeslotSchema.statics = {
  generateTimeslot: function(obj, numOfTimeSlot, cb) {
    var start = moment(obj.start);
    var end = moment(obj.start);
    var Model = this;
    var i = 1;
    var timeslots = [];
    var reservations = [];
    async.whilst(function() { return i <= numOfTimeSlot; }, function(callback) {
      //If it's not the first timeslot set end time to the end of last timeslot
      if(i > 1) {
        obj.start = start.add(30, 'm');
      }
      var newend = end.add(30, 'm');
      obj.end = newend;
      Model.findOne({$and: [

        { start: obj.start },
        { end: obj.end },
        { courtReserved: obj.courtReserved }

      ]}, function(err, data) {
        if(err) { console.console(err); return; }
        //When there's no timeslot yet, create one
        if(!data) {
          //When there's no timeslot, push the data to slots
          var newSlot = new Model();
          if(i == 1) {
            //If it's the first timeslot, record the reservation id
            var timeslotOf = {
              isFirstTimeslot: true
            };
            newSlot = _.merge(newSlot, timeslotOf);
          }
          var completeSlot = _.merge(newSlot, obj);

          //calculate numOfPeopleTilActive and numOfPeopleTilFull
          if(completeSlot.numOfPeople <= completeSlot.minCapacity) {
            completeSlot.numOfPeopleTilActive = completeSlot.minCapacity - completeSlot.numOfPeople;  
          }

          if(completeSlot.numOfPeople <= completeSlot.maxCapacity) {
            completeSlot.numOfPeopleTilFull = completeSlot.maxCapacity - completeSlot.numOfPeople;
          }


          //check if the current numOfPeople fulfills the minCapacity
          if(completeSlot.numOfPeople >= completeSlot.minCapacity) {
            completeSlot.active = true;
          }

          if(completeSlot.numOfPeople >= completeSlot.maxCapacity) {
            completeSlot.full = true;
          }

          timeslots.push(completeSlot._id);

          completeSlot.save(function(err, data) {
            if(err) {
              console.log('err while saving new timeslot', err);
            }
            //Schedule the task for reservations checking here
            //Only schedule checking task for the first timeslot of the reservation
            if(i == 1) {
              if(completeSlot.scheduled === false) {
                console.log('scheduled checking for new timeslots', completeSlot._id);
                //The scheduled time should be timeForConfirmation
                // var date = moment("2016-05-17 22:40:00")._d;
                var date = moment().add(2, 'm').toDate();
                var j = schedule.scheduleJob(date, function(y){
                  //Check if all timeslots are active
                  scheduledChecking(completeSlot, Model); 
                });//Schedule ends
                //Set scheduledChecking to true to prevent multiple checking
                completeSlot.scheduled = true;
                completeSlot.save(function(err) {
                  if(err) {
                    console.log('error happen when saving scheduled', err);
                  }
                });
              }
            }
            i++;
            callback(null, timeslots, reservations);
          });

        } else {
          //Add reservation
          data.reservation.push(obj.reservation);
          //Check if user already reserve before
          if(data.reserveBy.indexOf(obj.reserveBy) < 0) {
            data.reserveBy.push(obj.reserveBy);
          }

          data.reserveBy = _.merge(data.reserveBy, obj.reserveBy);
          //Update the notification time
          data.timeForConfirmation = obj.timeForConfirmation;
          //When the data exist, update the number of people
          data.numOfPeople += obj.numOfPeople;

          //calculate numOfPeopleTilActive and numOfPeopleTilFull
          if(data.numOfPeople <= data.minCapacity) {
            data.numOfPeopleTilActive = data.minCapacity - data.numOfPeople;  
          }

          if(data.numOfPeople <= data.maxCapacity) {
            data.numOfPeopleTilFull = data.maxCapacity - data.numOfPeople;
          }

          //check if the current numOfPeople fulfills the minCapacity
          if(data.numOfPeople >= data.minCapacity) {
            data.active = true;
            reservations = _.merge(reservations, data.reservation);
          }

          if(data.numOfPeople >= data.maxCapacity) {
            data.full = true;
          }

          timeslots.push(data._id);

          if(i == 1) {
            data.isFirstTimeslot = true;
          }

          data.save(function(err, d) {
            if(err) {
              console.log('old timeslot save err', err);
            }
            //Schedule the task for reservations checking here
            if(i == 1) {
              console.log('data.scheduled', data.scheduled);
              if(data.scheduled === false) {
                //The scheduled time should be timeForConfirmation
                // var date = moment("2016-05-17 22:40:00")._d;
                console.log('scheduled checking for old timeslots', data._id);
                var date = moment().add(2, 'm').toDate();
                var j = schedule.scheduleJob(date, function(y){
                  //Check if all timeslots are active
                  scheduledChecking(data, Model);
                });//Schedule ends
                //Set scheduledChecking to true to prevent multiple checking
                data.scheduled = true;
                //If it's the first timeslot, record the reservation id
                data.save();
              }
            }
            i++;
            callback(null, timeslots, reservations);
          }); 
        }
      });

    }, function(err, arr, res) {
      if(err) {
        console.log('error while saving timeslot', err);
      }
      cb(arr, res);
    });
  },
  findByCourt: function(id, cb) {
    var dateNow = new Date();
    this.find({ 'courtReserved': id, 'start': {$gt: dateNow}})
    .exec(cb);
  },
  //Checks the timeslots for active
  checkActive: function(arryOfIds, cb) {
    var Model = this;
    async.reduce(arryOfIds, true, function(active, id, callback){
        Model.findById(id, 'active reservation', function(err, timeslot) {
          //When at least one timeslot is not active, return active = false
          if( active === false ) {
            //There's already a timeslot that's not active, do nothing
            callback(null, active);
          } else {
            //Initial value is true, so the first timeslot will come here, if it's active, it will stay true
            if(!timeslot.active) {
              active = false;
            }
            callback(null, active);
          }
        });
    }, function(err, result){
        cb(result);
    });
  },
  //Check any active
  checkAnyActive: function(arryOfIds, cb) {
    var Model = this;
    //array that stores all the timeslots
    console.log('number of timeslots', arryOfIds.length);
    var actives = [];
    var inactives = [];
    var counter = 1;
    async.each(arryOfIds, function(id, callback) {
      Model.findById(id, function(err, timeslot) {
        if(timeslot.active) {
          actives.push(timeslot);
        } else {
          inactives.push(timeslot);
        }
        callback();
      });
    }, function(err) {
      if(err) { console.log('err while checking flexible timeslots', err); }
      //This callback is called when all loops are completed
      console.log('all timeslots checked');
      console.log('# of actives', actives.length);
      console.log('# of inactives', inactives.length);
      cb(actives, inactives);
    });
  },
  //Cancellation
  cancelTimeslots: function(reservation, cb) {
    var Model = this;
    async.each(reservation.timeslot, function(slotId, callback) {
       Model.findById(slotId, function(err, timeslot) {
        console.log('timeslot canceled', timeslot.start, timeslot.end);
        //Change the number of people for the timeslot
        timeslot.numOfPeople -= reservation.numOfPeople;
        //Change numOfPeopleTilActive
        if(timeslot.numOfPeople <= timeslot.minCapacity) {
          timeslot.numOfPeopleTilActive = timeslot.minCapacity - timeslot.numOfPeople;  
        }
        //Change numOfPeopleTilFull
        if(timeslot.numOfPeople <= timeslot.maxCapacity) {
          timeslot.numOfPeopleTilFull = timeslot.maxCapacity - timeslot.numOfPeople;
        }
        //Change active or full base on numOfPeople
        if(timeslot.numOfPeople < timeslot.maxCapacity) {
          timeslot.full = false;
        }

        if(timeslot.numOfPeople < timeslot.minCapacity) {
          //When timeslot's num of people falls below min capacity, it's not active
          timeslot.active = false;
        }

        //Remove reservation from reservation array
        var indexOfReservation = timeslot.reservation.indexOf(reservation._id);
        timeslot.reservation.splice(indexOfReservation, 1);

        //Remove user id from reserveby array
        var indexOfUser = timeslot.reserveBy.indexOf(reservation.reserveBy);
        timeslot.reserveBy.splice(indexOfUser, 1);
        
        timeslot.save(function(err, data) {
          if(err) { console.log(err); }
          callback();
        });

       });
    }, function(err) {
      cb();
    });//async each ends
  }
};

module.exports = mongoose.model('Timeslot', TimeslotSchema);