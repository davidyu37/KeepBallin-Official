'use strict';

var express = require('express');
var controller = require('./global.controller');
var auth = require('../../auth/auth.service');


var router = express.Router();

router.get('/', controller.loadOrCreate);
router.post('/enter', controller.enterRoom);
// router.post('/send', controller.sendMessage);
router.post('/load', controller.loadMessage);
// router.post('/', auth.hasRole('admin'), controller.createRoom);
// //Update global room
// router.put('/:globalRoomId', auth.hasRole('admin'), controller.update);
// //When user leave individual global room
// router.post('/leave', controller.leaveRoom);
// router.get('/:globalRoomId', auth.isAuthenticated(), controller.enterRoom);
// router.delete('/:globalRoomId', auth.hasRole('admin'), controller.destroy);

module.exports = router;
