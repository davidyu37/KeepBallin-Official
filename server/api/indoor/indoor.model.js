'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
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
  indoor: {type: Boolean, default: true},
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
  }],
  courtID: {
    type: Schema.ObjectId,
    ref: 'Court'
  },
  views: {
    type: Number,
    default: 0
  }
});

// //Record the creator of the court
IndoorSchema.plugin(relationship, { relationshipPathName:'creator', triggerMiddleware: true });

IndoorSchema.plugin(deepPopulate, {
  populate: {
    'reservation': {
      select: 'dateReserved whoReserved contactEmail beginString endString start end flexible numOfPeople pricePaid duration timeForConfirmation active dateCreated status'
    },
    'ratings.user.avatar': {
      select: 'url'
    },
    'ratings.user': {
      select: 'avatar name'
    },
    'ratings': {
      select: 'user rate reason'
    }
  }
});

IndoorSchema.statics = {
  getRatings: function(courtID, cb) {
    this.findOne({_id: courtID})
      .deepPopulate('ratings.user.avatar ratings.user ratings')
      .select('ratings')
      .exec(cb);
  },
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
  },
  //Only for admin or creator of the court
  getPopulated: function(id, cb) {
    this.findById(id)
    .deepPopulate('reservation')
    .exec(cb);
  },
  //Check if user if the creator of the court
  checkCreator: function(indoorId, userId, cb) {
    this.findById(indoorId, function(err, indoor) {
      var bool = indoor.creator === userId;
      cb(bool);
    });
  }
};
// // $** wildcard text search
// // CourtSchema.index({ "$**": "text" });

// IndoorSchema.index({ court: "text", address: "text" } );

module.exports = mongoose.model('Indoor', IndoorSchema);