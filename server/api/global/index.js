'use strict';

var express = require('express');
var controller = require('./global.controller');
var auth = require('../../auth/auth.service');


var router = express.Router();

router.get('/', controller.loadOrCreate);
router.post('/enter', controller.enterRoom);

router.post('/load', controller.loadMessage);

//Delete message, only for manager or higher
router.post('/delete', auth.hasRole('manager'), controller.destroy);

module.exports = router;
