'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var relationship = require('mongoose-relationship');

var TeamSchema = new Schema({
  name: String,
  captain: {
  	type: Schema.Types.ObjectId, 
  	ref: 'User'
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
  manager: {
    type: Schema.Types.Mixed,
    name: String, 
    ref: 'User'
  },
  coach: {
    type: Schema.Types.Mixed,
    name: String, 
    ref: 'User'
  },
  win: Number,
  lose: Number,
  members: [{
  	type: Schema.Types.Mixed,
    name: String, 
  	ref: 'User'
  }],
  contact: String,
  contactperson: {
    type: Schema.Types.Mixed, 
    ref: 'User',
    name: String
  },
  owner: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    childPath: 'team'
  }
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