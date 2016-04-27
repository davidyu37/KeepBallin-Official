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
  title: String,
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
  reservation: {
    type: Schema.ObjectId,
    ref: 'Reservation',
    childPath: 'timeslot'
  },
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
    var model = this;
    var i = 1;
    async.whilst(function() { return i <= numOfTimeSlot; }, function(callback) {
      //If it's not the first timeslot set end time to the end of last timeslot
      if(i > 1) {
        obj.start = start.add(30, 'm');
      }
      var newend = end.add(30, 'm');
      obj.end = newend;
      // i++;
      model.findOne({$and: [

        { start: obj.start },
        { end: obj.end }

      ]}, function(err, data) {
        if(err) { console.console(err); return; }
        //When there's no timeslot yet, create one
        if(!data) {
          //When there's no timeslot, push the data to slots
          var newSlot = new model();
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

          completeSlot.save(function(err, data) {
            i++;
            callback(null);
          });

        } else {
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
          }

          if(data.numOfPeople >= data.maxCapacity) {
            data.full = true;
          }

          data.save(function(err, data) {
            i++;
            callback(null);
          }); 
        }
        
      });


    }, function(err) {
      if(err) {
        console.console('error while saving timeslot', err);
      }
      cb();
    });
  },
  findByCourt: function(id, cb) {
    var dateNow = new Date();
    this.find({ 'courtReserved': id, 'start': {$gt: dateNow}})
    .exec(cb);
  }
};

module.exports = mongoose.model('Timeslot', TimeslotSchema);