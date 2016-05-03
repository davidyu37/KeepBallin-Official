/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Timeslot = require('./timeslot.model');

exports.register = function(socket) {
  Timeslot.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Timeslot.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
	//Update only the timeslots of the court
  	socket.emit('timeslot' + doc.courtReserved + ':save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('timeslot' + doc.courtReserved + ':remove', doc);
}
