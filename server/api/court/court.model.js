'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    relationship = require("mongoose-relationship"),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var CourtSchema = new Schema({
  country: {type: String, default: 'Taiwan'},
  court: String,
  city: String,
  district: String,
  lat: Number,
  long: Number,
  address: String,
  desc: String,
  hours: {begin: {type: Date, default: Date.now}, end: {type: Date, default: Date.now}},
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
  likes: Number,
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
    childPath: 'courtCreated'
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

//Record the creator of the court
CourtSchema.plugin(relationship, { relationshipPathName:'creator' });

CourtSchema.plugin(deepPopulate, {
  populate: {
    'pictures.user': {
      select: 'name'
    },
    'pictures': {
      select: 'url user'
    },
    'creator': {
      select: 'name'
    },
    'lastEditedBy': {
      select: 'name'
    }
  }
});

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
      .deepPopulate('pictures.user pictures creator lastEditedBy')
      .exec(cb);
  },
  //Populate all but individual ratings
  findAndPopulate: function(cb) {
    this.find()
    .deepPopulate('pictures.user pictures creator lastEditedBy')
    .exec(cb);
  },
  findOneAndPopulate: function(courtId, cb) {
    this.find({_id: courtId})
    .deepPopulate('pictures.user pictures creator lastEditedBy')
    .exec(cb);
  }
};
// $** wildcard text search
CourtSchema.index({ "$**": "text" });

module.exports = mongoose.model('Court', CourtSchema);