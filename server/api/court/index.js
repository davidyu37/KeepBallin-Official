'use strict';

var express = require('express');
var controller = require('./court.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id/chosenCourt', controller.chosenCourt)
router.get('/search', controller.searchResult);
router.get('/:id', controller.show);
router.get('/:id/ratings', controller.getRating);
router.post('/', auth.hasRole('vip'), controller.create);
router.put('/:id', auth.hasRole('vip'), controller.update);
router.put('/:id/increaseView', controller.increaseView);
router.delete('/:id', controller.destroy);

module.exports = router;