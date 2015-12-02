/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Team = require('./team.model');

exports.register = function(socket) {
  Team.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Team.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {  
	doc.deepPopulate('members.account.avatar members.account members teampic owner owner.avatar', function(err, _doc) {
		socket.emit('team:save', _doc);
	});
}

function onRemove(socket, doc, cb) {
  socket.emit('team:remove', doc);
}