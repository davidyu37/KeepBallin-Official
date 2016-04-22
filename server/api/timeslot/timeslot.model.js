'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

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

module.exports = mongoose.model('Timeslot', TimeslotSchema);