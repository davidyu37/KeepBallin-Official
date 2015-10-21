'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');
var config = require('../../config/environment');
var sendgrid  = require('sendgrid')(config.sendgrid.apiKey);

// Creates a new contact in the DB.
exports.create = function(req, res) {
  Contact.create(req.body, function(err, contact) {
    if(err) { return handleError(res, err); }
    sendgrid.send({
      to:       config.email.me,
      from:     req.body.email,
      subject:  req.body.name,
      text:     req.body.comment
    }, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
      return res.status(201).json(contact);
    });
  });
};

// // Get list of contacts
// exports.index = function(req, res) {
//   Contact.find(function (err, contacts) {
//     if(err) { return handleError(res, err); }
//     return res.status(200).json(contacts);
//   });
// };

// // Get a single contact
// exports.show = function(req, res) {
//   Contact.findById(req.params.id, function (err, contact) {
//     if(err) { return handleError(res, err); }
//     if(!contact) { return res.status(404).send('Not Found'); }
//     return res.json(contact);
//   });
// };


// // Updates an existing contact in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   Contact.findById(req.params.id, function (err, contact) {
//     if (err) { return handleError(res, err); }
//     if(!contact) { return res.status(404).send('Not Found'); }
//     var updated = _.merge(contact, req.body);
//     updated.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.status(200).json(contact);
//     });
//   });
// };

// // Deletes a contact from the DB.
// exports.destroy = function(req, res) {
//   Contact.findById(req.params.id, function (err, contact) {
//     if(err) { return handleError(res, err); }
//     if(!contact) { return res.status(404).send('Not Found'); }
//     contact.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.status(204).send('No Content');
//     });
//   });
// };

function handleError(res, err) {
  return res.status(500).send(err);
}