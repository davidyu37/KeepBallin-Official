'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var MessageSchema = new Schema({
  date: { type: Date, default: Date.now },
  message: String,
  from: {
  	type: Schema.ObjectId,
    ref: 'User'
  },
  to: {
  	type: Schema.ObjectId,
    ref: 'User'
  }
});


var ConversationSchema = new Schema({
  date: { type: Date, default: Date.now },
  messages: [MessageSchema],
  participants: [{
  	type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: [{
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    read: {type: Boolean, default: false}
  }]
});

ConversationSchema.plugin(deepPopulate, {
  populate: {
    'messages.from': {
      select: 'name'
    },
    'messages.to': {
      select: 'name'
    },
    'messages': {
      select: 'from to message date'
    },
    'participants.avatar': {
      select: 'url'
    },
    'participants': {
      select: 'name avatar'
    }
  }
});

ConversationSchema.statics = {
  findByParticipants: function(participants, cb) {
    this.findOne()
    .and([{'participants': participants[0]},{'participants': participants[1]}])
      // .populate({path:'author', select: 'name'})
    .exec(cb);
  },
  findConvoByUser: function(user, cb) {
    this.find({'participants': user})
      .deepPopulate('messages.from messages.to messages participants.avatar participants')
      .sort('-date')
      .exec(cb);
  }
};

module.exports = mongoose.model('Conversation', ConversationSchema);