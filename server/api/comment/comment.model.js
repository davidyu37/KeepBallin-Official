'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var CommentSchema = new Schema({
  courtId: String,
  content: String,
  date: { type: Date, default: Date.now },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

CommentSchema.plugin(deepPopulate, {
  populate: {
    'author.avatar': {
      select: 'url'
    },
    'author': {
      select: 'fbprofilepic name avatar'
    }
  }
});

CommentSchema.statics = {
  loadNow: function(start, courtId, cb) {
    this.find({'courtId': courtId})
      // .populate({path:'author', select: 'name'})
      .deepPopulate('author.avatar')
      .sort('-date')
      .skip(start)
      .limit(10)
      .exec(cb);
  },
  loadByCourtId: function(courtId, cb) {
    this.find({'courtId': courtId})
      .sort('-date')
      .exec(cb);
  }
};


module.exports = mongoose.model('Comment', CommentSchema);