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
  socket.emit('invite:save', doc);

  // Chat.populate(doc, {path:'author', select: 'name avatar'}, function(err, comment) {
  //   socket.emit('comment:save', comment);
  // });
}

function onRemove(socket, doc, cb) {
  socket.emit('court:remove', doc);
}