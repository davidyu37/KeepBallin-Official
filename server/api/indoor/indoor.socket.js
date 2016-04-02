'use strict';

var Indoor = require('./indoor.model');

exports.register = function(socket) {
  Indoor.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Indoor.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

// function onSave(socket, doc, cb) { 
//   doc.deepPopulate('creator.avatar creator participants.avatar participants', function(err, _doc) {
//     socket.emit('indoor:save', doc);
//   });
// }

// function onRemove(socket, doc, cb) {
//   socket.emit('indoor:remove', doc);
// }

function onSave(socket, doc, cb) {
  socket.emit('indoor:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('indoor:remove', doc);
}