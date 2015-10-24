'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
// var sendgrid  = require('sendgrid')(config.sendgrid.apiKey);

// console.log(config.sendgrid.apiKey);

// sendgrid.send({
//   to:       'example@example.com',
//   from:     'other@example.com',
//   subject:  'Hello World',
//   text:     'My first email through SendGrid.'
// }, function(err, json) {
//   if (err) { return console.error(err); }
//   console.log(json);
// });

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

//Get the courts related to the user
exports.getMyCourt = function(req, res, next) {
  var userId = req.user._id;
  User.getMyCourt(userId, function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  })
};

//Search params
exports.search = function(req, res) {
  User.managerSearch(function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  if (req.body.toVip) {
    newUser.role = 'vip'
  } else {
    newUser.role = 'user';
  }
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, '-salt -hashedPassword', function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

//Change avatar
exports.changeAvatar = function(req, res, next) {
  var userId = req.user._id;
  var newPic = String(req.body.newPic);

  User.findById(userId, function (err, user) {
    if (err) return console.error(err);
    user.avatar = newPic;
    user.save(function(err) {
      if(err) return console.error(err);
      res.status(200).send('OK');
    })
  });
};

// Update user's profession

exports.changePro = function(req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    //New profession
    user.profession = req.body.profession;
    var updated = user;
    //markModified is necessary for array
    updated.markModified('profession');
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
}

/* Update the user's detail */

exports.changeDetail = function(req, res, next) {
  var userId = req.user._id;
  if(req.body._id) { delete req.body._id; }
  User.findById(userId, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
}
//Change role restricted to admin
exports.changeRole = function(req, res, next) {
  var userId = req.params.id;
  var role = String(req.body.role);

  User.findById(userId, function (err, user) {
    if (err) return console.error(err);
    user.role = role;
    user.save(function(err) {
      if(err) return console.error(err);
      res.status(200).send('OK');
    })
  });
}


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findByIdAndPopulate({
    _id: userId
  }, function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/* Get user by id */
// exports.getUser = function(req, res, next) {
//   var userId = req.params.id;
//   User.findOne({
//     _id: userId
//   }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
//     if (err) return next(err);
//     if (!user) return res.status(401).send('Unauthorized');
//     res.json(user);
//   });
// };

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}
