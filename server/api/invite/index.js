'use strict';

var express = require('express');
var controller = require('./invite.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();
//Get all the invites
router.get('/', controller.index);
//Group and count by city
router.get('/findAll', controller.getAll);
//Create invite
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