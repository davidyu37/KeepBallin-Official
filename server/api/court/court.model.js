'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    relationship = require("mongoose-relationship");

var CourtSchema = new Schema({
  country: {type: String, default: 'Taiwan'},
  court: String,
  city: String,
  district: String,
  lat: Number,
  long: Number,
  address: String,
  desc: String,
  hours: {begin: Date, end: Date},
  peaktime: {begin: Date, end: Date},
  net: Boolean,
  nettype: String,
  basketnumber: Number,
  floor: String,
  water: {exist: Boolean, desc: String},
  toilet: {exist: Boolean, desc: String},
  ceiling: Boolean,
  lights: Boolean,
  indoor: {type: Boolean, default: false},
  likes: Number,
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
    childPath: 'courtCreated'
  },
  lastEditedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

//Record the creator of the court
CourtSchema.plugin(relationship, { relationshipPathName:'creator' });

CourtSchema.statics = {
  getRatings: function(courtID, cb) {
    this.findOne({_id: courtID})
      .populate({path:'ratings', select: 'rate'})
      .exec(cb);
  },
  // || params.court || params.city || params.district || params.address
  search: function(params, cb) {
    var query = { $and: [] };
    for (var key in params){
      if(key === 'query') {
        query.$and.push({ $text: { $search : params.query }});
      } else {
        var thisParam = {};
        thisParam[key] = params[key];     
        query.$and.push(thisParam);
      }
    }
    this.find(query)
      .exec(cb);
  }
};
// $** wildcard text search
CourtSchema.index({ "$**": "text" });

module.exports = mongoose.model('Court', CourtSchema);