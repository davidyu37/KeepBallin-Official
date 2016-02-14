'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
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
  repeat: Boolean,
  repeatDay: String,
  repeatEndDate: Date,
  info: String,
  location: String,
  court: {
  	type: Schema.ObjectId,
    ref: 'Court'
  },
  participants: [{
  	type: Schema.ObjectId,
    ref: 'User',
    childPath: 'eventsJoined'
  }],
  peopleNeed: Number
});

// InviteSchema.plugin(deepPopulate, {
//   populate: {
//     'author.avatar': {
//       select: 'url'
//     },
//     'author': {
//       select: 'fbprofilepic name avatar'
//     }
//   }
// });

// InviteSchema.statics = {
//   loadNow: function(start, courtId, cb) {
//     this.find({'courtId': courtId})
//       // .populate({path:'author', select: 'name'})
//       .deepPopulate('author.avatar')
//       .sort('-date')
//       .skip(start)
//       .limit(10)
//       .exec(cb);
//   },
//   loadByCourtId: function(courtId, cb) {
//     this.find({'courtId': courtId})
//       .sort('-date')
//       .exec(cb);
//   }
// };


module.exports = mongoose.model('Invite', InviteSchema);