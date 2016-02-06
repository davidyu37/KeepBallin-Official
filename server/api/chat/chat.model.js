'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var MessageSchema = new Schema({
  date: { type: Date, default: Date.now },
  message: String,
  by: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});


var ChatSchema = new Schema({
  city: String,
  district: String,
  country: String,
  usersOnline: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  messages: [MessageSchema]
});

ChatSchema.plugin(deepPopulate, {
  populate: {
    // 'usersOnline.avatar': {
    //   select: 'url'
    // },
    // 'usersOnline': {
    //   select: 'fbprofilepic name avatar'
    // },
    'messages.by': {
      select: 'name avatar'
    }
    // 'messages': {
    //   select: 'message dateSent by',
    //   options: {
    //     limit: 5
    //   }
    // },
    // 'messages.by.avatar': {
    //   select: 'url'
    // }
  }
});

ChatSchema.statics = {
  loadInitialRoom: function(roomId, userId, cb) {
    this.findById(roomId, function(err, room) {
      if(err) {
        console.error(err);
        return;
      }
      if(!room) {
        console.log('room doesn\'t exist', room);
        return;
      }
      //First update the online user number
      console.log('user doesnt exist in the room yet', room.usersOnline.indexOf(userId) < 0);
      if(room.usersOnline.indexOf(userId) < 0) {
          room.usersOnline.push(userId);
      }
      room.save(function (err) {
        //Sort the messages based on date
        room.messages.sort(compare);
        //keep the first five messages
        room.messages = room.messages.slice(0, 10);
        //populate the messages
        room.deepPopulate('messages.by', function(err, sendToClient) {
              //Send to client
              cb(sendToClient);
        });//deepPopulate ends
      });//room.save ends
    });//findById ends
  },
  //Load ten more messages
  asyncLoadMessages: function(room, cb) {
    this.findById(room._id, function(err, room2) {
      var indexOfOldestMessageNow = room.messages.length;
      //Sort messages according to date
      room2.messages.sort(compare);
      console.log('index', indexOfOldestMessageNow);
      //send 10 more message start the index of oldest message
      room2.messages = room2.messages.slice(indexOfOldestMessageNow, (indexOfOldestMessageNow + 10));
      // populate the messages
      room2.deepPopulate('messages.by', function(err, sendToClient) {
          console.log('number of messages after async', indexOfOldestMessageNow + sendToClient.messages.length);
          //Send to client
          cb(sendToClient);
      });//deepPopulate ends
    });//findById ends
  },
  //Save all the messages to db, but only add the newest message for the client
  saveMessage: function(room, message, cb) {
    //First find the room
    this.findById(room._id, function(err, room1) {
      if(err) { console.error(err); return; }
      //Then add the new message
      room1.messages.push(message);
      //Then save it
      room1.save(function(err) {
        if(err) { console.error(err); return; }
        //Sort the messages based on date
        room1.messages.sort(compare);
        //Get the newest message
        room1.messages = room1.messages.slice(0, 1);
        //Populate the newest message
        room1.deepPopulate('messages.by', function(err, populated) {
          if(err) { console.error(err); return; }
          //Add the newest message to the existing room that user is looking at now
          room.messages.unshift(room1.messages[0]);
          cb(room);
        });//Deep populate ends
      }); // Saving to DB ends
    });
  }
};
//sort by date for native array sort
//message with newer date will have smaller index
function compare(a,b) {
  if (a.date > b.date)
    return -1;
  else if (a.date < b.date)
    return 1;
  else 
    return 0;
}

module.exports = mongoose.model('Chat', ChatSchema);