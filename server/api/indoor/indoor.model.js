'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    // mongoosastic = require('mongoosastic'),
    // ObjectId = Schema.ObjectId,
    relationship = require("mongoose-relationship"),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var IndoorSchema = new Schema({
  country: {type: String, default: 'Taiwan'},
  court: String,
  city: String,
  district: String,
  lat: Number,
  long: Number,
  address: String,
  contactname: String,
  contactemail: String,
  contactrelation: String,
  telnumber: String,
  desc: String,
  isPublic: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  hours: Object,
  basketnumber: Number,
  courtnumber: Number,
  floor: String,
  water: { type: Boolean, default: false },
  toilet: { type: Boolean, default: false },
  lights: { type: Boolean, default: false },
  indoor: {type: Boolean, default: false},
  bench: { type: Boolean, default: false },
  dateCreated: {type: Date, default: Date.now},
  rentprice: Number,
  perPersonPrice: Number,
  maxRevenue: Number,
  minCapacity: Number,
  maxCapacity: Number,
  rules: String,
  hoursBeforeReserve: Number,
  averagedRating: Number,
  ratings: [{
    type: Schema.ObjectId, 
    ref: 'Rating'
  }],
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    childPath: 'courtManagerOf'
  },
  pictures: [String],
  reservation: [{
    type: Schema.ObjectId,
    ref: 'Reservation'    
  }],
  timeslot: [{
    type: Schema.ObjectId,
    ref: 'Timeslot'
  }]
});

// //Record the creator of the court
IndoorSchema.plugin(relationship, { relationshipPathName:'creator' });

IndoorSchema.statics = {
  getPublic: function(id, cb) {
    this.findOne({$and: [
       {_id: id}, {isPublic: true}
      ]})
      .exec(cb);

  },
  //Only return courts that public and approved
  queryPublic: function(cb) {
    this.find({
      $and: [
        {isPublic: true},
        {approved: true}
      ]
    })
    .exec(cb);
  }
};
// // $** wildcard text search
// // CourtSchema.index({ "$**": "text" });

// IndoorSchema.index({ court: "text", address: "text" } );

module.exports = mongoose.model('Indoor', IndoorSchema);