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
  pictures: [{
    type: Schema.ObjectId,
    ref: 'Upload'
  }]
});

// //Record the creator of the court
IndoorSchema.plugin(relationship, { relationshipPathName:'creator' });

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