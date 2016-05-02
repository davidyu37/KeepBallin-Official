'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

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

ReservationSchema.plugin(deepPopulate, {
  populate: {
    'timeslot': {
      select: 'start end numOfPeopleTilFull numOfPeopleTilActive active full'
    },
    'courtReserved': {
      select: 'court address'
    }
  }
});

ReservationSchema.statics = {
  getReservation: function(id, userId, cb) {
    //find reservation by id and userId
    this.findOne({$and: [
       {_id: id}, {reserveBy: userId}
      ]})
      .deepPopulate('timeslot courtReserved')
      .exec(cb);
  }
  // getTimeslots: function(id, cb) {
  //   //find reservation timeslot ids
  //   this.findOne({_id: id})
  //   .select('timeslot')
  //   .exec(cb);
  // }
};


module.exports = mongoose.model('Reservation', ReservationSchema);