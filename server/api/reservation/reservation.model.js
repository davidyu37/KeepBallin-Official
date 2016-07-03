'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    crypto = require('crypto');

var ReservationSchema = new Schema({
  dateReserved: Date,
  whoReserved: String,
  contactEmail: String,
  beginString: String,
  endString: String,
  start: Date,
  end: Date,
  flexible: {
    type: Boolean,
    default: false
  },
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
  courtName: String,
  courtAddress: String,
  courtLat: Number,
  courtLng: Number,
  timeslot: [{ type:Schema.ObjectId, ref:'Timeslot' }],
  hashedConfirmationCode: String,
  salt: String,
  status: {
    type: String, 
    default: 'waiting'
  },
  partialTimeslots: String,
  checkInTime: Date,
  checkOutTime: Date,
  mid: String
});

ReservationSchema.plugin(relationship, { relationshipPathName: ['reserveBy', 'courtReserved'] });

ReservationSchema.plugin(deepPopulate, {
  populate: {
    'timeslot': {
      select: 'start end numOfPeople minCapacity maxCapacity numOfPeopleTilFull numOfPeopleTilActive timeForConfirmation courtReserved active full'
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
  },

  getByUser: function(userId, cb) {
    this.find({reserveBy: userId})
      .deepPopulate('courtReserved')
      .exec(cb);
  },

  authenticate: function(plainText, reservation) {
    return this.encryptPassword(plainText, reservation.salt) === reservation.hashedConfirmationCode;
  },

  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  encryptPassword: function(password, salt) {
    if (!password || !salt) return '';
    var bufferSalt = new Buffer(salt, 'base64');
    return crypto.pbkdf2Sync(password, bufferSalt, 10000, 64).toString('base64');
  }
};


module.exports = mongoose.model('Reservation', ReservationSchema);