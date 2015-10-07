/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Upload = require('./upload.model');

exports.register = function(socket) {
  Upload.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Upload.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
	var binaryData = {
		image: true,
		courtId: doc.courtId,
		filename: doc.filename,
		url: doc.url,
		// buffer: doc.buffer,
		mimetype: doc.mimetype,
		_id: doc._id
	};
  socket.emit('upload:save', binaryData);
}

function onRemove(socket, doc, cb) {
  socket.emit('upload:remove', doc);
}