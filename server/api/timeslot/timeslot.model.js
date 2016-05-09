'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship'),
    moment = require('moment'),
    async = require('async'),
    _ = require('lodash');

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
  }
});

TimeslotSchema.plugin(relationship, { relationshipPathName: ['reservation', 'courtReserved'] });

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

          data.save(function(err, data) {
            i++;
            callback(null, timeslots, reservations);
          }); 
        }
      });

    }, function(err, arr, res) {
      if(err) {
        console.console('error while saving timeslot', err);
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
  //Cancellation
  cancelTimeslots: function(reservation, cb) {
    var Model = this;
    async.each(reservation.timeslot, function(slotId, callback) {
       Model.findById(slotId, function(err, timeslot) {
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
    });
  }
};

module.exports = mongoose.model('Timeslot', TimeslotSchema);