'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var LobbySchema = new Schema({
  userOnline: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// LobbySchema.plugin(deepPopulate, {
//   populate: {
//     'author.avatar': {
//       select: 'url'
//     },
//     'author': {
//       select: 'fbprofilepic name avatar'
//     }
//   }
// });

// LobbySchema.statics = {
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


module.exports = mongoose.model('Lobby', LobbySchema);