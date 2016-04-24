'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

var ReservationSchema = new Schema({
  dateReserved: Date,
  beginString: String,
  endString: String,
  beginTime: Date,
  endTime: Date,
  numOfPeople: Number,
  minCapacity: Number, 
  maxCapacity: Number,
  pricePaid: Number,
  perPersonPrice: Number,
  duration: Number,
  timeForConfirmation: Date,
  active: {
    type: Boolean,
    default: false
  },
  reserveBy: {
    type: Schema.ObjectId,
    ref: 'User',
    childPath: 'reservation'
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  courtReserved: {
    type: Schema.ObjectId,
    ref: 'Indoor',
    childPath: 'reservation'
  },
  timeslot: [{ type:Schema.ObjectId, ref:"Timeslot" }]
});

ReservationSchema.plugin(relationship, { relationshipPathName: ['reserveBy', 'courtReserved'] });


module.exports = mongoose.model('Reservation', ReservationSchema);