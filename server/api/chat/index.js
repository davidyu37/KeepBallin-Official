'use strict';

var express = require('express');
var controller = require('./chat.controller');
var auth = require('../../auth/auth.service');


var router = express.Router();

router.post('/', auth.hasRole('admin'), controller.createRoom);
//When user leave individual chat room
router.post('/leave', controller.leaveRoom);
router.post('/load', controller.loadMessage);
router.get('/', controller.getRooms);
router.get('/:chatRoomId', auth.isAuthenticated(), controller.enterRoom);
router.delete('/:chatRoomId', auth.hasRole('admin'), controller.destroy);

module.exports = router;
