'use strict';

var express = require('express');
var controller = require('./reservation.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);

//Show a list of reservation for the user
router.get('/getByUser', auth.isAuthenticated(), controller.getByUser);

router.get('/:id', auth.isAuthenticated(), controller.show);

router.post('/', auth.isAuthenticated(), controller.create);

//Check in
router.post('/:id/checkIn', auth.isAuthenticated(), controller.checkIn);
//Check out
router.post('/:id/checkOut', auth.isAuthenticated(), controller.checkOut);

module.exports = router;
