'use strict';

var express = require('express');
var controller = require('./invite.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
// router.get('/', controller.index);
//Get invite by city
router.get('/:city', controller.show);
// router.put('/:id', auth.hasRole('vip'), controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;