'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

var RatingSchema = new Schema({
  rate: Number,
  court: {
  	type: Schema.ObjectId,
    ref: 'Court',
    childPath: 'ratings'
  },
  user: {
  	type: Schema.ObjectId,
    ref: 'User',
    childPath: 'courtRatings'
  }
});

RatingSchema.plugin(relationship, { relationshipPathName: ['user', 'court'] });


module.exports = mongoose.model('Rating', RatingSchema);