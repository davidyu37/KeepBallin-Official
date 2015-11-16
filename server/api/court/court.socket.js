/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var court = require('./court.model');

exports.register = function(socket) {
  court.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  court.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
	doc.deepPopulate('pictures.user pictures creator lastEditedBy', function(err, _doc) {
		socket.emit('court:save', _doc);
	});
}

function onRemove(socket, doc, cb) {
  socket.emit('court:remove', doc);
}