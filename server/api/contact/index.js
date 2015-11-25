'use strict';

var express = require('express');
var controller = require('./contact.controller');

var router = express.Router();

router.post('/', controller.create);
router.post('/invite', controller.invite);
// router.get('/', controller.index);
// router.get('/:id', controller.show);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;