'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
  name: String,
  type: [{type: String}],
  info: String,
  begin: Date,
  end: Date,
  location: String,
  court: {
  	type: Schema.ObjectId,
    ref: 'Court'
  },
  //Picture of the event
  pics: [{
  	type: Schema.ObjectId,
    ref: 'Upload'
  }],
  //Establish relationship between event and user, 
  //when user joins the event, it adds to the list of events in their data
  participants: [{
  	type: Schema.ObjectId,
    ref: 'User'
  }],
  creator: {
  	type: Schema.ObjectId,
    ref: 'User'
  },
  dateCreated: {type: Date, default: Date.now},
  //Allow user to query the events according to the people that the events require
  lookFor: [String]

});

module.exports = mongoose.model('Event', EventSchema);