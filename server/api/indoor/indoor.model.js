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
  desc: String,
  isPublic: { type: Boolean, default: false },
  hours: [{begin: {type: Date, default: Date.now}, end: {type: Date, default: Date.now}, day: String, isOpen: Boolean}],
  peaktime: {begin: {type: Date, default: Date.now}, end: {type: Date, default: Date.now}},
  net: Boolean,
  nettype: String,
  basketnumber: Number,
  floor: String,
  water: {exist: Boolean, desc: String},
  toilet: {exist: Boolean, desc: String},
  ceiling: Boolean,
  lights: Boolean,
  indoor: {type: Boolean, default: false},
  dateCreated: {type: Date, default: Date.now},
  bench: Boolean,
  rent: Boolean,
  rentprice: Number,
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
  lastEditedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  pictures: [{
    type: Schema.ObjectId,
    ref: 'Upload'
  }]
});

// //Record the creator of the court
// IndoorSchema.plugin(relationship, { relationshipPathName:'creator' });

// IndoorSchema.plugin(deepPopulate, {
//   populate: {
//     'pictures.user': {
//       select: 'name'
//     },
//     'pictures': {
//       select: 'url user'
//     },
//     'creator': {
//       select: 'name'
//     },
//     'lastEditedBy': {
//       select: 'name'
//     },
//     'ratings.user.avatar': {
//       select: 'url'
//     },
//     'ratings.user': {
//       select: 'avatar name'
//     },
//     'ratings': {
//       select: 'user rate reason'
//     } 
//   }
// });
// //search plugin
// IndoorSchema.plugin(mongoosastic);

// IndoorSchema.statics = {
//   getRatings: function(courtID, cb) {
//     this.findOne({_id: courtID})
//       // .populate({path:'ratings', select: 'rate'})
//       .deepPopulate('ratings.user.avatar ratings.user ratings')
//       .select('ratings')
//       .exec(cb);
//   },
//   search: function(params, cb) {
//     var query = {
//       $text: { $search : params.query }
//     };
//     this.find(query)
//       .deepPopulate('pictures.user pictures creator lastEditedBy')
//       .exec(cb);
//   },
//   //Populate all but individual ratings
//   findAndPopulate: function(cb) {
//     this.find()
//     .deepPopulate('pictures.user pictures creator lastEditedBy')
//     .exec(cb);
//   },
//   findOneAndPopulate: function(courtId, cb) {
//     this.findOne({_id: courtId})
//     .deepPopulate('pictures.user pictures creator lastEditedBy')
//     .exec(cb);
//   }
// };
// // $** wildcard text search
// // CourtSchema.index({ "$**": "text" });

// IndoorSchema.index({ court: "text", address: "text" } );

module.exports = mongoose.model('Indoor', IndoorSchema);