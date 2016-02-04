'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');
var socket = require('socket.io')();

// Passport Configuration
require('./local/passport').setup(User, config, socket);
require('./facebook/passport').setup(User, config, socket);
require('./google/passport').setup(User, config, socket);

var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/google', require('./google'));

module.exports = router;