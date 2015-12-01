'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var TeamSchema = new Schema({
  name: String,
  members: [{
    account: {
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    position: String,
    name: String,
    confirmed: {
      type: Boolean,
      default: false
    }
  }],
  contactperson: {
    account: {
      type: Schema.Types.ObjectId, 
      ref: 'User',
      childPath: 'memberOf'
    },
    name: String,
    confirmed: {
      type: Boolean,
      default: false
    },
    number: Number,
    show: {
      type: Boolean,
      default: false
    },
    line: String,
    email: String
  },
  teampic: [{
    type: Schema.Types.ObjectId, 
    ref: 'Upload'
  }],
  founded: Date,
  intro: String,
  represent: String,
  school: {
    name: String,
    major: String,
    class: String
  },
  company: {
    name: String,
    department: String
  },
  club: {
    name: String
  },
  event: [{
    type: Schema.Types.ObjectId, 
    ref: 'Event'
  }],
  private: Boolean,
  other: String,
  win: Number,
  lose: Number,
  owner: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    childPath: 'team'
  },
  location: {
    court: {
      type: Schema.Types.ObjectId, 
      ref: 'Court'
    },
    name: String
  },
  date: { type: Date, default: Date.now }, 
});

// Add relationship plugin
TeamSchema.plugin(relationship, { relationshipPathName: 'owner'});

TeamSchema.plugin(deepPopulate, {
  populate: {
    'members.account.avatar': {
      select: 'url'
    },
    'members.account': {
      select: 'name avatar'
    },
    'members': {
      select: 'account position name confirmed'
    },
    'teampic': {
      select: 'url'
    }
  }
});

TeamSchema.statics = {
  findByIdAndPopulate: function(id, cb) {
    this.findOne({'_id': id})
      .deepPopulate('members.account.avatar members.account members teampic')
      .exec(cb);
  },
  findAndPopulate: function(cb) {
    this.find()
      .deepPopulate('members.account.avatar teampic')
      .exec(cb);
  }
};

module.exports = mongoose.model('Team', TeamSchema);