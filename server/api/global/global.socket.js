/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Global = require('./global.model');

exports.register = function(socket) {
  Global.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Global.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('global:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('global:remove', doc);
}
