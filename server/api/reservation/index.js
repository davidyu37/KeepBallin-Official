'use strict';

var express = require('express');
var controller = require('./reservation.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);

router.get('/:id', auth.isAuthenticated(), controller.show);

router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
