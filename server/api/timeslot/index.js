'use strict';

var express = require('express');
var controller = require('./timeslot.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);

router.get('/:id/getByCourtId', controller.getByCourtId);

// router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
