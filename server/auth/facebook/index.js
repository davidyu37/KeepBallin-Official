'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();
console.log(passport.authenticate('facebook'));
router
  // .get('/', passport.authenticate('facebook', {
  //   authType: 'rerequest',
  //   scope: 'email',
  //   failureRedirect: '/signup',
  //   session: false
  // }))
  // .get('/', function(req, res) {
  //   console.log(req.query);
  //   passport.authenticate('facebook', {
  //     authType: 'rerequest',
  //     scope: 'email',
  //     failureRedirect: '/signup',
  //     session: false,
  //   })(req, res);
  // })
  .get('/', passport.authenticate('facebook', {
      authType: 'rerequest',
      scope: 'email',
      failureRedirect: '/signup',
      session: false,
  }))
  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);

module.exports = router;