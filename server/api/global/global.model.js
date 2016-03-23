'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
  date: { type: Date, default: Date.now },
  message: String,
  by: String
});


var GlobalSchema = new Schema({
  country: String,
  usersOnline: [String],
  messages: [MessageSchema]
});


GlobalSchema.statics = {
  //Find or create a global chat room
  loadInitialRoom: function(cb) {
    this.find(function(err, room) {
      if(err) {
        console.error(err);
        return;
      }
      if(!room[0]) {
        console.log('global doesn\'t exist, create global...');
        var global = new Global();
        global.country = 'Taiwan';
        global.save(function(err, saved) {
          console.log('new global created');
        });
      } else {
        //Global already exist load the messages
        //Sort the messages based on date
        room[0].messages.sort(compare);
        //keep the first five messages
        room[0].messages = room[0].messages.slice(0, 10);
        //Send this room[0] to client
        cb(room[0]);
      }
    });//find ends
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
      console.log('number of messages after async', indexOfOldestMessageNow + room2.messages.length);
      //Send to client
      cb(room2);
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

        room.messages.unshift(room1.messages[0]);
        cb(room);
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

var Global = mongoose.model('Global', GlobalSchema);

module.exports = Global;