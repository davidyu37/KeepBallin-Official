'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);
//Send email for forgot pw
router.post('/forgot', controller.sendMail);
//Token pw reset
router.post('/token/:token', controller.resetPassword);
router.get('/', controller.index);
//Check if token is valid for forgot pw
router.get('/token/:token', controller.checkToken);
router.get('/confirmEmail/:token', controller.confirmEmail);
router.get('/search', auth.hasRole('manager'), controller.search);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id/who', auth.isAuthenticated(), controller.show);
router.get('/admin', auth.hasRole('admin'), controller.adminSearch);
router.get('/mycourt', auth.isAuthenticated(), controller.getMyCourt);
router.get('/getNameOnly', controller.getNameOnly);
router.get('/rentals', auth.isAuthenticated(), controller.getRentals);

router.put('/:id/changerole', auth.hasRole('manager'), controller.changeRole);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/pro', auth.isAuthenticated(), controller.changePro);
router.put('/:id/avatar', auth.isAuthenticated(), controller.changeAvatar);
router.put('/:id', auth.isAuthenticated(), controller.changeDetail);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
