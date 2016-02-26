'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship"),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var InviteSchema = new Schema({
  dateCreated: {
  	type: Date, 
  	default: Date.now
  },
  creator: {
  	type: Schema.ObjectId,
    ref: 'User'
  },
  startTime: Date,
  endTime: Date,
  startDate: String,
  repeat: Boolean,
  repeatDay: String,
  repeatEndDate: Date,
  info: String,
  location: String,
  city: String,
  court: {
  	type: Schema.ObjectId,
    ref: 'Court'
  },
  participants: [{
  	type: Schema.ObjectId,
    ref: 'User',
    childPath: 'invitesJoined'
  }],
  peopleNeed: Number
});

InviteSchema.plugin(relationship, { relationshipPathName: ['participants']});

InviteSchema.plugin(deepPopulate, {
  populate: {
    'creator.avatar': {
      select: 'url'
    },
    'creator': {
      select: 'fbprofilepic name avatar'
    },
    'participants.avatar': {
      select: 'url'
    },
    'participants': {
      select: 'fbprofilepic name avatar'
    }
  }
});

InviteSchema.statics = {
  findByCity: function(city, cb) {
    var dateNow = new Date();
    this.find({'city': city, 'endTime': {$gt: dateNow}})
      .sort('startTime')
      .deepPopulate('creator.avatar creator participants.avatar participants')
      .exec(cb);
  },
  findAll: function(cb) {
    var dateNow = new Date();
    this.aggregate([
        { '$match': {'endTime': {$gt: dateNow}} },

        { '$group': {
            _id: { city: '$city' },
            'count': { '$sum': 1 }
          }
        }
      ], function(err,result) {
        cb(err, result);
      });
  }
};


module.exports = mongoose.model('Invite', InviteSchema);