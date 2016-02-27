'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var crypto = require('crypto');
var async = require('async');
//load email tempalte
var hogan = require('hogan.js');
var fs = require('fs');
var template = fs.readFileSync('server/api/user/forgot.hjs', 'utf-8');
var compiledTemplate = hogan.compile(template);
var sendgrid  = require('sendgrid')(config.sendgrid.apiKey);
//For user to login after pw reset
var passport = require('passport');
var auth = require('../../auth/auth.service');

//Send user the email of pw reset token
exports.sendMail = function(req, res) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, 'name', function (err, user) {
        if(err) return res.status(500).send(err);
        if(!user) {
          return res.status(200).json({nonExist: true});
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var message = '您會收到這封信是因為您(或其他人)要求密碼重設.\n\n' +
        '請點以下的連結或複製貼上至瀏覽器網頁框裡:\n\n' +
        'https://' + req.headers.host + '/reset/' + token + '\n\n' +
        '如果您沒有要求密碼重設, 請不要理會此Email, 您的密碼將不會改變.\n';
      sendgrid.send({
          to:       req.body.email,
          from:     config.email.me,
          subject:  '密碼重設',
          text:     message,
          html: compiledTemplate.render({to: user.name, message: message})
        }, function(err, json) {
          if (err) { return console.error(err); }
          return res.status(200).json(user);
      });
    }
  ], function(err) {
    if (err) { return handleError(res, err); }
    res.redirect('/forgot');
  });
};//End of send mail

//Check if token is valid
exports.checkToken = function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, 'name resetPasswordExpires', function(err, user) {
    if (err) { return handleError(res, err); }
    if (!user) {
      return res.status(200).json({expired: true});
    }
    return res.status(200).json(user);
  });
};

//Save new pw and send email
exports.resetPassword = function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.status(200).json({nonExist: true});
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          done(err, user);
        });
      });
    },
    function(user, done) {
      var message = '您的密碼已成功更改成功.\n' +
        '快去找球友一起揮灑汗水吧\n' +
        'https://' + req.headers.host + '/teammate\n' +
        '感謝您的支持與愛護.\n';
        sendgrid.send({
            to:       user.email,
            from:     config.email.me,
            subject:  '密碼更新成功',
            text:     message,
            html: compiledTemplate.render({to: user.name, message: message})
          }, function(err, json) {
            if (err) { return console.error(err); }
            return res.status(200).json(user);
        });
    }
  ], function(err) {
    res.redirect('/');
  });
};


var validationError = function(res, err) {
  return res.status(422).json(err);
};

exports.index = function(req, res) {
  User.find({}, 'name', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Get list of users
 * restriction: 'admin'
 */

exports.adminSearch = function(req, res) {
  User.adminSearch(function (err, users) {
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
  newUser.role = 'vip';
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
