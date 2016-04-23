'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship'),
    moment = require('moment'),
    async = require('async'),
    _ = require('lodash');

var TimeslotSchema = new Schema({
  beginTime: Date,
  endTime: Date,
  numOfPeople: Number,
  minCapacity: Number, 
  maxCapacity: Number,
  revenue: Number,
  timeForConfirmation: Date,
  active: {
    type: Boolean,
    default: false
  },
  reservation: {
    type: Schema.ObjectId,
    ref: 'Reservation',
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

TimeslotSchema.plugin(relationship, { relationshipPathName: 'reservation' });

TimeslotSchema.statics = {
  generateTimeslot: function(obj, numOfTimeSlot, cb) {
    var beginTime = moment(obj.beginTime);
    var endTime = moment(obj.beginTime);
    var slots = [];
    var model = this;
    var i = 1;
    async.whilst(function() { return i <= numOfTimeSlot; }, function(callback) {
      //If it's not the first timeslot set end time to the end of last timeslot
      if(i > 1) {
        obj.beginTime = beginTime.add(30, 'm');
      }
      var newEndTime = endTime.add(30, 'm');
      obj.endTime = newEndTime;
      // i++;
      model.findOne({$and: [

        { beginTime: obj.beginTime },
        { endTime: obj.endTime }

      ]}, function(err, data) {
        if(err) { console.console(err); return; }
        //When there's no timeslot yet, create one
        if(!data) {
          //When there's no timeslot, push the data to slots
          var newSlot = new model();
          var completeSlot = _.merge(newSlot, obj);

          completeSlot.save(function(err, data) {
            slots.push(data);
            i++;
            callback(null);
          });

        } else {
          //When the data exist, update the number of people
          data.numOfPeople += obj.numOfPeople;
          //check if the current numOfPeople fulfills the minCapacity
          if(data.numOfPeople >= data.minCapacity) {
            data.active = true;
          }
          data.save(function(err, data) {
            slots.push(data);
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
  }
};

module.exports = mongoose.model('Timeslot', TimeslotSchema);