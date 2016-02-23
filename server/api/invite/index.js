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
//Update invite
router.put('/:id', auth.isAuthenticated(), controller.update);
// Delete invite
router.delete('/:id', controller.destroy);

module.exports = router;