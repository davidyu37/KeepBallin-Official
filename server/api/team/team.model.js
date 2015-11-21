'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var relationship = require('mongoose-relationship');

var TeamSchema = new Schema({
  name: String,
  captain: {
    account: {
    	type: Schema.Types.ObjectId, 
    	ref: 'User'
    },
    name: String,
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  manager: {
    account: {
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    name: String,
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  coach: {
    account: {
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    name: String,
    confirmed: {
      type: Boolean,
      default: false
    }
  },
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
      ref: 'User'
    },
    name: String,
    confirmed: {
      type: Boolean,
      default: false
    },
    number: Number
  },
  teampic: {
    type: Schema.Types.ObjectId, 
    ref: 'Upload'
  },
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
  private: Boolean,
  other: String,
  win: Number,
  lose: Number,
  contact: Number,
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
}, {strict: false});

// Add relationship plugin
TeamSchema.plugin(relationship, { relationshipPathName: 'owner'});


TeamSchema.statics = {
  loadAll: function(id, cb) {
    this.find({'_id': id})
      .populate(
      {
        path: 'captain',
        select: '-salt -hashedPassword'
      })
      .populate('teampic')
      .populate(
      {
        path: 'manager',
        select: '-salt -hashedPassword'
      })
      .populate(
      {
        path: 'members',
        select: '-salt -hashedPassword'
      })
      .populate(
      {
        path: 'coach',
        select: '-salt -hashedPassword'
      })
      .exec(cb);
  }
};

module.exports = mongoose.model('Team', TeamSchema);