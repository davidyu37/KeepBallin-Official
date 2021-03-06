'use strict';

var express = require('express');
var controller = require('./team.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/search/:name', controller.checkName);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
router.put('/:id/:memberId', auth.isAuthenticated(), controller.updateInside);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;