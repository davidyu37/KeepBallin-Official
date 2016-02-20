'use strict';

var Invite = require('./invite.model');

exports.register = function(socket) {
  Invite.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Invite.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) { 
  doc.deepPopulate('creator.avatar creator participants.avatar participants', function(err, _doc) {
    socket.emit('invite:save', doc);
  });
}

function onRemove(socket, doc, cb) {
  socket.emit('court:remove', doc);
}