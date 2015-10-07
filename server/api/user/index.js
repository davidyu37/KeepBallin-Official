'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/search', auth.isAuthenticated(), controller.search);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id/changerole', auth.hasRole('admin'), controller.changeRole);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', controller.getUser);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/name', auth.isAuthenticated(), controller.changeName);
router.put('/:id/email', auth.isAuthenticated(), controller.changeEmail);
router.put('/:id/avatar', auth.isAuthenticated(), controller.changeAvatar);
router.put('/:id', auth.isAuthenticated(), controller.changeDetail);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
