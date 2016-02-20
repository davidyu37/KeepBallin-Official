'use strict';

var express = require('express');
var controller = require('./invite.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
//Adding user to the invite
router.post('/:id/addOne', auth.isAuthenticated(), controller.add);
//Remove user from invite
router.post('/:id/minusOne', auth.isAuthenticated(), controller.minus);
//Get invite by city
router.get('/:city', controller.show);
// router.get('/', controller.index);
// router.put('/:id', auth.hasRole('vip'), controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;