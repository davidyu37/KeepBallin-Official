'use strict';

var _ = require('lodash');
var invite = require('./invite.model');

// Creates a new invite in the DB.
exports.create = function(req, res) {
  //Attach user's id to invite's info
  var userId = { creator: req.user._id };
  var newinvite = _.merge(req.body, userId);
  invite.create(newinvite, function(err, invite) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(invite);
  });
};

// // Get invites by city name
exports.show = function(req, res) {
  invite.findByCity(req.params.city, function (err, invite) {
    if(err) { return handleError(res, err); }
    if(!invite) { return res.status(404).send('Not Found'); }
    return res.json(invite);
  });
};

// // Get list of invites
// exports.index = function(req, res) {
//   invite.findAndPopulate(function (err, invites) {
//     if(err) { return handleError(res, err); }
//     return res.status(200).json(invites);
//   });
// };


// exports.choseninvite = function(req, res) {
//   invite.findOneAndPopulate(req.params.id, function (err, invite) {
//     if(err) { return handleError(res, err); }
//     if(!invite) { return res.status(404).send('Not Found'); }
   
//     return res.json(invite);
//   });
// };

// // Get ratings of the invite
// exports.getRating = function(req, res) {
//   invite.getRatings(req.params.id, function (err, invite) {
//     if(err) { return handleError(res, err); }
//     if(!invite) { return res.status(404).send('Not Found'); }
//     return res.json(invite);
//   });
// };

// exports.searchResult = function(req, res) {
//   invite.search(req.query, function (err, invites) {
//     if(err) { return handleError(res, err); }
//     return res.status(200).json(invites);
//   });
// }



// // Updates an existing invite in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   invite.findById(req.params.id, function (err, invite) {
//     if (err) { return handleError(res, err); }
//     if(!invite) { return res.status(404).send('Not Found'); }
//      //Attach user's id to invite's info
//     var userId = { lastEditedBy: req.user._id };
//     var newinvite = _.merge(req.body, userId);
//     var updated = _.merge(invite, newinvite);
//     updated.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.status(200).json(invite);
//     });
//   });
// };

// // Deletes a invite from the DB.
// exports.destroy = function(req, res) {
//   invite.findById(req.params.id, function (err, invite) {
//     if(err) { return handleError(res, err); }
//     if(!invite) { return res.status(404).send('Not Found'); }
//     invite.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.status(204).send('No Content');
//     });
//   });
// };

function handleError(res, err) {
  console.error(err);
  return res.status(500).send(err);
}