'use strict';

var _ = require('lodash');
var Lobby = require('./lobby.model');

// Get list of events
exports.index = function(req, res) {
  Lobby.find(function (err, lobby) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(lobby);
  });
};


function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}