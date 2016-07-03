'use strict';

var express = require('express');
var controller = require('./checkout.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/complete', controller.complete);

module.exports = router;