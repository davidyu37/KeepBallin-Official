'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship"),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    _ = require('lodash');
var PointSchema = new Schema({
	Points: {
    type: Number,
    default: 0
  },
	User: {
		type: Schema.ObjectId,
    ref: 'User',
    childPath: 'points'
	}
});

// //Record the user of the points
PointSchema.plugin(relationship, { relationshipPathName:'User' });

PointSchema.statics = {
  //Get points by user
  getPointsAndUpdate: function(userId, points, cb) {
    var Model = this;
    this.findOne({User: userId}, function(err, data) {
      if(err) { console.log(err); }
      if(!data) {
        //If the user buys points the first time
        var newPoints = new Model();
        newPoints.Points += points;
        newPoints.User = userId;
        newPoints.save(function(err, newData) {
          if(err) { console.log(err); }
          cb(newPoints);
        }); 
      } else {
        //Add to the points of the user
        data.Points += points;
        data.save(function(err, newData) {
          if(err) { console.log(err); }
          cb(data);
        }); 
      }
    });
  },
  findPointByUser: function(userId, cb) {
    this.findOne({User: userId}, function(err, data) {
      if(err) { console.log(err); }
      if(!data) {
        var error = 'user got no points';
        cb(error);
      } else {
        cb(null, data);
      }
    });
  }
};

module.exports = mongoose.model('Point', PointSchema);