'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship"),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var EventSchema = new Schema({
  name: String,
  type: [String],
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
    ref: 'User',
    childPath: 'eventsJoined'
  }],
  creator: {
  	type: Schema.ObjectId,
    ref: 'User'
  },
  dateCreated: {type: Date, default: Date.now},
  //Allow user to query the events according to the people that the events require
  lookFor: [String]

});

EventSchema.plugin(relationship, { relationshipPathName:'participants' });

EventSchema.plugin(deepPopulate, {
  populate: {
    'creator.avatar': {
      select: 'url'
    },
    'creator': {
      select: 'name avatar'
    },
    'court': {
      select: 'court lat long'
    },
    'participants': {
      select: 'name avatar'
    },
    'participants.avatar': {
      select: 'url'
    }
  }
});

EventSchema.statics = {
  //Populate all but individual ratings
  findAndPopulate: function(id, cb) {
    this.findOne({_id: id})
    .deepPopulate('creator.avatar creator court participants participants.avatar')
    .exec(cb);
  }
};

module.exports = mongoose.model('Event', EventSchema);