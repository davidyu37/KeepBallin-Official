'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);
router.post('/forgot', controller.sendMail);
router.get('/', auth.hasRole('vip'), controller.index);
router.get('/search', auth.hasRole('manager'), controller.search);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id/who', auth.isAuthenticated(), controller.show);
router.get('/admin', auth.hasRole('admin'), controller.adminSearch);
router.get('/mycourt', auth.isAuthenticated(), controller.getMyCourt);

router.put('/:id/changerole', auth.hasRole('manager'), controller.changeRole);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/pro', auth.isAuthenticated(), controller.changePro);
router.put('/:id/avatar', auth.isAuthenticated(), controller.changeAvatar);
router.put('/:id', auth.isAuthenticated(), controller.changeDetail);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
