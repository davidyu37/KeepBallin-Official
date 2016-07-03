'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

var RatingSchema = new Schema({
  rate: Number,
  reason: String,
  court: {
  	type: Schema.ObjectId,
    ref: 'Court',
    childPath: 'ratings'
  },
  user: {
  	type: Schema.ObjectId,
    ref: 'User',
    childPath: 'courtRatings'
  },
  indoor: {
    type: Schema.ObjectId,
    ref: 'Indoor',
    childPath: 'ratings'
  }
});

RatingSchema.plugin(relationship, { relationshipPathName: ['user', 'court', 'indoor'] });


module.exports = mongoose.model('Rating', RatingSchema);