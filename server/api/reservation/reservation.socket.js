/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Reservation = require('./reservation.model');

exports.register = function(socket) {
  Reservation.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Reservation.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('reservation:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('reservation:remove', doc);
}
