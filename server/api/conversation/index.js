'use strict';

var express = require('express');
var controller = require('./conversation.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/get_mail', auth.isAuthenticated(), controller.getMails);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/:id/changeToRead', auth.isAuthenticated(), controller.changeToRead);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;