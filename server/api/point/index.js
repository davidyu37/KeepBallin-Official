'use strict';

var express = require('express');
var controller = require('./point.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();
router.post('/', auth.hasRole('admin'), controller.add);

module.exports = router;