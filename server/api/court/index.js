'use strict';

var express = require('express');
var controller = require('./court.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search', controller.searchResult);
router.get('/:id', controller.show);
router.get('/:id/ratings', controller.getRating);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;